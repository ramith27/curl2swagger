// Parser utilities for cURL commands
export interface CaptureData {
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
  static async parse(rawCurl: string): Promise<ParsedCurl> {
    try {
      return this.parseManually(rawCurl);
    } catch (error) {
      throw new Error(`Failed to parse cURL command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static parseManually(rawCurl: string): ParsedCurl {
    // Clean up the curl command
    let curlCommand = rawCurl.trim();
    
    // Remove 'curl' at the beginning if present
    curlCommand = curlCommand.replace(/^curl\s+/, '');
    
    // Initialize result object
    const result: ParsedCurl = {
      method: 'GET',
      url: '',
      headers: {},
    };

    // Split the command into tokens while preserving quoted strings
    const tokens = this.tokenize(curlCommand);
    
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      
      if (token === '-X' || token === '--request') {
        // Method
        if (i + 1 < tokens.length) {
          result.method = tokens[i + 1].toUpperCase();
          i += 2;
        } else {
          i++;
        }
      } else if (token === '-H' || token === '--header') {
        // Header
        if (i + 1 < tokens.length) {
          const header = tokens[i + 1];
          const colonIndex = header.indexOf(':');
          if (colonIndex > 0) {
            const key = header.substring(0, colonIndex).trim();
            const value = header.substring(colonIndex + 1).trim();
            result.headers[key] = value;
          }
          i += 2;
        } else {
          i++;
        }
      } else if (token === '-d' || token === '--data' || token === '--data-raw') {
        // Body data
        if (i + 1 < tokens.length) {
          result.body = tokens[i + 1];
          // If we have data, it's likely a POST request
          if (result.method === 'GET') {
            result.method = 'POST';
          }
          i += 2;
        } else {
          i++;
        }
      } else if (token.startsWith('http://') || token.startsWith('https://')) {
        // URL
        result.url = token;
        i++;
      } else {
        // Skip unknown tokens
        i++;
      }
    }

    // Parse query parameters from URL
    if (result.url) {
      try {
        const url = new URL(result.url);
        const query: Record<string, string> = {};
        
        url.searchParams.forEach((value, key) => {
          query[key] = value;
        });
        
        if (Object.keys(query).length > 0) {
          result.query = query;
        }
      } catch (error) {
        // If URL parsing fails, just continue without query params
      }
    }

    if (!result.url) {
      throw new Error('No URL found in cURL command');
    }

    return result;
  }

  private static tokenize(command: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < command.length; i++) {
      const char = command[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else if (!inQuotes && char === ' ') {
        if (current) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      tokens.push(current);
    }
    
    return tokens;
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

  static async validateCurl(rawCurl: string): Promise<boolean> {
    try {
      await this.parse(rawCurl);
      return true;
    } catch {
      return false;
    }
  }

  static extractExamples(captures: CaptureData[]) {
    // Group captures by endpoint pattern
    const endpoints = new Map<string, CaptureData[]>();

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