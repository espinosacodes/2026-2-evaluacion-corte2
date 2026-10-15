import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../student/dto/pagination.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { Program } from './entities/program.entity';
import { ProgramService } from './program.service';

@ApiTags('Programs')
@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  @ApiOperation({ summary: 'Create a program' })
  @ApiCreatedResponse({ description: 'Program was created', type: Program })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiConflictResponse({ description: 'Program name or code already exists' })
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Get()
  @ApiOperation({ summary: 'List programs with limit and skip' })
  @ApiOkResponse({ description: 'Program list', type: [Program] })
  @ApiBadRequestResponse({ description: 'Invalid pagination params' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.programService.findAll(paginationDto);
  }

  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)
  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
