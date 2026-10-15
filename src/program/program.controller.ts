import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../student/dto/pagination.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';
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

  @Post('bulk')
  @ApiOperation({ summary: 'Create all programs in a batch or none' })
  @ApiCreatedResponse({ description: 'Programs were created', type: [Program] })
  @ApiBadRequestResponse({
    description: 'Invalid programs array or program data',
  })
  @ApiConflictResponse({ description: 'Program name or code already exists' })
  bulkCreate(@Body() bulkCreateProgramDto: BulkCreateProgramDto) {
    return this.programService.bulkCreate(bulkCreateProgramDto);
  }

  @Get()
  @ApiOperation({ summary: 'List programs with limit and skip' })
  @ApiOkResponse({ description: 'Program list', type: [Program] })
  @ApiBadRequestResponse({ description: 'Invalid pagination params' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.programService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a program with its students' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Program with its students', type: Program })
  @ApiBadRequestResponse({ description: 'Invalid program UUID' })
  @ApiNotFoundResponse({ description: 'Program not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.programService.findOne(id);
  }

  @Patch(':id/students')
  @ApiOperation({ summary: 'Add students while keeping current assignments' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Program with its students', type: Program })
  @ApiBadRequestResponse({ description: 'Invalid UUID or studentIds' })
  @ApiNotFoundResponse({ description: 'Program or student not found' })
  assignStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignStudentsDto: AssignStudentsDto,
  ) {
    return this.programService.assignStudents(id, assignStudentsDto);
  }

  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
