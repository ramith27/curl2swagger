'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '../../../lib/api'
import { ProtectedRoute } from '../../../components/ProtectedRoute'

function NewProjectContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [error, setError] = useState<string | null>(null)

  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      apiClient.createProject(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      router.push(`/projects/${project.id}`)
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create project')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    createProjectMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new project to organize your API documentation
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide basic information about your API project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My API Project"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={createProjectMutation.isLoading}
                required
              />
              <p className="text-sm text-muted-foreground">
                Choose a descriptive name for your API project
              </p>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="A brief description of your API project..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={createProjectMutation.isLoading}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Provide additional context about this project
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={createProjectMutation.isLoading}
              >
                {createProjectMutation.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
              <Button variant="outline" asChild>
                <Link href="/projects">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Add cURL Commands</p>
                <p className="text-muted-foreground">
                  Drop or paste cURL commands to capture your API requests
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Generate Specification</p>
                <p className="text-muted-foreground">
                  Create OpenAPI specifications from your captured requests
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Review & Export</p>
                <p className="text-muted-foreground">
                  Review quality reports and export your documentation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <ProtectedRoute>
      <NewProjectContent />
    </ProtectedRoute>
  )
}
