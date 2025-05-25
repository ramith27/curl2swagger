import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateProjectDto } from '../shared/index.js';

class CreateProjectDtoValidated {
  @IsString()
  name: string;

  @IsString()
  description?: string;
}

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects for user' })
  async getProjects(@CurrentUser() user: any) {
    return this.projectService.findAllByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async createProject(@Body() createDto: CreateProjectDtoValidated, @CurrentUser() user: any) {
    return this.projectService.create(user.id, createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async getProject(@Param('id') id: string) {
    return this.projectService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async deleteProject(@Param('id') id: string) {
    return this.projectService.delete(id);
  }
}
