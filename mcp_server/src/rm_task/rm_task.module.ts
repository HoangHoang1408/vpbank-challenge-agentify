import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './rm_task.controller';
import { FactRmTaskService } from './rm_task.service';
import { FactRmTask } from './entities/fact_rm_task.entity';
import { RelationshipManager } from '../rm/entities/rm.entity';
import { Customer } from '../customer/entities/customer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FactRmTask, RelationshipManager, Customer])],
    controllers: [TaskController],
    providers: [FactRmTaskService],
    exports: [FactRmTaskService],
})
export class RmTaskModule { }

