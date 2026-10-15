import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateProgramDto {
  @ApiProperty({ example: 'Ingenieria de Sistemas', minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'SIS', pattern: '^[A-Z]{3,6}$' })
  @IsString()
  @Matches(/^[A-Z]{3,6}$/, {
    message: 'code must contain between 3 and 6 uppercase letters',
  })
  code: string;

  @ApiProperty({ example: 160, type: 'integer', minimum: 1 })
  @IsInt()
  @IsPositive()
  credits: number;
}
