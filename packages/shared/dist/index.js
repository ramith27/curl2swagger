"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityReportSchema = exports.RegisterDto = exports.LoginDto = exports.ConvertCurlDto = exports.CreateProjectDto = exports.SpecFileSchema = exports.CaptureSchema = exports.ProjectSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
// User schemas
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Project schemas
exports.ProjectSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    userId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// Capture schemas
exports.CaptureSchema = zod_1.z.object({
    id: zod_1.z.string(),
    rawCurl: zod_1.z.string().min(1),
    method: zod_1.z.string(),
    url: zod_1.z.string().url(),
    headers: zod_1.z.record(zod_1.z.string()).optional(),
    body: zod_1.z.string().optional(),
    parsed: zod_1.z.any(),
    projectId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
});
// Spec file schemas
exports.SpecFileSchema = zod_1.z.object({
    id: zod_1.z.string(),
    filename: zod_1.z.string(),
    content: zod_1.z.string(),
    version: zod_1.z.string(),
    isActive: zod_1.z.boolean(),
    lintResults: zod_1.z.any().optional(),
    projectId: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// API DTOs
exports.CreateProjectDto = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
exports.ConvertCurlDto = zod_1.z.object({
    rawCurl: zod_1.z.string().min(1),
    projectId: zod_1.z.string().optional(),
});
exports.LoginDto = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.RegisterDto = exports.LoginDto.extend({
    name: zod_1.z.string().min(1),
});
// Quality report schemas
exports.QualityReportSchema = zod_1.z.object({
    overall: zod_1.z.number().min(0).max(100),
    lint: zod_1.z.object({
        score: zod_1.z.number().min(0).max(100),
        issues: zod_1.z.array(zod_1.z.object({
            severity: zod_1.z.enum(['error', 'warning', 'info']),
            message: zod_1.z.string(),
            path: zod_1.z.string(),
            line: zod_1.z.number().optional(),
        })),
        suggestions: zod_1.z.array(zod_1.z.string()),
    }),
    security: zod_1.z.object({
        securityScore: zod_1.z.number().min(0).max(100),
        vulnerabilities: zod_1.z.array(zod_1.z.any()),
        recommendations: zod_1.z.array(zod_1.z.string()),
    }),
    performance: zod_1.z.object({
        performanceScore: zod_1.z.number().min(0).max(100),
        issues: zod_1.z.array(zod_1.z.string()),
        recommendations: zod_1.z.array(zod_1.z.string()),
    }),
    timestamp: zod_1.z.string().datetime(),
});
//# sourceMappingURL=index.js.map