import { Module } from "@nestjs/common";
import { RmTaskTool } from "./rm_task.tool";
import { McpModule } from "@rekog/mcp-nest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FactRmTask } from "src/rm_task/entities/fact_rm_task.entity";
import { RelationshipManager } from "src/rm/entities/rm.entity";
import { Customer } from "src/customer/entities/customer.entity";
import { Card } from "src/card/entities/card.entity";
import { CustomerTool } from "./customer.tool";
import { CardTool } from "./card.tool";

@Module({
    imports: [McpModule.forRoot({
        name: 'tools',
        version: '1.0.0',
    }), TypeOrmModule.forFeature([FactRmTask, RelationshipManager, Customer, Card])],
    providers: [RmTaskTool, CustomerTool, CardTool],
    exports: [RmTaskTool, CustomerTool, CardTool],
})
export class ToolModule { }