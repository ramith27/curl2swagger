import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { captures: true }
        },
        specFiles: {
          where: { isActive: true },
          select: { version: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      captureCount: project._count.captures,
      specVersion: project.specFiles[0]?.version || 'No spec',
    }));
  }

  async findById(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        captures: {
          orderBy: { createdAt: 'desc' }
        },
        specFiles: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      captures: project.captures,
      specFiles: project.specFiles,
    };
  }

  async create(userId: string, data: { name: string; description?: string }) {
    const project = await this.prisma.project.create({
      data: {
        ...data,
        userId,
      }
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      userId: project.userId,
      createdAt: project.createdAt.toISOString(),
    };
  }

  async delete(projectId: string) {
    await this.prisma.project.delete({
      where: { id: projectId }
    });

    return { message: 'Project deleted successfully' };
  }

  async updateSpec(projectId: string, specContent: string) {
    // Mark all existing specs as inactive
    await this.prisma.specFile.updateMany({
      where: { projectId },
      data: { isActive: false }
    });

    // Create new active spec
    const specFile = await this.prisma.specFile.create({
      data: {
        filename: `openapi-${new Date().toISOString().split('T')[0]}.yaml`,
        content: specContent,
        version: `v${Date.now()}`,
        isActive: true,
        projectId,
      }
    });

    return specFile;
  }
}
