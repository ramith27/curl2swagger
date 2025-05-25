'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Download, 
  Copy, 
  Eye, 
  FileText, 
  Code, 
  Shield, 
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';
import * as YAML from 'yaml';

interface SpecificationViewerProps {
  spec: any;
  qualityReport?: any;
}

export function SpecificationViewer({ spec, qualityReport }: SpecificationViewerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'yaml' | 'json'>('yaml');

  console.log('SpecificationViewer props:', { spec, qualityReport });

  if (!spec) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">No specification generated yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add some cURL commands and generate a specification to view it here
          </p>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatAsJson = () => {
    try {
      const parsed = YAML.parse(spec.content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return 'Invalid YAML content';
    }
  };

  const getSpecInfo = () => {
    try {
      const parsed = YAML.parse(spec.content);
      return {
        title: parsed.info?.title || 'Untitled API',
        version: parsed.info?.version || '1.0.0',
        description: parsed.info?.description || 'No description provided',
        servers: parsed.servers || [],
        paths: Object.keys(parsed.paths || {}),
        pathCount: Object.keys(parsed.paths || {}).length,
        operations: Object.values(parsed.paths || {}).reduce((acc: number, path: any) => {
          return acc + Object.keys(path).filter(key => 
            ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(key)
          ).length;
        }, 0)
      };
    } catch {
      return null;
    }
  };

  const downloadSpec = (format: 'yaml' | 'json') => {
    const content = format === 'yaml' ? spec.content : formatAsJson();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec.filename.replace('.yaml', '')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const specInfo = getSpecInfo();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Specification Overview */}
      {specInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">API Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-semibold">{specInfo.title}</p>
                  <p className="text-sm text-muted-foreground">v{specInfo.version}</p>
                </div>
                {specInfo.description && (
                  <p className="text-sm text-muted-foreground">{specInfo.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">API Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Paths</span>
                  <Badge variant="secondary">{specInfo.pathCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Operations</span>
                  <Badge variant="secondary">{specInfo.operations}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Servers</span>
                  <Badge variant="secondary">{specInfo.servers.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => downloadSpec('yaml')}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download YAML
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => downloadSpec('json')}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Specification Tabs */}
      <Tabs defaultValue="spec" className="w-full">
        <TabsList>
          <TabsTrigger value="spec">Specification</TabsTrigger>
          <TabsTrigger value="paths">Paths</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="spec" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>OpenAPI Specification</CardTitle>
                  <CardDescription>
                    {spec.filename} • {spec.status} • Last updated {new Date(spec.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={activeView === 'yaml' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('yaml')}
                  >
                    YAML
                  </Button>
                  <Button
                    variant={activeView === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('json')}
                  >
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96">
                <pre className="text-sm">
                  <code>
                    {activeView === 'yaml' ? spec.content : formatAsJson()}
                  </code>
                </pre>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(
                    activeView === 'yaml' ? spec.content : formatAsJson(),
                    'spec'
                  )}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedField === 'spec' ? 'Copied!' : `Copy ${activeView.toUpperCase()}`}
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Paths</CardTitle>
              <CardDescription>
                All endpoints defined in the specification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {specInfo && specInfo.paths.length > 0 ? (
                <div className="space-y-3">
                  {specInfo.paths.map((path, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <code className="text-sm font-mono">{path}</code>
                      <div className="flex gap-2 mt-2">
                        {(() => {
                          try {
                            const parsed = YAML.parse(spec.content);
                            const pathObj = parsed.paths[path];
                            return Object.keys(pathObj).filter(key => 
                              ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(key)
                            ).map(method => (
                              <Badge 
                                key={method} 
                                variant={method === 'get' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {method.toUpperCase()}
                              </Badge>
                            ));
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No paths defined</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          {qualityReport ? (
            <div className="space-y-4">
              {/* Linting Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Linting Issues
                  </CardTitle>
                  <CardDescription>
                    OpenAPI specification quality and standards compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {qualityReport.lint?.issues?.length > 0 ? (
                    <div className="space-y-3">
                      {qualityReport.lint.issues.map((issue: any, index: number) => (
                        <Alert key={index} variant={issue.severity === 'error' ? 'destructive' : 'default'}>
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1">
                              <p className="font-medium">{issue.message}</p>
                              {issue.path && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Path: {issue.path}
                                </p>
                              )}
                              {issue.rule && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {issue.rule}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No linting issues found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Analysis
                  </CardTitle>
                  <CardDescription>
                    Security vulnerabilities and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {qualityReport.security?.vulnerabilities?.length > 0 ? (
                    <div className="space-y-3">
                      {qualityReport.security.vulnerabilities.map((vuln: any, index: number) => (
                        <Alert key={index} variant="destructive">
                          <Shield className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{vuln.description}</p>
                            <p className="text-sm mt-1">{vuln.recommendation}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={
                                vuln.severity === 'high' ? 'destructive' : 
                                vuln.severity === 'medium' ? 'default' : 'secondary'
                              }>
                                {vuln.severity}
                              </Badge>
                              <Badge variant="outline">{vuln.type}</Badge>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No security vulnerabilities found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Performance Analysis
                  </CardTitle>
                  <CardDescription>
                    Performance implications and optimization suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {qualityReport.performance?.issues?.length > 0 ? (
                    <div className="space-y-3">
                      {qualityReport.performance.issues.map((issue: any, index: number) => (
                        <Alert key={index}>
                          <Zap className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{issue.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {issue.impact} impact
                            </Badge>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No performance issues found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No validation results available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Quality analysis will appear here once available
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Download Specification</CardTitle>
                <CardDescription>
                  Export the OpenAPI specification in different formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadSpec('yaml')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download as YAML
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadSpec('json')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download as JSON
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Documentation</CardTitle>
                <CardDescription>
                  Create interactive API documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" disabled>
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Swagger UI
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate ReDoc
                </Button>
                <p className="text-xs text-muted-foreground">
                  Documentation generation coming soon
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
