import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import { SpecService } from '../spec/spec.service';
import { QualityService } from '../quality/quality.service';

@Injectable()
export class QueueService {
  private connection: IORedis;
  private specQueue: Queue;
  private qualityQueue: Queue;
  private docsQueue: Queue;
  private specWorker: Worker;
  private qualityWorker: Worker;
  private docsWorker: Worker;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => SpecService))
    private readonly specService: SpecService,
    private readonly qualityService: QualityService,
  ) {
    this.connection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

    this.initializeQueues();
    this.initializeWorkers();
  }

  private initializeQueues() {
    this.specQueue = new Queue('spec-processing', { connection: this.connection });
    this.qualityQueue = new Queue('quality-analysis', { connection: this.connection });
    this.docsQueue = new Queue('docs-generation', { connection: this.connection });
  }

  private initializeWorkers() {
    // Spec processing worker
    this.specWorker = new Worker(
      'spec-processing',
      async (job) => {
        const { type, projectId } = job.data;

        switch (type) {
          case 'generate-spec':
            try {
              console.log(`Generating OpenAPI spec for project ${projectId}`);
              
              // Get all captures for the project
              const captures = await this.prisma.capture.findMany({
                where: { projectId },
                orderBy: { createdAt: 'desc' }
              });

              if (captures.length === 0) {
                throw new Error('No captures found for project');
              }

              // Generate OpenAPI spec from captures
              const specData = await this.specService.generateFromCaptures(captures);
              
              // Save the generated spec to database
              const spec = await this.prisma.specFile.create({
                data: {
                  projectId,
                  filename: `openapi-v${job.data.version || '1.0.0'}.yaml`,
                  content: specData,
                  version: job.data.version || '1.0.0',
                  isActive: true,
                }
              });

              console.log(`Generated spec ${spec.id} for project ${projectId}`);
              
              // Queue quality analysis job
              await this.addQualityJob('analyze-spec', { 
                projectId, 
                specId: spec.id,
                specContent: specData 
              });
              
              return { specId: spec.id, status: 'completed' };
            } catch (error) {
              console.error(`Failed to generate spec for project ${projectId}:`, error);
              throw error;
            }

          case 'validate-spec':
            try {
              console.log(`Validating spec for project ${projectId}`);
              
              const spec = await this.prisma.specFile.findFirst({
                where: { projectId },
                orderBy: { createdAt: 'desc' }
              });

              if (!spec) {
                throw new Error('No spec found for validation');
              }

              // Validate the OpenAPI spec using the spec service
              const validationResult = await this.specService.validateSpec(spec.content);
              
              await this.prisma.specFile.update({
                where: { id: spec.id },
                data: { 
                  // TODO: Add status field update once schema is properly synced
                  // status: validationResult.isValid ? 'VALIDATED' : 'INVALID',
                }
              });

              return { 
                specId: spec.id, 
                isValid: validationResult.isValid, 
                errors: validationResult.errors 
              };
            } catch (error) {
              console.error(`Failed to validate spec for project ${projectId}:`, error);
              throw error;
            }

          case 'generate-sdk':
            try {
              console.log(`Generating SDK for project ${projectId}`);
              
              const spec = await this.prisma.specFile.findFirst({
                where: { projectId },
                orderBy: { createdAt: 'desc' }
              });

              if (!spec) {
                throw new Error('No validated spec found for SDK generation');
              }

              // Generate SDK files (placeholder implementation)
              const sdkFiles = await this.generateSDKFiles(spec.content, job.data.language || 'typescript');
              
              return { sdkFiles, status: 'completed' };
            } catch (error) {
              console.error(`Failed to generate SDK for project ${projectId}:`, error);
              throw error;
            }

          default:
            throw new Error(`Unknown spec job type: ${type}`);
        }
      },
      { connection: this.connection }
    );

    // Quality analysis worker
    this.qualityWorker = new Worker(
      'quality-analysis',
      async (job) => {
        const { type, projectId, specId, specContent } = job.data;

        switch (type) {
          case 'analyze-spec':
            try {
              console.log(`Analyzing quality for spec ${specId}`);
              
              // Perform quality analysis
              const qualityReport = await this.qualityService.analyzeSpec(specContent);
              
              // Save quality report to database
              await this.prisma.qualityReport.create({
                data: {
                  specId,
                  projectId,
                  overallScore: qualityReport.overallScore,
                  lintingScore: qualityReport.linting.score,
                  securityScore: qualityReport.security.score,
                  performanceScore: qualityReport.performance.score,
                  report: JSON.parse(JSON.stringify(qualityReport)),
                }
              });

              console.log(`Quality analysis completed for spec ${specId}`);
              return { qualityReport, status: 'completed' };
            } catch (error) {
              console.error(`Failed to analyze quality for spec ${specId}:`, error);
              throw error;
            }

          default:
            throw new Error(`Unknown quality job type: ${type}`);
        }
      },
      { connection: this.connection }
    );

    // Documentation generation worker
    this.docsWorker = new Worker(
      'docs-generation',
      async (job) => {
        const { projectId, specContent } = job.data;
        
        try {
          console.log(`Generating docs for project ${projectId}`);
          
          // TODO: Implement docs generation using redocly
          const docsHtml = await this.generateDocsFromSpec(specContent);
          
          return { docsHtml, status: 'completed' };
        } catch (error) {
          console.error(`Failed to generate docs for project ${projectId}:`, error);
          throw error;
        }
      },
      { connection: this.connection }
    );
  }

  // Helper methods for adding jobs
  async addSpecJob(type: string, data: any) {
    return this.specQueue.add(type, { type, ...data }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addQualityJob(type: string, data: any) {
    return this.qualityQueue.add(type, { type, ...data }, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async addDocsJob(data: any) {
    return this.docsQueue.add('generate-docs', data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  // Placeholder implementations for SDK and docs generation
  private async generateSDKFiles(specContent: any, language: string): Promise<string[]> {
    // TODO: Implement actual SDK generation using openapi-generator or similar
    console.log(`Generating ${language} SDK from OpenAPI spec`);
    return [`${language}-client.ts`, `${language}-types.ts`];
  }

  private async generateDocsFromSpec(specContent: any): Promise<string> {
    // TODO: Implement actual docs generation using redocly or similar
    console.log('Generating documentation from OpenAPI spec');
    return '<html><body><h1>API Documentation</h1></body></html>';
  }

  // Cleanup method
  async cleanup() {
    await this.specWorker.close();
    await this.qualityWorker.close();
    await this.docsWorker.close();
    await this.connection.quit();
  }
}
