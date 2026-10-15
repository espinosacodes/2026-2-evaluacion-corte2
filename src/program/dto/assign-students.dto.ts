import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignStudentsDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    minItems: 1,
    example: ['4fcfc5ab-7902-478f-b173-b8f1e751af12'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  studentIds: string[];
}
