import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GenEmailService } from "./genEmail.service";
import { GenEmailController } from "./genEmail.controller";
import { EmailRulesService } from "./email-rules.service";
import { EmailSchedulerService } from "./email-scheduler.service";
import { GeneratedEmail } from "./entities/generated-email.entity";
import { Customer } from "../customer/entities/customer.entity";
import { RelationshipManager } from "../rm/entities/rm.entity";
import { RmTaskModule } from "../rm_task/rm_task.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([GeneratedEmail, Customer, RelationshipManager]),
        RmTaskModule,
    ],
    providers: [GenEmailService, EmailRulesService, EmailSchedulerService],
    exports: [GenEmailService, EmailRulesService, EmailSchedulerService],
    controllers: [GenEmailController],
})
export class GenEmailModule { }