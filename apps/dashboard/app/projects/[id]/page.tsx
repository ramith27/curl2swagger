'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { CurlDropzone } from '../../../components/CurlDropzone';
import { apiClient } from '../../../lib/api';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

function ProjectDetailContent() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId),
  });

  const generateSpecMutation = useMutation({
    mutationFn: () => apiClient.generateSpec(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const convertCurlMutation = useMutation({
    mutationFn: (curlCommand: string) => apiClient.convertCurl(curlCommand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load project details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generateSpecMutation.mutate()}
            disabled={generateSpecMutation.isLoading}
          >
            {generateSpecMutation.isLoading ? 'Generating...' : 'Generate Spec'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Captures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.captures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.qualityReport.overall}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.qualityReport.security.securityScore}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spec Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.activeSpec?.version || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="captures">Captures</TabsTrigger>
          <TabsTrigger value="spec">Specification</TabsTrigger>
          <TabsTrigger value="quality">Quality Report</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Captures</CardTitle>
                <CardDescription>Latest cURL commands added to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.captures.slice(0, 5).map((capture) => (
                    <div
                      key={capture.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={capture.method === 'GET' ? 'default' : 'secondary'}>
                          {capture.method}
                        </Badge>
                        <span className="font-mono text-sm">{capture.url}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(capture.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Capture</CardTitle>
                <CardDescription>Drop or paste a cURL command to add to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <CurlDropzone projectId={projectId} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="captures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Captures</CardTitle>
              <CardDescription>Complete list of cURL commands for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.captures.map((capture) => (
                  <div
                    key={capture.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant={capture.method === 'GET' ? 'default' : 'secondary'}>
                        {capture.method}
                      </Badge>
                      <div>
                        <span className="font-mono text-sm">{capture.url}</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Added {new Date(capture.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spec" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OpenAPI Specification</CardTitle>
              <CardDescription>
                Generated specification for this project ({project.activeSpec?.filename})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{project.activeSpec?.content || 'No specification generated yet'}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {project.qualityReport ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Linting Score</CardTitle>
                  <CardDescription>OpenAPI spec quality and standards compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{project.qualityReport.lint.score}/100</div>
                  <div className="text-sm text-gray-600">
                    {project.qualityReport.lint.issues.length} issues found
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Score</CardTitle>
                  <CardDescription>Security analysis and vulnerability assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {project.qualityReport.security.securityScore}/100
                  </div>
                  <div className="text-sm text-gray-600">
                    {project.qualityReport.security.vulnerabilities.length} vulnerabilities found
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Score</CardTitle>
                  <CardDescription>Performance implications and optimization suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {project.qualityReport.performance.performanceScore}/100
                  </div>
                  <div className="text-sm text-gray-600">
                    {project.qualityReport.performance.issues.length} performance issues
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No quality report available. Generate a specification first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Specification</CardTitle>
                <CardDescription>Create OpenAPI specification from captured requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateSpecMutation.mutate()}
                  disabled={generateSpecMutation.isLoading}
                  className="w-full"
                >
                  {generateSpecMutation.isLoading ? 'Generating...' : 'Generate OpenAPI Spec'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Documentation</CardTitle>
                <CardDescription>Create interactive API documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" disabled>
                    Generate Redoc Documentation
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    Generate Swagger UI
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    Export to Postman Collection
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Generate a specification first to enable documentation features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  )
}
