import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SchemaInference } from '@curl2swagger/infer';
import * as YAML from 'yaml';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

@Injectable()
export class SpecService {
  private readonly logger = new Logger(SpecService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateFromProject(projectId: string): Promise<string> {
    // Get all captures for the project
    const captures = await this.prisma.capture.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    if (captures.length === 0) {
      throw new Error('No captures found for project');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    return this.generateFromCaptures(captures, {
      title: project?.name || 'Generated API',
      description: project?.description || 'Generated from cURL commands',
    });
  }

  async generateFromCaptures(
    captures: any[],
    options: { title: string; description?: string } = { title: 'Generated API' }
  ): Promise<string> {
    try {
      // Extract unique servers
      const servers = this.extractServers(captures);
      
      // Group captures by endpoint
      const endpoints = this.groupCapturesByEndpoint(captures);
      
      // Build paths
      const paths = await this.buildPaths(endpoints);
      
      // Build schemas from request/response data
      const schemas = await this.buildSchemas(captures);

      const spec: OpenAPISpec = {
        openapi: '3.0.3',
        info: {
          title: options.title,
          version: '1.0.0',
          description: options.description,
        },
        servers,
        paths,
        components: {
          schemas,
          securitySchemes: this.inferSecuritySchemes(captures),
        },
      };

      return YAML.stringify(spec, null, { indent: 2 });
    } catch (error) {
      this.logger.error('Failed to generate spec from captures', error);
      throw new Error(`Spec generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractServers(captures: any[]): Array<{ url: string; description?: string }> {
    const serverUrls = new Set<string>();
    
    captures.forEach(capture => {
      try {
        const url = new URL(capture.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        serverUrls.add(baseUrl);
      } catch (error) {
        this.logger.warn(`Invalid URL in capture: ${capture.url}`);
      }
    });

    return Array.from(serverUrls).map(url => ({
      url,
      description: `API Server`,
    }));
  }

  private groupCapturesByEndpoint(captures: any[]): Map<string, any[]> {
    const endpoints = new Map<string, any[]>();

    captures.forEach(capture => {
      try {
        const url = new URL(capture.url);
        const path = url.pathname;
        const method = capture.method.toLowerCase();
        const key = `${method}:${path}`;

        if (!endpoints.has(key)) {
          endpoints.set(key, []);
        }
        endpoints.get(key)!.push(capture);
      } catch (error) {
        this.logger.warn(`Invalid URL in capture: ${capture.url}`);
      }
    });

    return endpoints;
  }

  private async buildPaths(endpoints: Map<string, any[]>): Promise<Record<string, any>> {
    const paths: Record<string, any> = {};

    for (const [key, captures] of endpoints) {
      const [method, path] = key.split(':');
      
      if (!paths[path]) {
        paths[path] = {};
      }

      // Build operation for this method/path
      const operation = await this.buildOperation(captures);
      paths[path][method] = operation;
    }

    return paths;
  }

  private async buildOperation(captures: any[]): Promise<any> {
    const firstCapture = captures[0];
    const method = firstCapture.method.toUpperCase();
    
    // Extract parameters from URL
    const parameters = this.extractParameters(captures);
    
    // Build request body if applicable
    const requestBody = await this.buildRequestBody(captures);
    
    // Build responses
    const responses = await this.buildResponses(captures);

    const operation: any = {
      summary: `${method} operation`,
      description: `Generated from ${captures.length} cURL command(s)`,
      parameters,
      responses: responses || {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        }
      },
    };

    if (requestBody) {
      operation.requestBody = requestBody;
    }

    return operation;
  }

  private extractParameters(captures: any[]): any[] {
    const parameters: any[] = [];
    const pathParams = new Set<string>();
    const queryParams = new Map<string, string[]>();

    captures.forEach(capture => {
      try {
        const url = new URL(capture.url);
        
        // Extract query parameters
        url.searchParams.forEach((value, key) => {
          if (!queryParams.has(key)) {
            queryParams.set(key, []);
          }
          queryParams.get(key)!.push(value);
        });

        // Extract path parameters (basic pattern detection)
        const pathSegments = url.pathname.split('/');
        pathSegments.forEach(segment => {
          if (segment.match(/^\d+$|^[a-f0-9-]{36}$/)) {
            const paramName = 'id'; // Simplified - could be more sophisticated
            pathParams.add(paramName);
          }
        });
      } catch (error) {
        this.logger.warn(`Failed to extract parameters from: ${capture.url}`);
      }
    });

    // Add path parameters
    pathParams.forEach(paramName => {
      parameters.push({
        name: paramName,
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: `Path parameter`,
      });
    });

    // Add query parameters
    queryParams.forEach((values, name) => {
      const paramType = SchemaInference.inferParameterTypes(values);
      parameters.push({
        name,
        in: 'query',
        required: false,
        schema: paramType,
        description: `Query parameter`,
      });
    });

    return parameters;
  }

  private async buildRequestBody(captures: any[]): Promise<any | null> {
    const bodiesWithContent = captures.filter(c => c.body && c.body.trim());
    
    if (bodiesWithContent.length === 0) {
      return null;
    }

    try {
      const schema = await SchemaInference.inferRequestSchema(
        bodiesWithContent.map(c => c.body)
      );

      return {
        required: true,
        content: {
          'application/json': {
            schema,
          },
        },
      };
    } catch (error) {
      this.logger.warn('Failed to infer request body schema', error);
      return {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      };
    }
  }

  private async buildResponses(captures: any[]): Promise<any> {
    // This would need actual response data from captures
    // For now, return a basic response structure
    return {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    };
  }

  private async buildSchemas(captures: any[]): Promise<Record<string, any>> {
    const schemas: Record<string, any> = {};

    // Extract all request bodies for schema inference
    const requestBodies = captures
      .filter(c => c.body && c.body.trim())
      .map(c => c.body);

    if (requestBodies.length > 0) {
      try {
        const requestSchema = await SchemaInference.inferRequestSchema(requestBodies);
        schemas.RequestBody = requestSchema;
      } catch (error) {
        this.logger.warn('Failed to infer request schema', error);
      }
    }

    return schemas;
  }

  private inferSecuritySchemes(captures: any[]): Record<string, any> {
    const schemes: Record<string, any> = {};
    const hasAuthHeaders = captures.some(capture => {
      const headers = capture.headers || {};
      return headers.authorization || headers.Authorization;
    });

    if (hasAuthHeaders) {
      schemes.bearerAuth = {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      };
    }

    return schemes;
  }

  async saveSpecToProject(projectId: string, specContent: string, version: string = '1.0.0'): Promise<any> {
    // Deactivate previous active spec
    await this.prisma.specFile.updateMany({
      where: { projectId, isActive: true },
      data: { isActive: false },
    });

    // Create new spec file
    return this.prisma.specFile.create({
      data: {
        projectId,
        filename: `openapi-v${version}.yaml`,
        content: specContent,
        version,
        isActive: true,
      },
    });
  }

  async validateSpec(specContent: string) {
    try {
      // Parse the YAML content to check if it's valid
      const parsedSpec = YAML.parse(specContent);
      
      // Basic validation checks
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check required OpenAPI fields
      if (!parsedSpec.openapi) {
        errors.push('Missing required field: openapi');
      }
      
      if (!parsedSpec.info) {
        errors.push('Missing required field: info');
      } else {
        if (!parsedSpec.info.title) {
          errors.push('Missing required field: info.title');
        }
        if (!parsedSpec.info.version) {
          errors.push('Missing required field: info.version');
        }
      }

      if (!parsedSpec.paths || Object.keys(parsedSpec.paths).length === 0) {
        warnings.push('No paths defined in the specification');
      }

      // Check for security schemes usage
      if (parsedSpec.components?.securitySchemes && Object.keys(parsedSpec.components.securitySchemes).length > 0) {
        const hasSecurityRequirements = parsedSpec.security || 
          Object.values(parsedSpec.paths || {}).some((pathItem: any) =>
            Object.values(pathItem).some((operation: any) => operation.security)
          );
        
        if (!hasSecurityRequirements) {
          warnings.push('Security schemes defined but not used in any operations');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Invalid YAML/JSON format: ${error instanceof Error ? error.message : 'Parse error'}`],
        warnings: [],
      };
    }
  }

  async generateSDK(specContent: string, language: string) {
    // TODO: Use openapi-generator-cli to create SDKs
    return {
      success: true,
      downloadUrl: `/downloads/${language}-sdk.zip`,
    };
  }

  async generateDocs(specContent: string) {
    // TODO: Generate static docs using redocly or similar
    return {
      success: true,
      docsUrl: '/docs/latest',
    };
  }
}
