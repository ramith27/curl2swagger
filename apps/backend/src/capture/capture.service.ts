import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CurlParser } from '@curl2swagger/parser';

@Injectable()
export class CaptureService {
  constructor(private readonly prisma: PrismaService) {}

  async parseCurl(rawCurl: string, projectId?: string) {
    try {
      const parsed = await CurlParser.parse(rawCurl);
      
      if (!parsed) {
        throw new Error('Failed to parse cURL command');
      }

      // Create capture record
      const capture = await this.prisma.capture.create({
        data: {
          rawCurl,
          method: parsed.method,
          url: parsed.url,
          headers: parsed.headers || {},
          body: parsed.body ? (typeof parsed.body === 'string' ? parsed.body : JSON.stringify(parsed.body)) : null,
          parsed: parsed as any, // Cast to avoid Prisma JSON type issues
          projectId: projectId || null,
        }
      });

      return {
        id: capture.id,
        rawCurl: capture.rawCurl,
        method: capture.method,
        url: capture.url,
        headers: capture.headers,
        body: capture.body,
        parsed: capture.parsed,
        projectId: capture.projectId,
        createdAt: capture.createdAt.toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to parse cURL: ${(error as Error).message}`);
    }
  }

  async findByProject(projectId: string) {
    const captures = await this.prisma.capture.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return captures.map(capture => ({
      id: capture.id,
      rawCurl: capture.rawCurl,
      method: capture.method,
      url: capture.url,
      headers: capture.headers,
      body: capture.body,
      createdAt: capture.createdAt.toISOString(),
    }));
  }

  async findById(id: string) {
    const capture = await this.prisma.capture.findUnique({
      where: { id }
    });

    if (!capture) {
      throw new Error('Capture not found');
    }

    return {
      id: capture.id,
      rawCurl: capture.rawCurl,
      method: capture.method,
      url: capture.url,
      headers: capture.headers,
      body: capture.body,
      parsed: capture.parsed,
      projectId: capture.projectId,
      createdAt: capture.createdAt.toISOString(),
    };
  }

  async deleteCapture(id: string) {
    await this.prisma.capture.delete({
      where: { id }
    });

    return { message: 'Capture deleted successfully' };
  }
}
