import { z } from 'zod';
// User schemas
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
// Project schemas
export const ProjectSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().optional(),
    userId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
// Capture schemas
export const CaptureSchema = z.object({
    id: z.string(),
    rawCurl: z.string().min(1),
    method: z.string(),
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
    parsed: z.any(),
    projectId: z.string(),
    createdAt: z.string().datetime(),
});
// Spec file schemas
export const SpecFileSchema = z.object({
    id: z.string(),
    filename: z.string(),
    content: z.string(),
    version: z.string(),
    isActive: z.boolean(),
    lintResults: z.any().optional(),
    projectId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
// API DTOs
export const CreateProjectDto = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});
export const ConvertCurlDto = z.object({
    rawCurl: z.string().min(1),
    projectId: z.string().optional(),
});
export const LoginDto = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export const RegisterDto = LoginDto.extend({
    name: z.string().min(1),
});
// Quality report schemas
export const QualityReportSchema = z.object({
    overall: z.number().min(0).max(100),
    lint: z.object({
        score: z.number().min(0).max(100),
        issues: z.array(z.object({
            severity: z.enum(['error', 'warning', 'info']),
            message: z.string(),
            path: z.string(),
            line: z.number().optional(),
        })),
        suggestions: z.array(z.string()),
    }),
    security: z.object({
        securityScore: z.number().min(0).max(100),
        vulnerabilities: z.array(z.any()),
        recommendations: z.array(z.string()),
    }),
    performance: z.object({
        performanceScore: z.number().min(0).max(100),
        issues: z.array(z.string()),
        recommendations: z.array(z.string()),
    }),
    timestamp: z.string().datetime(),
});
