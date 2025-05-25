"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaInference = void 0;
const quicktype_core_1 = require("quicktype-core");
class SchemaInference {
    static async inferFromJSON(jsonSamples, options = {}) {
        try {
            const { typeName = 'Generated', includeExamples = true } = options;
            // Create input data for quicktype
            const inputData = new quicktype_core_1.InputData();
            // Add JSON samples
            jsonSamples.forEach((sample, index) => {
                const input = (0, quicktype_core_1.jsonInputForTargetLanguage)('schema');
                input.addSource({
                    name: `${typeName}_${index}`,
                    samples: [sample],
                });
                inputData.addInput(input);
            });
            // Generate schema
            const result = await (0, quicktype_core_1.quicktype)({
                inputData,
                lang: 'schema',
                rendererOptions: {
                    'just-schema': 'true',
                },
            });
            return JSON.parse(result.lines.join('\n'));
        }
        catch (error) {
            throw new Error(`Schema inference failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    static inferResponseSchema(responses) {
        const validJsonResponses = responses.filter(response => {
            try {
                JSON.parse(response);
                return true;
            }
            catch {
                return false;
            }
        });
        if (validJsonResponses.length === 0) {
            return Promise.resolve({
                type: 'string',
                description: 'Response content',
            });
        }
        return this.inferFromJSON(validJsonResponses, {
            typeName: 'Response',
            includeExamples: true,
        });
    }
    static inferRequestSchema(requestBodies) {
        const validJsonBodies = requestBodies.filter(body => {
            try {
                JSON.parse(body);
                return true;
            }
            catch {
                return false;
            }
        });
        if (validJsonBodies.length === 0) {
            return Promise.resolve({
                type: 'object',
                description: 'Request body',
            });
        }
        return this.inferFromJSON(validJsonBodies, {
            typeName: 'Request',
            includeExamples: true,
        });
    }
    static inferParameterTypes(values) {
        // Analyze parameter values to infer types
        const types = new Set();
        const examples = [];
        values.forEach(value => {
            examples.push(value);
            if (value === 'true' || value === 'false') {
                types.add('boolean');
            }
            else if (/^\d+$/.test(value)) {
                types.add('integer');
            }
            else if (/^\d*\.\d+$/.test(value)) {
                types.add('number');
            }
            else {
                types.add('string');
            }
        });
        // Determine the most appropriate type
        if (types.has('string') && types.size > 1) {
            return { type: 'string', examples: examples.slice(0, 3) };
        }
        else if (types.has('number') || types.has('integer')) {
            return {
                type: types.has('number') ? 'number' : 'integer',
                examples: examples.slice(0, 3).map(v => types.has('number') ? parseFloat(v) : parseInt(v))
            };
        }
        else if (types.has('boolean')) {
            return {
                type: 'boolean',
                examples: examples.slice(0, 3).map(v => v === 'true')
            };
        }
        return { type: 'string', examples: examples.slice(0, 3) };
    }
    static async generateOpenAPISchema(captures) {
        // TODO: Implement comprehensive OpenAPI schema generation
        // This would analyze all captures and generate a complete spec
        const paths = {};
        const components = {
            schemas: {},
            parameters: {},
        };
        // Group captures by endpoint
        const endpointGroups = new Map();
        captures.forEach(capture => {
            const key = `${capture.method}:${new URL(capture.url).pathname}`;
            if (!endpointGroups.has(key)) {
                endpointGroups.set(key, []);
            }
            endpointGroups.get(key).push(capture);
        });
        // Process each endpoint group
        for (const [endpoint, endpointCaptures] of endpointGroups) {
            const [method, path] = endpoint.split(':');
            if (!paths[path]) {
                paths[path] = {};
            }
            // Analyze request bodies
            const requestBodies = endpointCaptures
                .map(c => c.body)
                .filter(Boolean);
            // Analyze responses
            const responses = endpointCaptures
                .map(c => c.response)
                .filter(Boolean);
            const operation = {
                summary: `${method.toUpperCase()} ${path}`,
                operationId: `${method.toLowerCase()}${path.replace(/[^a-zA-Z0-9]/g, '')}`,
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: await this.inferResponseSchema(responses)
                            }
                        }
                    }
                }
            };
            if (requestBodies.length > 0) {
                operation.requestBody = {
                    content: {
                        'application/json': {
                            schema: await this.inferRequestSchema(requestBodies)
                        }
                    }
                };
            }
            paths[path][method.toLowerCase()] = operation;
        }
        return {
            openapi: '3.0.3',
            info: {
                title: 'Generated API',
                version: '1.0.0',
            },
            paths,
            components,
        };
    }
}
exports.SchemaInference = SchemaInference;
//# sourceMappingURL=index.js.map