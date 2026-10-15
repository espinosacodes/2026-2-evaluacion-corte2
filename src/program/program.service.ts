import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import { PaginationDto } from '../student/dto/pagination.dto';
import { Student } from '../student/entities/student.entity';
import { User } from '../user/entities/user.entity';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { Program } from './entities/program.entity';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createProgramDto: CreateProgramDto,
    user: User,
  ): Promise<Program> {
    const program = this.programRepository.create({
      ...createProgramDto,
      createdBy: { id: user.id },
    });

    try {
      return await this.programRepository.save(program);
    } catch (error: unknown) {
      this.handleDatabaseError(error);
    }
  }

  findAll(paginationDto: PaginationDto): Promise<Program[]> {
    const { limit = 10, skip = 0 } = paginationDto;

    return this.programRepository.find({
      take: limit,
      skip,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: { students: true },
    });

    if (!program) {
      throw new NotFoundException(`Program with id ${id} not found`);
    }

    return program;
  }

  async assignStudents(
    id: string,
    assignStudentsDto: AssignStudentsDto,
  ): Promise<Program> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Serializa las asignaciones al mismo programa antes de leer sus estudiantes.
      const program = await queryRunner.manager.findOne(Program, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!program) {
        throw new NotFoundException(`Program with id ${id} not found`);
      }

      program.students = await queryRunner.manager.find(Student, {
        where: { program: { id: program.id } },
      });

      const studentIds = [
        ...new Set(
          assignStudentsDto.studentIds.map((studentId) =>
            studentId.toLowerCase(),
          ),
        ),
      ];
      const students = await queryRunner.manager.findBy(Student, {
        id: In(studentIds),
      });

      if (students.length !== studentIds.length) {
        throw new NotFoundException('One or more students were not found');
      }

      const currentIds = new Set(program.students.map((student) => student.id));
      program.students.push(
        ...students.filter((student) => !currentIds.has(student.id)),
      );

      await queryRunner.manager.save(program);
      await queryRunner.commitTransaction();
      return program;
    } catch (error: unknown) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async bulkCreate(
    bulkCreateProgramDto: BulkCreateProgramDto,
    user: User,
  ): Promise<Program[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const programs = bulkCreateProgramDto.programs.map((programDto) =>
        queryRunner.manager.create(Program, {
          ...programDto,
          createdBy: { id: user.id },
        }),
      );
      const createdPrograms = await queryRunner.manager.save(programs);

      await queryRunner.commitTransaction();
      return createdPrograms;
    } catch (error: unknown) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.handleDatabaseError(error);
    } finally {
      await queryRunner.release();
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    ) {
      throw new ConflictException(
        'A program with this name or code already exists',
      );
    }

    throw error;
  }
}
