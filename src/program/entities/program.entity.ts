import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('program')
export class Program {
  @ApiProperty({ format: 'uuid', description: 'Program id (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Ingenieria de Sistemas' })
  @Column('text', { unique: true })
  name: string;

  @ApiProperty({ example: 'SIS' })
  @Column('text', { unique: true })
  code: string;

  @ApiProperty({ example: 160 })
  @Column('int')
  credits: number;

  // TODO Reto 2: relación 1:N con Student -> propiedad `students?: Student[]`
  // TODO Reto 4: relación N:1 con User -> propiedad `createdBy?: User` (el admin que lo creó)
}
