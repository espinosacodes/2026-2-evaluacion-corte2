import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationDto } from '../student/dto/pagination.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { Program } from './entities/program.entity';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<Program> {
    const program = this.programRepository.create(createProgramDto);

    try {
      return await this.programRepository.save(program);
    } catch (error: unknown) {
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

  findAll(paginationDto: PaginationDto): Promise<Program[]> {
    const { limit = 10, skip = 0 } = paginationDto;

    return this.programRepository.find({
      take: limit,
      skip,
      order: { name: 'ASC' },
    });
  }

  // TODO Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe

  // TODO Reto 2: assignStudents(id, assignStudentsDto) -> AGREGA estudiantes al programa
  //   dentro de una transacción (QueryRunner), conservando los que ya tenía.
  //   Mismo patrón del update de estudiantes corregido en clase (combinar las notas):
  //   traer los actuales -> combinar con los nuevos -> guardar la lista completa.
  //   Si algún id no existe: 404 y rollback.

  // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
  //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
}
