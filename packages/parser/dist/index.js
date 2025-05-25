"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlParser = void 0;
class CurlParser {
    static async parse(rawCurl) {
        try {
            // Use dynamic import to load curlconverter ES module
            const curlconverter = await Promise.resolve().then(() => __importStar(require('curlconverter')));
            // Use curlconverter to parse the cURL command
            const jsonString = curlconverter.toJsonString(rawCurl);
            const parsed = JSON.parse(jsonString);
            // Extract URL components
            const url = new URL(parsed.url);
            const query = {};
            // Parse query parameters
            url.searchParams.forEach((value, key) => {
                query[key] = value;
            });
            return {
                method: parsed.method || 'GET',
                url: parsed.url,
                headers: parsed.headers || {},
                body: parsed.data || undefined,
                query: Object.keys(query).length > 0 ? query : undefined,
            };
        }
        catch (error) {
            throw new Error(`Failed to parse cURL command: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    static extractApiInfo(parsed) {
        const url = new URL(parsed.url);
        return {
            baseUrl: `${url.protocol}//${url.host}`,
            path: url.pathname,
            pathParams: this.extractPathParams(url.pathname),
            queryParams: parsed.query,
            contentType: parsed.headers['Content-Type'] || parsed.headers['content-type'],
        };
    }
    static extractPathParams(path) {
        // Simple heuristic to detect path parameters
        // Look for segments that might be IDs (numbers, UUIDs, etc.)
        const segments = path.split('/').filter(Boolean);
        const params = [];
        segments.forEach((segment, index) => {
            // Check if segment looks like an ID
            if (/^\d+$/.test(segment) || // numeric ID
                /^[a-f0-9-]{36}$/.test(segment) || // UUID
                /^[a-zA-Z0-9_-]{10,}$/.test(segment) // long alphanumeric string
            ) {
                params.push(`{${segments[index - 1] || 'id'}}`);
            }
        });
        return params;
    }
    static async validateCurl(rawCurl) {
        try {
            await this.parse(rawCurl);
            return true;
        }
        catch {
            return false;
        }
    }
    static extractExamples(captures) {
        // Group captures by endpoint pattern
        const endpoints = new Map();
        captures.forEach(capture => {
            const pattern = this.generateEndpointPattern(capture.url, capture.method);
            if (!endpoints.has(pattern)) {
                endpoints.set(pattern, []);
            }
            endpoints.get(pattern).push(capture);
        });
        return endpoints;
    }
    static generateEndpointPattern(url, method) {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        // Replace potential IDs with parameter placeholders
        const normalizedPath = path.replace(/\/\d+/g, '/{id}')
            .replace(/\/[a-f0-9-]{36}/g, '/{uuid}');
        return `${method.toUpperCase()} ${normalizedPath}`;
    }
}
exports.CurlParser = CurlParser;
//# sourceMappingURL=index.js.map