import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { User } from '../../user/entities/user.entity';

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

  @ApiProperty({ type: () => [Student], required: false })
  @OneToMany(() => Student, (student) => student.program)
  students?: Student[];

  @ApiProperty({
    description: 'Administrator who created the program',
    type: 'object',
    properties: { id: { type: 'string', format: 'uuid' } },
    readOnly: true,
    selfRequired: false,
    nullable: true,
  })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User;
}
