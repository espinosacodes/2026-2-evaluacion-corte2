import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ProgramController],
  imports: [TypeOrmModule.forFeature([Program]), UserModule],
  providers: [ProgramService],
})
export class ProgramModule {}
