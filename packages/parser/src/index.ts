import * as curlconverter from 'curlconverter';

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

export class CurlParser {
  static parse(rawCurl: string): ParsedCurl {
    try {
      // Use curlconverter to parse the cURL command
      const jsonString = curlconverter.toJsonString(rawCurl);
      const parsed = JSON.parse(jsonString);

      // Extract URL components
      const url = new URL(parsed.url);
      const query: Record<string, string> = {};
      
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
    } catch (error) {
      throw new Error(`Failed to parse cURL command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static extractApiInfo(parsed: ParsedCurl) {
    const url = new URL(parsed.url);
    
    return {
      baseUrl: `${url.protocol}//${url.host}`,
      path: url.pathname,
      pathParams: this.extractPathParams(url.pathname),
      queryParams: parsed.query,
      contentType: parsed.headers['Content-Type'] || parsed.headers['content-type'],
    };
  }

  private static extractPathParams(path: string): string[] {
    // Simple heuristic to detect path parameters
    // Look for segments that might be IDs (numbers, UUIDs, etc.)
    const segments = path.split('/').filter(Boolean);
    const params: string[] = [];

    segments.forEach((segment, index) => {
      // Check if segment looks like an ID
      if (
        /^\d+$/.test(segment) || // numeric ID
        /^[a-f0-9-]{36}$/.test(segment) || // UUID
        /^[a-zA-Z0-9_-]{10,}$/.test(segment) // long alphanumeric string
      ) {
        params.push(`{${segments[index - 1] || 'id'}}`);
      }
    });

    return params;
  }

  static validateCurl(rawCurl: string): boolean {
    try {
      this.parse(rawCurl);
      return true;
    } catch {
      return false;
    }
  }

  static extractExamples(captures: Capture[]) {
    // Group captures by endpoint pattern
    const endpoints = new Map<string, Capture[]>();

    captures.forEach(capture => {
      const pattern = this.generateEndpointPattern(capture.url, capture.method);
      if (!endpoints.has(pattern)) {
        endpoints.set(pattern, []);
      }
      endpoints.get(pattern)!.push(capture);
    });

    return endpoints;
  }

  private static generateEndpointPattern(url: string, method: string): string {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Replace potential IDs with parameter placeholders
    const normalizedPath = path.replace(/\/\d+/g, '/{id}')
                               .replace(/\/[a-f0-9-]{36}/g, '/{uuid}');
    
    return `${method.toUpperCase()} ${normalizedPath}`;
  }
}
