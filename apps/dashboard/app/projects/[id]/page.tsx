'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { CurlDropzone } from '../../../components/CurlDropzone';
import { CaptureDetailModal } from '../../../components/CaptureDetailModal';
import { SpecificationViewer } from '../../../components/SpecificationViewer';
import { apiClient } from '../../../lib/api';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Globe,
  Shield,
  Zap,
  Code
} from 'lucide-react';

function ProjectDetailContent() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCapture, setSelectedCapture] = useState<any>(null);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId),
    onSuccess: (data) => {
      console.log('Project data received:', data);
      console.log('Active spec:', data?.activeSpec);
      console.log('Spec files:', data?.specFiles);
    }
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

  const openCaptureDetail = (capture: any) => {
    setSelectedCapture(capture);
    setCaptureModalOpen(true);
  };

  const filteredCaptures = project?.captures?.filter((capture: any) => {
    const matchesSearch = capture.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capture.method.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || capture.method === methodFilter;
    return matchesSearch && matchesMethod;
  }) || [];

  const getMostCommonMethod = (captures: any[]) => {
    if (captures.length === 0) return 'GET';
    const methodCounts = captures.reduce((acc: any, curr: any) => {
      acc[curr.method] = (acc[curr.method] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(methodCounts).reduce((a, b) => 
      methodCounts[a] > methodCounts[b] ? a : b
    );
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Captures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.captures.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              {project.captures.filter((c: any) => c.method === 'GET').length} GET, {' '}
              {project.captures.filter((c: any) => c.method !== 'GET').length} others
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.qualityReport?.overall ?? 'N/A'}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {project.qualityReport ? 'Analysis complete' : 'Generate spec for analysis'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.qualityReport?.security?.securityScore ?? 'N/A'}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {project.captures.filter((c: any) => c.url.startsWith('https://')).length}/{project.captures.length} HTTPS
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              API Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.activeSpec ? 
                new Set(project.captures.map((c: any) => new URL(c.url).pathname)).size : 
                'N/A'
              }
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Unique endpoints discovered
            </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Captures */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Captures</CardTitle>
                    <CardDescription>Latest cURL commands added to this project</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('captures')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.captures.slice(0, 5).map((capture) => (
                    <div
                      key={capture.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => openCaptureDetail(capture)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getMethodColor(capture.method)}>
                          {capture.method}
                        </Badge>
                        <span className="font-mono text-sm truncate max-w-xs">{capture.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(capture.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          openCaptureDetail(capture);
                        }}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                  {project.captures.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No captures yet</p>
                      <p className="text-sm">Add your first cURL command to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Insights */}
            <div className="space-y-4">
              {/* Add New Capture */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Capture</CardTitle>
                  <CardDescription>Drop or paste a cURL command</CardDescription>
                </CardHeader>
                <CardContent>
                  <CurlDropzone projectId={projectId} />
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Unique Domains:</span>
                    <Badge variant="outline">
                      {new Set(project.captures.map((c: any) => new URL(c.url).hostname)).size}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>HTTPS Usage:</span>
                    <Badge variant={
                      project.captures.every((c: any) => c.url.startsWith('https://')) ? 'default' : 'secondary'
                    }>
                      {Math.round((project.captures.filter((c: any) => c.url.startsWith('https://')).length / Math.max(project.captures.length, 1)) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Most Common Method:</span>
                    <Badge className={getMethodColor(getMostCommonMethod(project.captures))}>
                      {getMostCommonMethod(project.captures)}
                    </Badge>
                  </div>
                  {project.activeSpec && (
                    <div className="flex justify-between items-center text-sm">
                      <span>Spec Status:</span>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Generated
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="captures" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Captures ({project.captures.length})</CardTitle>
                  <CardDescription>Complete list of cURL commands for this project</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search captures by URL or method..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCaptures.length > 0 ? (
                  filteredCaptures.map((capture) => (
                    <div
                      key={capture.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openCaptureDetail(capture)}
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={getMethodColor(capture.method)}>
                          {capture.method}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-sm block truncate">{capture.url}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            Added {new Date(capture.createdAt).toLocaleDateString()} • 
                            {capture.headers ? Object.keys(capture.headers).length : 0} headers
                            {capture.body && ' • Has body'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {capture.url.startsWith('https://') && (
                          <div className="flex items-center" title="HTTPS Secure">
                            <Shield className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          openCaptureDetail(capture);
                        }}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No captures found</p>
                    <p className="text-sm">
                      {searchTerm || methodFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'Add your first cURL command to get started'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spec" className="space-y-4">
          <SpecificationViewer 
            spec={project.activeSpec} 
            qualityReport={project.qualityReport} 
          />
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {project.qualityReport ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Overall Quality Score
                  </CardTitle>
                  <CardDescription>Comprehensive analysis of your API specification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">
                      {project.qualityReport?.overall ?? 'N/A'}
                      <span className="text-lg font-normal text-gray-500">/100</span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${project.qualityReport?.overall || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Linting Score
                    </CardTitle>
                    <CardDescription>OpenAPI spec quality and standards compliance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{project.qualityReport?.lint?.score ?? 'N/A'}/100</span>
                        <Badge variant={
                          (project.qualityReport?.lint?.score ?? 0) >= 80 ? 'default' : 
                          (project.qualityReport?.lint?.score ?? 0) >= 60 ? 'secondary' : 'destructive'
                        }>
                          {(project.qualityReport?.lint?.score ?? 0) >= 80 ? 'Good' : 
                           (project.qualityReport?.lint?.score ?? 0) >= 60 ? 'Fair' : 'Poor'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {project.qualityReport?.lint?.issues?.length ?? 0} issues found
                      </div>
                      {project.qualityReport?.lint?.issues?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {project.qualityReport.lint.issues.slice(0, 3).map((issue: any, index: number) => (
                            <Alert key={index} className="py-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {issue.message || issue.description}
                              </AlertDescription>
                            </Alert>
                          ))}
                          {project.qualityReport.lint.issues.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{project.qualityReport.lint.issues.length - 3} more issues
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Security Score
                    </CardTitle>
                    <CardDescription>Security analysis and vulnerability assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {project.qualityReport?.security?.securityScore ?? 'N/A'}/100
                        </span>
                        <Badge variant={
                          (project.qualityReport?.security?.securityScore ?? 0) >= 80 ? 'default' : 
                          (project.qualityReport?.security?.securityScore ?? 0) >= 60 ? 'secondary' : 'destructive'
                        }>
                          {(project.qualityReport?.security?.securityScore ?? 0) >= 80 ? 'Secure' : 
                           (project.qualityReport?.security?.securityScore ?? 0) >= 60 ? 'Fair' : 'At Risk'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {project.qualityReport?.security?.vulnerabilities?.length ?? 0} vulnerabilities found
                      </div>
                      {project.qualityReport?.security?.vulnerabilities?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {project.qualityReport.security.vulnerabilities.slice(0, 3).map((vuln: any, index: number) => (
                            <Alert key={index} className="py-2" variant="destructive">
                              <XCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {vuln.message || vuln.description}
                              </AlertDescription>
                            </Alert>
                          ))}
                          {project.qualityReport.security.vulnerabilities.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{project.qualityReport.security.vulnerabilities.length - 3} more vulnerabilities
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Performance Score
                    </CardTitle>
                    <CardDescription>Performance implications and optimization suggestions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {project.qualityReport?.performance?.performanceScore ?? 'N/A'}/100
                        </span>
                        <Badge variant={
                          (project.qualityReport?.performance?.performanceScore ?? 0) >= 80 ? 'default' : 
                          (project.qualityReport?.performance?.performanceScore ?? 0) >= 60 ? 'secondary' : 'destructive'
                        }>
                          {(project.qualityReport?.performance?.performanceScore ?? 0) >= 80 ? 'Fast' : 
                           (project.qualityReport?.performance?.performanceScore ?? 0) >= 60 ? 'Fair' : 'Slow'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {project.qualityReport?.performance?.issues?.length ?? 0} performance issues
                      </div>
                      {project.qualityReport?.performance?.issues?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {project.qualityReport.performance.issues.slice(0, 3).map((issue: any, index: number) => (
                            <Alert key={index} className="py-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {issue.message || issue.description}
                              </AlertDescription>
                            </Alert>
                          ))}
                          {project.qualityReport.performance.issues.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{project.qualityReport.performance.issues.length - 3} more issues
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Quality Report Available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a specification first to get detailed quality analysis and recommendations.
                </p>
                <Button 
                  onClick={() => generateSpecMutation.mutate()}
                  disabled={generateSpecMutation.isLoading}
                >
                  {generateSpecMutation.isLoading ? 'Generating...' : 'Generate Specification'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Specification
                </CardTitle>
                <CardDescription>Create OpenAPI specification from captured requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What will be generated:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• OpenAPI 3.0 specification</li>
                    <li>• API paths and operations from captures</li>
                    <li>• Request/response schemas</li>
                    <li>• Security definitions</li>
                    <li>• Quality report and analysis</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => generateSpecMutation.mutate()}
                  disabled={generateSpecMutation.isLoading || project.captures.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {generateSpecMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate OpenAPI Spec
                    </>
                  )}
                </Button>
                {project.captures.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    Add some cURL captures first to generate a specification
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Generate Documentation
                </CardTitle>
                <CardDescription>Create interactive API documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!project.activeSpec}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Redoc Documentation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!project.activeSpec}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Generate Swagger UI
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!project.activeSpec}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Postman Collection
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!project.activeSpec}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Generate Client SDKs
                </Button>
                
                {!project.activeSpec ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Generate a specification first to enable documentation features
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Specification available! Documentation features are ready to use.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generation History */}
          {project.activeSpec && (
            <Card>
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
                <CardDescription>Track of specification generations and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Current Specification</p>
                      <p className="text-sm text-gray-500">
                        Generated from {project.captures.length} captures • 
                        Version {project.activeSpec?.version || '1.0.0'} • 
                        {project.activeSpec?.filename}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {project.activeSpec?.createdAt && 
                      new Date(project.activeSpec.createdAt).toLocaleDateString()
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Capture Detail Modal */}
      <CaptureDetailModal 
        capture={selectedCapture}
        isOpen={captureModalOpen}
        onClose={() => {
          setCaptureModalOpen(false);
          setSelectedCapture(null);
        }}
      />
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
