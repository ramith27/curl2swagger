import { Controller, Post, Get, Param, Body, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { SpecService } from './spec.service';
import { QueueService } from '../queue/queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

class GenerateSpecDto {
  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  version?: string;
}

class ValidateSpecDto {
  @IsString()
  specContent: string;
}

class GenerateSDKDto {
  @IsString()
  specContent: string;

  @IsString()
  language: string;
}

@ApiTags('specs')
@Controller('specs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SpecController {
  constructor(
    private readonly specService: SpecService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate OpenAPI spec from project captures' })
  @ApiResponse({ status: 201, description: 'Spec generation initiated' })
  async generateSpec(@Body() generateDto: GenerateSpecDto, @CurrentUser() user: any) {
    // Queue the spec generation job
    const job = await this.queueService.addSpecJob('generate-spec', {
      projectId: generateDto.projectId,
      version: generateDto.version || '1.0.0',
      userId: user.id,
    });
    
    return {
      jobId: job.id,
      message: 'Spec generation job initiated',
      status: 'queued',
    };
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get active spec for project' })
  async getProjectSpec(@Param('projectId') projectId: string) {
    // This would be implemented in the project service to get the active spec
    return { message: 'Get active spec - to be implemented' };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate OpenAPI specification' })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validateSpec(@Body() validateDto: ValidateSpecDto) {
    return this.specService.validateSpec(validateDto.specContent);
  }

  @Post('generate-sdk')
  @ApiOperation({ summary: 'Generate SDK from OpenAPI spec' })
  @ApiResponse({ status: 200, description: 'SDK generation initiated' })
  async generateSDK(@Body() generateSDKDto: GenerateSDKDto) {
    const job = await this.queueService.addSpecJob('generate-sdk', {
      specContent: generateSDKDto.specContent,
      language: generateSDKDto.language,
    });
    
    return {
      jobId: job.id,
      message: 'SDK generation job initiated',
      status: 'queued',
    };
  }

  @Post('generate-docs')
  @ApiOperation({ summary: 'Generate documentation from OpenAPI spec' })
  @ApiResponse({ status: 200, description: 'Documentation generation initiated' })
  async generateDocs(@Body() body: { specContent: string }) {
    const job = await this.queueService.addDocsJob({
      specContent: body.specContent,
    });
    
    return {
      jobId: job.id,
      message: 'Documentation generation job initiated',
      status: 'queued',
    };
  }
}
