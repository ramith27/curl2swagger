export interface Capture {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
}
export interface ParsedCurl {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    query?: Record<string, string>;
}
export declare class CurlParser {
    static parse(rawCurl: string): ParsedCurl;
    static extractApiInfo(parsed: ParsedCurl): {
        baseUrl: string;
        path: string;
        pathParams: string[];
        queryParams: Record<string, string> | undefined;
        contentType: string;
    };
    private static extractPathParams;
    static validateCurl(rawCurl: string): boolean;
    static extractExamples(captures: Capture[]): Map<string, Capture[]>;
    private static generateEndpointPattern;
}
//# sourceMappingURL=index.d.ts.map