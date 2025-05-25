'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Copy, Clock, Globe, Code, Download } from 'lucide-react';

interface CaptureDetailModalProps {
  capture: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CaptureDetailModal({ capture, isOpen, onClose }: CaptureDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!capture) return null;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge className={getMethodColor(capture.method)}>
              {capture.method}
            </Badge>
            <span className="font-mono text-lg">{capture.url}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Added {new Date(capture.createdAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {new URL(capture.url).hostname}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">METHOD</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getMethodColor(capture.method)}>
                        {capture.method}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">URL</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-wrap break-all">
                        {capture.url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(capture.url, 'url')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">HOSTNAME</label>
                    <p className="text-sm mt-1">{new URL(capture.url).hostname}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">PATH</label>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                      {new URL(capture.url).pathname}
                    </code>
                  </div>
                  {new URL(capture.url).search && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">QUERY PARAMETERS</label>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                        {new URL(capture.url).search}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Headers</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(capture.headers || {}).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(capture.headers).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <code className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded font-medium">
                            {key}
                          </code>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                            {String(value)}
                          </code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No headers captured</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {capture.body && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Request Body</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>
                        {typeof capture.body === 'string' 
                          ? capture.body 
                          : formatJson(capture.body)}
                      </code>
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => copyToClipboard(
                      typeof capture.body === 'string' 
                        ? capture.body 
                        : formatJson(capture.body),
                      'body'
                    )}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedField === 'body' ? 'Copied!' : 'Copy Body'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="curl" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Original cURL Command
                </CardTitle>
                <CardDescription>
                  The original cURL command that was captured
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    <code>{capture.rawCurl}</code>
                  </pre>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(capture.rawCurl, 'curl')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedField === 'curl' ? 'Copied!' : 'Copy cURL'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Parsed Request Details</CardTitle>
                <CardDescription>
                  Structured view of the parsed cURL command
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="method-url">
                    <AccordionTrigger>Method & URL</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">HTTP Method</label>
                          <Badge className={`${getMethodColor(capture.method)} mt-1`}>
                            {capture.method}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Full URL</label>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block break-all">
                            {capture.url}
                          </code>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="headers">
                    <AccordionTrigger>
                      Headers ({Object.keys(capture.headers || {}).length})
                    </AccordionTrigger>
                    <AccordionContent>
                      {Object.keys(capture.headers || {}).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(capture.headers).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <code className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded font-medium">
                                {key}
                              </code>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded col-span-2 break-all">
                                {String(value)}
                              </code>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No headers present</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {capture.body && (
                    <AccordionItem value="body">
                      <AccordionTrigger>Request Body</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm">
                            <code>
                              {typeof capture.body === 'string' 
                                ? capture.body 
                                : formatJson(capture.body)}
                            </code>
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  <AccordionItem value="parsed">
                    <AccordionTrigger>Parsed Data</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
                          <code>{formatJson(capture.parsed)}</code>
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Request Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">CONTENT TYPE</label>
                    <p className="text-sm mt-1">
                      {capture.headers?.['content-type'] || 
                       capture.headers?.['Content-Type'] || 
                       'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">AUTHENTICATION</label>
                    <p className="text-sm mt-1">
                      {capture.headers?.authorization || 
                       capture.headers?.Authorization ? 
                       'Present' : 'None detected'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">QUERY PARAMS</label>
                    <p className="text-sm mt-1">
                      {new URL(capture.url).searchParams.size} parameters
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Security Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {new URL(capture.url).protocol === 'https:' ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      HTTPS connection
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      HTTP connection (insecure)
                    </div>
                  )}
                  
                  {capture.headers?.authorization || capture.headers?.Authorization ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Authentication header present
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      No authentication detected
                    </div>
                  )}

                  {capture.body && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Request contains body data
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
