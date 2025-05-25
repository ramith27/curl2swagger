export interface SchemaInferenceOptions {
    typeName?: string;
    includeExamples?: boolean;
    inferEnums?: boolean;
}
export declare class SchemaInference {
    static inferFromJSON(jsonSamples: string[], options?: SchemaInferenceOptions): Promise<any>;
    static inferResponseSchema(responses: string[]): Promise<any>;
    static inferRequestSchema(requestBodies: string[]): Promise<any>;
    static inferParameterTypes(values: string[]): any;
    static generateOpenAPISchema(captures: Array<{
        method: string;
        url: string;
        headers: Record<string, string>;
        body?: string;
        response?: string;
    }>): Promise<{
        openapi: string;
        info: {
            title: string;
            version: string;
        };
        paths: Record<string, any>;
        components: {
            schemas: {};
            parameters: {};
        };
    }>;
}
//# sourceMappingURL=index.d.ts.map