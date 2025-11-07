import { Injectable, Param } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FactRmTask, TaskStatus, TaskType } from "src/rm_task/entities/fact_rm_task.entity";
import { RelationshipManager } from "src/rm/entities/rm.entity";
import { Customer } from "src/customer/entities/customer.entity";
import { Repository } from "typeorm";
import { Tool } from "@rekog/mcp-nest";
import z from "zod";
import { CreateTaskDto } from "src/rm_task/dto/create-task.dto";

@Injectable()
export class RmTaskTool {
    constructor(
        @InjectRepository(FactRmTask)
        private readonly taskRepository: Repository<FactRmTask>,
        @InjectRepository(RelationshipManager)
        private readonly rmRepository: Repository<RelationshipManager>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    @Tool({
        name: "rm_create_task",
        description: "Tool to create a new Relationship Manager task",
        parameters: z.object({
            rmId: z.number({
                "required_error": "Relationship Manager ID is required",
                "invalid_type_error": "Relationship Manager ID must be a number",
                "description": "The ID of the Relationship Manager who is responsible for the task",
            }),
            customerId: z.number({
                "required_error": "Customer ID is required",
                "invalid_type_error": "Customer ID must be a number",
                "description": "The ID of the Customer who is the subject of the task",
            }),
            taskType: z.nativeEnum(TaskType, {
                "required_error": "Task type is required",
                "invalid_type_error": "Task type must be a valid TaskType enum value",
                "description": "The type of task to be created. Valid values are: " + Object.values(TaskType).join(", "),
            }),
            status: z.nativeEnum(TaskStatus, {
                "required_error": "Task status is required",
                "invalid_type_error": "Task status must be a valid TaskStatus enum value",
                "description": "The status of the task to be created. Valid values are: " + Object.values(TaskStatus).join(", "),
            }),
            taskDetails: z.string({
                "required_error": "Task details are required",
                "invalid_type_error": "Task details must be a string",
                "description": "The detailed description of the task to be created",
            }),
            dueDate: z.string({
                "required_error": "Due date is required",
                "description": "The due date for the task to be created in the format YYYY-MM-DD",
            })
        })
    })
    async createRmTask({ rmId, customerId, taskType, status, taskDetails, dueDate }: { rmId: number, customerId: number, taskType: TaskType, status: TaskStatus, taskDetails: string, dueDate: Date }) {
        return "Okay"
    }
}