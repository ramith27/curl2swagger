import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { QualityService } from './quality.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

class LintSpecDto {
  @IsString()
  specContent: string;
}

class SecurityScanDto {
  @IsString()
  specContent: string;
}

class PerformanceAnalysisDto {
  @IsString()
  specContent: string;
}

@ApiTags('quality')
@Controller('quality')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Post('lint')
  @ApiOperation({ summary: 'Lint OpenAPI specification' })
  @ApiResponse({ status: 200, description: 'Lint analysis completed' })
  async lintSpec(@Body() lintDto: LintSpecDto) {
    return this.qualityService.lintSpec(lintDto.specContent);
  }

  @Post('security-scan')
  @ApiOperation({ summary: 'Perform security analysis on OpenAPI spec' })
  @ApiResponse({ status: 200, description: 'Security scan completed' })
  async securityScan(@Body() scanDto: SecurityScanDto) {
    return this.qualityService.securityScan(scanDto.specContent);
  }

  @Post('performance-analysis')
  @ApiOperation({ summary: 'Analyze performance implications of OpenAPI spec' })
  @ApiResponse({ status: 200, description: 'Performance analysis completed' })
  async performanceAnalysis(@Body() analysisDto: PerformanceAnalysisDto) {
    return this.qualityService.performanceAnalysis(analysisDto.specContent);
  }

  @Get('report/:projectId')
  @ApiOperation({ summary: 'Get comprehensive quality report for project' })
  @ApiResponse({ status: 200, description: 'Quality report generated' })
  async getQualityReport(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.qualityService.getQualityReport(projectId);
  }
}
