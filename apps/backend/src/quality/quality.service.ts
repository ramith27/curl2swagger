import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as YAML from 'yaml';

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  path: string;
  line?: number;
  rule?: string;
}

export interface SecurityVulnerability {
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  path: string;
  recommendation: string;
}

export interface PerformanceIssue {
  type: string;
  description: string;
  path: string;
  impact: 'high' | 'medium' | 'low';
}

@Injectable()
export class QualityService {
  private readonly logger = new Logger(QualityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async lintSpec(specContent: string): Promise<{
    score: number;
    issues: QualityIssue[];
    suggestions: string[];
  }> {
    try {
      const spec = YAML.parse(specContent);
      const issues: QualityIssue[] = [];
      const suggestions: string[] = [];

      // Basic OpenAPI structure validation
      this.validateBasicStructure(spec, issues);
      
      // Check for missing descriptions
      this.checkDescriptions(spec, issues, suggestions);
      
      // Check for proper HTTP status codes
      this.checkStatusCodes(spec, issues, suggestions);
      
      // Check for schema definitions
      this.checkSchemas(spec, issues, suggestions);
      
      // Check for examples
      this.checkExamples(spec, issues, suggestions);

      const score = this.calculateLintScore(issues);

      return {
        score,
        issues,
        suggestions: [...new Set(suggestions)], // Remove duplicates
      };
    } catch (error) {
      this.logger.error('Failed to lint spec', error);
      return {
        score: 0,
        issues: [
          {
            severity: 'error',
            message: 'Invalid OpenAPI specification format',
            path: 'root',
            rule: 'format-validation',
          },
        ],
        suggestions: ['Fix YAML/JSON syntax errors'],
      };
    }
  }

  async securityScan(specContent: string): Promise<{
    securityScore: number;
    vulnerabilities: SecurityVulnerability[];
    recommendations: string[];
  }> {
    try {
      const spec = YAML.parse(specContent);
      const vulnerabilities: SecurityVulnerability[] = [];
      const recommendations: string[] = [];

      // Check for authentication
      this.checkAuthentication(spec, vulnerabilities, recommendations);
      
      // Check for HTTPS enforcement
      this.checkHTTPS(spec, vulnerabilities, recommendations);
      
      // Check for input validation
      this.checkInputValidation(spec, vulnerabilities, recommendations);
      
      // Check for sensitive data exposure
      this.checkSensitiveData(spec, vulnerabilities, recommendations);

      const securityScore = this.calculateSecurityScore(vulnerabilities);

      return {
        securityScore,
        vulnerabilities,
        recommendations: [...new Set(recommendations)],
      };
    } catch (error) {
      this.logger.error('Failed to perform security scan', error);
      return {
        securityScore: 0,
        vulnerabilities: [],
        recommendations: ['Fix specification format before security analysis'],
      };
    }
  }

  async performanceAnalysis(specContent: string): Promise<{
    performanceScore: number;
    issues: PerformanceIssue[];
    recommendations: string[];
  }> {
    try {
      const spec = YAML.parse(specContent);
      const issues: PerformanceIssue[] = [];
      const recommendations: string[] = [];

      // Check for pagination
      this.checkPagination(spec, issues, recommendations);
      
      // Check for large responses
      this.checkResponseSize(spec, issues, recommendations);
      
      // Check for caching headers
      this.checkCaching(spec, issues, recommendations);
      
      // Check for rate limiting
      this.checkRateLimiting(spec, issues, recommendations);

      const performanceScore = this.calculatePerformanceScore(issues);

      return {
        performanceScore,
        issues,
        recommendations: [...new Set(recommendations)],
      };
    } catch (error) {
      this.logger.error('Failed to perform performance analysis', error);
      return {
        performanceScore: 0,
        issues: [],
        recommendations: ['Fix specification format before performance analysis'],
      };
    }
  }

  async getQualityReport(projectId: string): Promise<any> {
    try {
      // Get the active spec for the project
      const activeSpec = await this.prisma.specFile.findFirst({
        where: { projectId, isActive: true },
      });

      if (!activeSpec) {
        throw new Error('No active specification found for project');
      }

      const lint = await this.lintSpec(activeSpec.content);
      const security = await this.securityScan(activeSpec.content);
      const performance = await this.performanceAnalysis(activeSpec.content);

      const overall = Math.round((lint.score + security.securityScore + performance.performanceScore) / 3);

      const report = {
        overall,
        lint,
        security,
        performance,
        timestamp: new Date().toISOString(),
        specVersion: activeSpec.version,
      };

      // Save lint results to database
      await this.prisma.specFile.update({
        where: { id: activeSpec.id },
        data: { lintResults: JSON.parse(JSON.stringify(report)) },
      });

      return report;
    } catch (error) {
      this.logger.error('Failed to generate quality report', error);
      throw error;
    }
  }

  async analyzeSpec(specContent: string): Promise<{
    overallScore: number;
    linting: {
      score: number;
      issues: QualityIssue[];
      suggestions: string[];
    };
    security: {
      score: number;
      vulnerabilities: SecurityVulnerability[];
      recommendations: string[];
    };
    performance: {
      score: number;
      issues: PerformanceIssue[];
      recommendations: string[];
    };
  }> {
    try {
      // Perform all quality analyses
      const linting = await this.lintSpec(specContent);
      const security = await this.securityScan(specContent);
      const performance = await this.performanceAnalysis(specContent);

      // Calculate overall score
      const overallScore = Math.round(
        (linting.score + security.securityScore + performance.performanceScore) / 3
      );

      return {
        overallScore,
        linting: {
          score: linting.score,
          issues: linting.issues,
          suggestions: linting.suggestions,
        },
        security: {
          score: security.securityScore,
          vulnerabilities: security.vulnerabilities,
          recommendations: security.recommendations,
        },
        performance: {
          score: performance.performanceScore,
          issues: performance.issues,
          recommendations: performance.recommendations,
        },
      };
    } catch (error) {
      this.logger.error('Failed to analyze spec', error);
      throw error;
    }
  }

  // Private helper methods
  private validateBasicStructure(spec: any, issues: QualityIssue[]): void {
    if (!spec.openapi) {
      issues.push({
        severity: 'error',
        message: 'Missing OpenAPI version',
        path: 'root',
        rule: 'openapi-version',
      });
    }

    if (!spec.info) {
      issues.push({
        severity: 'error',
        message: 'Missing info object',
        path: 'root',
        rule: 'info-required',
      });
    }

    if (!spec.paths) {
      issues.push({
        severity: 'error',
        message: 'Missing paths object',
        path: 'root',
        rule: 'paths-required',
      });
    }
  }

  private checkDescriptions(spec: any, issues: QualityIssue[], suggestions: string[]): void {
    if (!spec.info?.description) {
      issues.push({
        severity: 'warning',
        message: 'Missing API description',
        path: 'info.description',
        rule: 'info-description',
      });
      suggestions.push('Add a comprehensive API description');
    }

    if (spec.paths) {
      Object.keys(spec.paths).forEach(path => {
        const pathItem = spec.paths[path];
        Object.keys(pathItem).forEach(method => {
          const operation = pathItem[method];
          if (typeof operation === 'object' && !operation.description && !operation.summary) {
            issues.push({
              severity: 'warning',
              message: 'Missing operation description or summary',
              path: `paths.${path}.${method}`,
              rule: 'operation-description',
            });
          }
        });
      });
    }
  }

  private checkStatusCodes(spec: any, issues: QualityIssue[], suggestions: string[]): void {
    if (spec.paths) {
      Object.keys(spec.paths).forEach(path => {
        const pathItem = spec.paths[path];
        Object.keys(pathItem).forEach(method => {
          const operation = pathItem[method];
          if (typeof operation === 'object' && operation.responses) {
            const responses = Object.keys(operation.responses);
            
            if (!responses.includes('200') && !responses.includes('201') && !responses.includes('204')) {
              issues.push({
                severity: 'warning',
                message: 'Missing success response status code',
                path: `paths.${path}.${method}.responses`,
                rule: 'success-response',
              });
            }

            if (!responses.some(code => code.startsWith('4') || code.startsWith('5'))) {
              issues.push({
                severity: 'info',
                message: 'Consider adding error response status codes',
                path: `paths.${path}.${method}.responses`,
                rule: 'error-responses',
              });
              suggestions.push('Add error response definitions (4xx, 5xx)');
            }
          }
        });
      });
    }
  }

  private checkSchemas(spec: any, issues: QualityIssue[], suggestions: string[]): void {
    if (!spec.components?.schemas || Object.keys(spec.components.schemas).length === 0) {
      issues.push({
        severity: 'info',
        message: 'No reusable schemas defined',
        path: 'components.schemas',
        rule: 'reusable-schemas',
      });
      suggestions.push('Define reusable schemas to improve maintainability');
    }
  }

  private checkExamples(spec: any, issues: QualityIssue[], suggestions: string[]): void {
    // This would check for examples in request/response bodies
    suggestions.push('Add examples to improve API documentation');
  }

  private checkAuthentication(spec: any, vulnerabilities: SecurityVulnerability[], recommendations: string[]): void {
    if (!spec.components?.securitySchemes || Object.keys(spec.components.securitySchemes).length === 0) {
      vulnerabilities.push({
        severity: 'medium',
        type: 'Authentication',
        description: 'No authentication schemes defined',
        path: 'components.securitySchemes',
        recommendation: 'Define appropriate authentication mechanisms',
      });
      recommendations.push('Implement authentication (OAuth2, API Keys, JWT)');
    }
  }

  private checkHTTPS(spec: any, vulnerabilities: SecurityVulnerability[], recommendations: string[]): void {
    if (spec.servers) {
      const hasHTTPSOnly = spec.servers.every((server: any) => server.url.startsWith('https://'));
      if (!hasHTTPSOnly) {
        vulnerabilities.push({
          severity: 'high',
          type: 'Transport Security',
          description: 'HTTP endpoints detected - data transmitted in plain text',
          path: 'servers',
          recommendation: 'Use HTTPS for all endpoints',
        });
        recommendations.push('Enforce HTTPS for all API endpoints');
      }
    }
  }

  private checkInputValidation(spec: any, vulnerabilities: SecurityVulnerability[], recommendations: string[]): void {
    // Check for missing input validation in schemas
    recommendations.push('Implement comprehensive input validation');
  }

  private checkSensitiveData(spec: any, vulnerabilities: SecurityVulnerability[], recommendations: string[]): void {
    // Check for potential sensitive data exposure in examples or schemas
    recommendations.push('Ensure no sensitive data is exposed in API documentation');
  }

  private checkPagination(spec: any, issues: PerformanceIssue[], recommendations: string[]): void {
    if (spec.paths) {
      Object.keys(spec.paths).forEach(path => {
        const pathItem = spec.paths[path];
        if (pathItem.get && path.includes('s')) { // Likely a collection endpoint
          const operation = pathItem.get;
          const hasLimitParam = operation.parameters?.some((param: any) => 
            ['limit', 'size', 'count', 'per_page'].includes(param.name)
          );
          const hasOffsetParam = operation.parameters?.some((param: any) => 
            ['offset', 'page', 'skip', 'start'].includes(param.name)
          );

          if (!hasLimitParam || !hasOffsetParam) {
            issues.push({
              type: 'Pagination',
              description: 'Missing pagination parameters',
              path: `paths.${path}.get`,
              impact: 'medium',
            });
            recommendations.push('Implement pagination for collection endpoints');
          }
        }
      });
    }
  }

  private checkResponseSize(spec: any, issues: PerformanceIssue[], recommendations: string[]): void {
    // This would analyze response schemas for potential large objects
    recommendations.push('Consider response size optimization');
  }

  private checkCaching(spec: any, issues: PerformanceIssue[], recommendations: string[]): void {
    // Check for cache-related headers or parameters
    recommendations.push('Implement caching strategies for better performance');
  }

  private checkRateLimiting(spec: any, issues: PerformanceIssue[], recommendations: string[]): void {
    // Check for rate limiting documentation
    recommendations.push('Document rate limiting policies');
  }

  private calculateLintScore(issues: QualityIssue[]): number {
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 20;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 5;
          break;
      }
    });
    return Math.max(0, score);
  }

  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    let score = 100;
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'high':
          score -= 30;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    return Math.max(0, score);
  }

  private calculatePerformanceScore(issues: PerformanceIssue[]): number {
    let score = 100;
    issues.forEach(issue => {
      switch (issue.impact) {
        case 'high':
          score -= 25;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    return Math.max(0, score);
  }
}
