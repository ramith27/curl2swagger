import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CaptureService } from './capture.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

class ConvertCurlDto {
  @IsString()
  rawCurl: string;

  @IsString()
  projectId?: string;
}

@ApiTags('captures')
@Controller('captures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CaptureController {
  constructor(private readonly captureService: CaptureService) {}

  @Post('convert')
  @ApiOperation({ summary: 'Convert cURL command to structured data' })
  @ApiResponse({ status: 201, description: 'cURL converted successfully' })
  async convertCurl(@Body() convertDto: ConvertCurlDto, @CurrentUser() user: any) {
    return this.captureService.parseCurl(convertDto.rawCurl, convertDto.projectId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get captures for project' })
  async getCapturesByProject(@Param('projectId') projectId: string) {
    return this.captureService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get capture by ID' })
  async getCapture(@Param('id') id: string) {
    return this.captureService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete capture' })
  async deleteCapture(@Param('id') id: string) {
    return this.captureService.deleteCapture(id);
  }
}
