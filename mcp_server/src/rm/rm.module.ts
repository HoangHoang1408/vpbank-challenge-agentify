import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RmController } from './rm.controller';
import { RmService } from './rm.service';
import { RelationshipManager } from './entities/rm.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RelationshipManager])],
    controllers: [RmController],
    providers: [RmService],
    exports: [RmService],
})
export class RmModule { }

