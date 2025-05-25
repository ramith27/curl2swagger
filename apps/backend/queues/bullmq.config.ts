import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '../src/database/prisma.service';

// Parse Redis URL or use individual host/port
let redisConfig: any;
if (process.env.REDIS_URL) {
  redisConfig = process.env.REDIS_URL;
} else {
  redisConfig = {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
}

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

// Create service instances
const prismaService = new PrismaService();

// Queue for spec generation and processing
export const specQueue = new Queue('spec-processing', { connection });

// Queue for documentation generation
export const docsQueue = new Queue('docs-generation', { connection });

// Worker for spec processing
export const specWorker = new Worker(
  'spec-processing',
  async (job) => {
    const { type, projectId, captures } = job.data;

    switch (type) {
      case 'generate-spec':
        try {
          console.log(`Generating OpenAPI spec for project ${projectId}`);
          
          // Get all captures for the project
          const projectCaptures = await prismaService.capture.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
          });

          if (projectCaptures.length === 0) {
            throw new Error('No captures found for project');
          }

          // Generate OpenAPI spec from captures
          const specData = await generateSpecFromCaptures(projectCaptures);
          
          // Save the generated spec to database
          const spec = await prismaService.spec.create({
            data: {
              projectId,
              version: '1.0.0',
              content: specData,
              status: 'GENERATED',
            }
          });

          console.log(`Generated spec ${spec.id} for project ${projectId}`);
          
          // Queue quality analysis job
          await addQualityJob('analyze-spec', { 
            projectId, 
            specId: spec.id,
            specContent: specData 
          });
          
          return { specId: spec.id, status: 'completed' };
        } catch (error) {
          console.error(`Failed to generate spec for project ${projectId}:`, error);
          throw error;
        }
        break;

      case 'validate-spec':
        try {
          console.log(`Validating spec for project ${projectId}`);
          
          const spec = await prismaService.spec.findFirst({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
          });

          if (!spec) {
            throw new Error('No spec found for validation');
          }

          // Validate the OpenAPI spec
          const validationResult = await validateOpenAPISpec(spec.content);
          
          await prismaService.spec.update({
            where: { id: spec.id },
            data: { 
              status: validationResult.isValid ? 'VALIDATED' : 'INVALID',
              validationErrors: validationResult.errors || null
            }
          });

          return { specId: spec.id, isValid: validationResult.isValid, errors: validationResult.errors };
        } catch (error) {
          console.error(`Failed to validate spec for project ${projectId}:`, error);
          throw error;
        }
        break;

      case 'generate-sdk':
        try {
          console.log(`Generating SDK for project ${projectId}`);
          
          const spec = await prismaService.spec.findFirst({
            where: { projectId, status: 'VALIDATED' },
            orderBy: { createdAt: 'desc' }
          });

          if (!spec) {
            throw new Error('No validated spec found for SDK generation');
          }

          // Generate SDK files (placeholder implementation)
          const sdkFiles = await generateSDKFiles(spec.content, job.data.language || 'typescript');
          
          return { sdkFiles, status: 'completed' };
        } catch (error) {
          console.error(`Failed to generate SDK for project ${projectId}:`, error);
          throw error;
        }
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  { connection }
);

// Worker for docs generation
export const docsWorker = new Worker(
  'docs-generation',
  async (job) => {
    const { projectId, specContent } = job.data;
    
    // TODO: Implement docs generation using redocly
    console.log(`Generating docs for project ${projectId}`);
  },
  { connection }
);

// Helper functions to add jobs
export const addSpecJob = (type: string, data: any) => {
  return specQueue.add(type, { type, ...data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

export const addDocsJob = (data: any) => {
  return docsQueue.add('generate-docs', data, {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
};
