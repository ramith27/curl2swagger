'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface CurlDropzoneProps {
  projectId: string
  onSuccess?: () => void
}

export function CurlDropzone({ projectId, onSuccess }: CurlDropzoneProps) {
  const [curlCommand, setCurlCommand] = useState('')
  const queryClient = useQueryClient()

  const convertMutation = useMutation({
    mutationFn: (curl: string) => apiClient.convertCurl(curl, projectId),
    onSuccess: () => {
      setCurlCommand('')
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['captures', projectId] })
      onSuccess?.()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (curlCommand.trim()) {
      convertMutation.mutate(curlCommand.trim())
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const text = e.dataTransfer.getData('text/plain')
    if (text) {
      setCurlCommand(text)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Add cURL Command
        </CardTitle>
        <CardDescription>
          Paste your cURL command below or drag and drop a text file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Textarea
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              placeholder="curl -X GET https://api.example.com/users \
  -H 'Authorization: Bearer token' \
  -H 'Content-Type: application/json'"
              rows={6}
              className="font-mono text-sm"
              disabled={convertMutation.isLoading}
            />
            {curlCommand && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>

          {convertMutation.error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{(convertMutation.error as Error)?.message || 'An error occurred'}</span>
            </div>
          )}

          {convertMutation.data && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              <span>cURL command converted successfully!</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={!curlCommand.trim() || convertMutation.isLoading}
            className="w-full"
          >
            {convertMutation.isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Convert cURL Command
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}