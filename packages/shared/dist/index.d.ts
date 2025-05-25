import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    name?: string | undefined;
}, {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    name?: string | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    description?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    description?: string | undefined;
}>;
export type Project = z.infer<typeof ProjectSchema>;
export declare const CaptureSchema: z.ZodObject<{
    id: z.ZodString;
    rawCurl: z.ZodString;
    method: z.ZodString;
    url: z.ZodString;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    body: z.ZodOptional<z.ZodString>;
    parsed: z.ZodAny;
    projectId: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    rawCurl: string;
    method: string;
    url: string;
    projectId: string;
    headers?: Record<string, string> | undefined;
    body?: string | undefined;
    parsed?: any;
}, {
    id: string;
    createdAt: string;
    rawCurl: string;
    method: string;
    url: string;
    projectId: string;
    headers?: Record<string, string> | undefined;
    body?: string | undefined;
    parsed?: any;
}>;
export type Capture = z.infer<typeof CaptureSchema>;
export declare const SpecFileSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    content: z.ZodString;
    version: z.ZodString;
    isActive: z.ZodBoolean;
    lintResults: z.ZodOptional<z.ZodAny>;
    projectId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    filename: string;
    content: string;
    version: string;
    isActive: boolean;
    lintResults?: any;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    filename: string;
    content: string;
    version: string;
    isActive: boolean;
    lintResults?: any;
}>;
export type SpecFile = z.infer<typeof SpecFileSchema>;
export declare const CreateProjectDto: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export declare const ConvertCurlDto: z.ZodObject<{
    rawCurl: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rawCurl: string;
    projectId?: string | undefined;
}, {
    rawCurl: string;
    projectId?: string | undefined;
}>;
export declare const LoginDto: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RegisterDto: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
} & {
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    password: string;
}, {
    email: string;
    name: string;
    password: string;
}>;
export declare const QualityReportSchema: z.ZodObject<{
    overall: z.ZodNumber;
    lint: z.ZodObject<{
        score: z.ZodNumber;
        issues: z.ZodArray<z.ZodObject<{
            severity: z.ZodEnum<["error", "warning", "info"]>;
            message: z.ZodString;
            path: z.ZodString;
            line: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            message: string;
            severity: "error" | "warning" | "info";
            line?: number | undefined;
        }, {
            path: string;
            message: string;
            severity: "error" | "warning" | "info";
            line?: number | undefined;
        }>, "many">;
        suggestions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        issues: {
            path: string;
            message: string;
            severity: "error" | "warning" | "info";
            line?: number | undefined;
        }[];
        score: number;
        suggestions: string[];
    }, {
        issues: {
            path: string;
            message: string;
            severity: "error" | "warning" | "info";
            line?: number | undefined;
        }[];
        score: number;
        suggestions: string[];
    }>;
    security: z.ZodObject<{
        securityScore: z.ZodNumber;
        vulnerabilities: z.ZodArray<z.ZodAny, "many">;
        recommendations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        securityScore: number;
        vulnerabilities: any[];
        recommendations: string[];
    }, {
        securityScore: number;
        vulnerabilities: any[];
        recommendations: string[];
    }>;
    performance: z.ZodObject<{
        performanceScore: z.ZodNumber;
        issues: z.ZodArray<z.ZodString, "many">;
        recommendations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        issues: string[];
        recommendations: string[];
        performanceScore: number;
    }, {
        issues: string[];
        recommendations: string[];
        performanceScore: number;
    }>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    overall: number;
    lint: {
        issues: {
            path: string;
            message: string;
            severity: "error" | "warning" | "info";
            line?: number | undefined;
        }[];
        score: number;
        suggestions: string[];
    };
    security: {
        securityScore: number;
        vulnerabilities: any[];
        recommendations: string[];
    };
    performance: {
        issues: string[];
        recommendations: string[];
        performanceScore: number;
    };
    timestamp: string;
}, {
    overall: number;
    lint: {
        issues: {
            path: string;
            message: string;
            severity: "error" | "warning" | "info";
            line?: number | undefined;
        }[];
        score: number;
        suggestions: string[];
    };
    security: {
        securityScore: number;
        vulnerabilities: any[];
        recommendations: string[];
    };
    performance: {
        issues: string[];
        recommendations: string[];
        performanceScore: number;
    };
    timestamp: string;
}>;
export type QualityReport = z.infer<typeof QualityReportSchema>;
export type CreateProject = z.infer<typeof CreateProjectDto>;
export type ConvertCurl = z.infer<typeof ConvertCurlDto>;
export type Login = z.infer<typeof LoginDto>;
export type Register = z.infer<typeof RegisterDto>;
//# sourceMappingURL=index.d.ts.map