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
import { Auth } from '../user/decorators/auth.decorator';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { ValidRoles } from '../user/enums/valid-roles.enum';
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
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Create a program',
    description: 'Requires the admin role',
  })
  @ApiCreatedResponse({ description: 'Program was created', type: Program })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiConflictResponse({ description: 'Program name or code already exists' })
  create(@Body() createProgramDto: CreateProgramDto, @GetUser() user: User) {
    return this.programService.create(createProgramDto, user);
  }

  @Post('bulk')
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Create all programs in a batch or none',
    description: 'Requires the admin role',
  })
  @ApiCreatedResponse({ description: 'Programs were created', type: [Program] })
  @ApiBadRequestResponse({
    description: 'Invalid programs array or program data',
  })
  @ApiConflictResponse({ description: 'Program name or code already exists' })
  bulkCreate(
    @Body() bulkCreateProgramDto: BulkCreateProgramDto,
    @GetUser() user: User,
  ) {
    return this.programService.bulkCreate(bulkCreateProgramDto, user);
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
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Add students while keeping current assignments',
    description: 'Requires the admin role',
  })
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
}
