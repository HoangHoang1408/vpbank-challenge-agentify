import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FactRmTask, TaskStatus, TaskType } from "src/rm_task/entities/fact_rm_task.entity";
import { RelationshipManager } from "src/rm/entities/rm.entity";
import { Customer } from "src/customer/entities/customer.entity";
import { Repository } from "typeorm";
import { type Context, Tool } from "@rekog/mcp-nest";
import type { Request } from "express";
import z from "zod";
import { randomUUID } from "crypto";

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
        name: "find_rm_task",
        description: "Tool to search for a task for a relationship manager based on specified criteria. Returns task information if found, or a message asking for more specific information if multiple tasks match.",
        parameters: z.object({
            customerId: z.optional(z.number({
                "description": "The unique identifier for a customer. If other customer information is provided, call `find_customer` first to obtain the `customerId`.",
            })),
            taskType: z.optional(z.nativeEnum(TaskType, {
                "description": "The type of task to filter by",
            })),
            taskStatus: z.optional(z.nativeEnum(TaskStatus, {
                "description": "The current status of the task",
            })),
            taskDueDateStart: z.optional(z.string({
                "description": "The start date to filter tasks by due date range in YYYY-MM-DD format",
            })),
            taskDueDateEnd: z.optional(z.string({
                "description": "The end date to filter tasks by due date range in YYYY-MM-DD format",
            })),
        })
    })
    async findRmTask({
        customerId,
        taskType,
        taskStatus,
        taskDueDateStart,
        taskDueDateEnd
    }: {
        customerId?: number;
        taskType?: TaskType;
        taskStatus?: TaskStatus;
        taskDueDateStart?: string;
        taskDueDateEnd?: string;
    }, context: Context, request: Request) {
        // Extract relationship manager id from request headers or context
        // For now, we'll assume rmId is passed in the request
        const rmId = (request as any).rmId || (request.headers as any)['x-rm-id'];

        if (!rmId) {
            return {
                task_info: {},
                message: "Relationship manager id not found in configuration. Please provide rmId in request headers as 'x-rm-id'.",
                code: "failed"
            };
        }

        // Build query builder with optimized select
        const queryBuilder = this.taskRepository
            .createQueryBuilder('task')
            .select([
                'task.id',
                'task.customerId',
                'task.taskType',
                'task.status',
                'task.taskDetails',
                'task.dueDate'
            ])
            .where('task.rmId = :rmId', { rmId: parseInt(rmId) });

        // Track which fields were used in search for later analysis
        const usedFields = new Set<string>();

        // Build WHERE conditions using parameterized queries
        if (customerId !== undefined) {
            if (isNaN(customerId)) {
                return {
                    task_info: {},
                    message: "Invalid customer ID. Customer ID must be an integer. Please provide a valid customer ID or ask back for customer information and use the `find_customer` tool to obtain it.",
                    code: "failed"
                };
            }
            queryBuilder.andWhere('task.customerId = :customerId', { customerId });
            usedFields.add('customerId');
        }

        if (taskType) {
            queryBuilder.andWhere('task.taskType = :taskType', { taskType });
            usedFields.add('taskType');
        }

        if (taskStatus) {
            queryBuilder.andWhere('task.status = :taskStatus', { taskStatus });
            usedFields.add('status');
        }

        if (taskDueDateStart || taskDueDateEnd) {
            if (taskDueDateStart && taskDueDateEnd) {
                // Validate date format
                const startDate = new Date(taskDueDateStart);
                const endDate = new Date(taskDueDateEnd);

                if (isNaN(startDate.getTime())) {
                    return {
                        task_info: {},
                        message: "Invalid start date. Please provide a valid start date in YYYY-MM-DD format.",
                        code: "failed"
                    };
                }

                if (isNaN(endDate.getTime())) {
                    return {
                        task_info: {},
                        message: "Invalid end date. Please provide a valid end date in YYYY-MM-DD format.",
                        code: "failed"
                    };
                }

                if (startDate > endDate) {
                    return {
                        task_info: {},
                        message: "Start date cannot be greater than end date. Please provide a valid date range.",
                        code: "failed"
                    };
                }

                queryBuilder.andWhere('task.dueDate BETWEEN :startDate AND :endDate', {
                    startDate: taskDueDateStart,
                    endDate: taskDueDateEnd
                });
            } else if (taskDueDateStart) {
                const startDate = new Date(taskDueDateStart);
                if (isNaN(startDate.getTime())) {
                    return {
                        task_info: {},
                        message: "Invalid start date. Please provide a valid start date in YYYY-MM-DD format.",
                        code: "failed"
                    };
                }
                queryBuilder.andWhere('task.dueDate >= :startDate', { startDate: taskDueDateStart });
            } else if (taskDueDateEnd) {
                const endDate = new Date(taskDueDateEnd);
                if (isNaN(endDate.getTime())) {
                    return {
                        task_info: {},
                        message: "Invalid end date. Please provide a valid end date in YYYY-MM-DD format.",
                        code: "failed"
                    };
                }
                queryBuilder.andWhere('task.dueDate <= :endDate', { endDate: taskDueDateEnd });
            }
            usedFields.add('dueDate');
        }

        try {
            // Execute the optimized query
            const tasks = await queryBuilder.getMany();

            // Check the number of results
            if (!tasks || tasks.length === 0) {
                return {
                    task_info: {},
                    message: "No task found matching the provided criteria. Please ask back for different information.",
                    code: "failed"
                };
            }

            if (tasks.length > 1) {
                // Find the column with the most unique values
                const cols = ["customerId", "taskType", "status", "taskDetails", "dueDate"];
                let maxValueCount: [string, number] = ["taskType", 0];

                for (const col of cols) {
                    const uniqueValues = new Set(
                        tasks.map(t => {
                            const val = (t as any)[col];
                            return val instanceof Date ? val.toISOString() : (val ?? null);
                        })
                    );
                    const count = uniqueValues.size;
                    if (count > maxValueCount[1]) {
                        maxValueCount = [col, count];
                    }
                }

                const fieldName = maxValueCount[0] === "customerId" ? "customer information" : maxValueCount[0];

                return {
                    task_info: {},
                    message: `(${tasks.length}) tasks found matching the criteria. Please ask back for ${fieldName} to identify a single task.`,
                    code: "failed"
                };
            }

            // Exactly one task found
            const task = tasks[0];
            const taskInfo = {
                id: task.id,
                customerId: task.customerId,
                taskType: task.taskType,
                taskStatus: task.status,
                taskDetails: task.taskDetails,
                dueDate: task.dueDate,
            };

            return {
                task_info: taskInfo,
                message: "Task found successfully.",
                code: "succeeded"
            };

        } catch (error) {
            return {
                task_info: {},
                message: `An error occurred while searching for task: ${error instanceof Error ? error.message : String(error)}`,
                code: "failed"
            };
        }
    }

    @Tool({
        name: "create_rm_task",
        description: "Tool to create a new task for a relationship manager. This function schedules a new task, linking it to a specific customer and setting a due date.",
        parameters: z.object({
            customerId: z.number({
                "description": "The unique identifier for the customer the task is for. If the user provides a name or other details, use the `find_customer` tool first.",
            }),
            taskType: z.nativeEnum(TaskType, {
                "description": "The type of task to create",
            }),
            taskStatus: z.nativeEnum(TaskStatus, {
                "description": "The initial status of the task",
            }),
            taskDueDate: z.string({
                "description": "The specific due date for the task in YYYY-MM-DD format",
            }),
            taskDetails: z.string({
                "description": "Detailed description of the task",
            }),
        })
    })
    async createRmTask({
        customerId,
        taskType,
        taskStatus,
        taskDueDate,
        taskDetails
    }: {
        customerId: number;
        taskType: TaskType;
        taskStatus: TaskStatus;
        taskDueDate: string;
        taskDetails: string;
    }, context: Context, request: Request) {
        // Extract relationship manager id from request
        const rmId = (request as any).rmId || (request.headers as any)['x-rm-id'];

        if (!rmId) {
            return {
                message: "Relationship manager id not found in configuration. Please provide rmId in request headers as 'x-rm-id'.",
                code: "failed"
            };
        }

        // Validate customer ID
        if (isNaN(customerId)) {
            return {
                message: "Invalid customer ID. Customer ID must be an integer. Please provide a valid customer ID or ask back for customer information and use the `find_customer` tool to obtain it.",
                code: "failed"
            };
        }

        // Validate due date
        const dueDate = new Date(taskDueDate);
        if (isNaN(dueDate.getTime())) {
            return {
                message: "Invalid task due date. Please provide a task due date in YYYY-MM-DD format.",
                code: "failed"
            };
        }

        return {
            message: "All input is now valid.",
            ask_confirmation: true,
            code: "succeeded"
        };
    }

    @Tool({
        name: "update_rm_task",
        description: "Tool to update specific fields of an existing task for the relationship manager. This function modifies one or more fields of a specific task identified by its unique ID.",
        parameters: z.object({
            rmTaskId: z.number({
                "description": "The unique identifier of the task to update. If the user refers to a task by attributes, call `find_rm_task` first to get the `rmTaskId`.",
            }),
            updateTaskStatus: z.optional(z.nativeEnum(TaskStatus, {
                "description": "The new status of the task.",
            })),
            updateTaskDueDate: z.optional(z.string({
                "description": "The new due date of the task in YYYY-MM-DD format.",
            })),
            updateTaskDetails: z.optional(z.string({
                "description": "The new details of the task.",
            })),
        })
    })
    async updateRmTask({
        rmTaskId,
        updateTaskStatus,
        updateTaskDueDate,
        updateTaskDetails
    }: {
        rmTaskId: number;
        updateTaskStatus?: TaskStatus;
        updateTaskDueDate?: string;
        updateTaskDetails?: string;
    }, context: Context, request: Request) {
        // Extract relationship manager id from request
        const rmId = (request as any).rmId || (request.headers as any)['x-rm-id'];

        if (!rmId) {
            return {
                message: "Relationship manager id not found in configuration. Please provide rmId in request headers as 'x-rm-id'.",
                code: "failed"
            };
        }

        // Validate task ID
        if (isNaN(rmTaskId)) {
            return {
                message: "Invalid task ID. Task ID must be an integer. Please provide a valid task ID or ask back for task information and use the `find_rm_task` tool to obtain it.",
                code: "failed"
            };
        }

        // Check if at least one field to update is provided
        if (!updateTaskStatus && !updateTaskDueDate && !updateTaskDetails) {
            return {
                message: "No fields to update. Please provide a field to update.",
                code: "failed"
            };
        }

        // Validate due date if provided
        if (updateTaskDueDate) {
            const dueDate = new Date(updateTaskDueDate);
            if (isNaN(dueDate.getTime())) {
                return {
                    message: "Invalid task due date. Please provide a task due date in YYYY-MM-DD format.",
                    code: "failed"
                };
            }
        }

        return {
            message: "All input is now valid.",
            ask_confirmation: true,
            code: "succeeded"
        };
    }

    @Tool({
        name: "report_performance",
        description: "Tool to retrieve a performance report for the relationship manager for a given period. This function calculates and returns key performance indicators (KPIs) over a specified date range.",
        parameters: z.object({
            startDate: z.optional(z.string({
                "description": "The start date of the performance report in YYYY-MM-DD format.",
            })),
            endDate: z.optional(z.string({
                "description": "The end date of the performance report in YYYY-MM-DD format.",
            })),
        })
    })
    async reportPerformance({
        startDate,
        endDate
    }: {
        startDate?: string;
        endDate?: string;
    }, context: Context, request: Request) {
        // Extract relationship manager id from request
        const rmId = (request as any).rmId || (request.headers as any)['x-rm-id'];

        if (!rmId) {
            return {
                task_info: {},
                message: "Relationship manager id not found in configuration. Please provide rmId in request headers as 'x-rm-id'.",
                code: "failed"
            };
        }

        // Build query builder
        const queryBuilder = this.taskRepository
            .createQueryBuilder('task')
            .select('task.status', 'status')
            .addSelect('COUNT(*)', 'task_count')
            .where('task.rmId = :rmId', { rmId: parseInt(rmId) })
            .groupBy('task.status')
            .orderBy('task_count', 'DESC');

        // Add date filters if provided
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return {
                    task_info: {},
                    message: "Invalid start date. Please provide a valid start date in YYYY-MM-DD format.",
                    code: "failed"
                };
            }
            queryBuilder.andWhere('task.createdAt >= :startDate', { startDate });
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return {
                    task_info: {},
                    message: "Invalid end date. Please provide a valid end date in YYYY-MM-DD format.",
                    code: "failed"
                };
            }
            queryBuilder.andWhere('task.createdAt <= :endDate', { endDate });
        }

        try {
            // Execute the query
            const results = await queryBuilder.getRawMany();

            // Check if any tasks found
            if (!results || results.length === 0) {
                return {
                    task_info: {},
                    message: "No task found during the period. Please ask back for a different period.",
                    code: "failed"
                };
            }

            // Build performance report
            const performanceReport: Record<string, number> = {};
            let totalTasks = 0;

            for (const result of results) {
                const count = parseInt(result.task_count);
                performanceReport[`${result.status.toLowerCase()} tasks`] = count;
                totalTasks += count;
            }

            performanceReport["total tasks"] = totalTasks;

            return {
                performance_report: performanceReport,
                message: "Performance report retrieved successfully.",
                code: "succeeded"
            };

        } catch (error) {
            return {
                task_info: {},
                message: `An error occurred while searching for task: ${error instanceof Error ? error.message : String(error)}`,
                code: "failed"
            };
        }
    }

    /**
     * Private method to actually create a task in the database.
     * This is called by _create_rm_task MCP tool after user approval.
     */
    private async _createRmTaskInternal(
        rmId: number,
        customerId: number,
        taskType: TaskType,
        taskStatus: TaskStatus,
        taskDueDate: string,
        taskDetails: string = "",
    ): Promise<{ message: string; code: string; taskId?: string; id?: number }> {
        try {
            // Validate RM exists
            const rm = await this.rmRepository.findOne({ where: { id: rmId } });
            if (!rm) {
                return {
                    message: `Relationship Manager with ID ${rmId} not found`,
                    code: "failed"
                };
            }

            // Validate Customer exists
            const customer = await this.customerRepository.findOne({ where: { id: customerId } });
            if (!customer) {
                return {
                    message: `Customer with ID ${customerId} not found`,
                    code: "failed"
                };
            }

            // Generate a unique taskId
            const taskId = `TASK-${randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase()}`;

            // Parse the due date
            const dueDate = new Date(taskDueDate);
            if (isNaN(dueDate.getTime())) {
                return {
                    message: "Invalid task due date format",
                    code: "failed"
                };
            }

            // Create the task
            const task = this.taskRepository.create({
                taskId,
                rmId,
                customerId,
                taskType,
                status: taskStatus,
                taskDetails,
                dueDate,
                relationshipManager: rm,
                customer: customer,
            });

            const savedTask = await this.taskRepository.save(task);

            return {
                message: `Successfully created task in database. Task ID: ${savedTask.taskId}`,
                code: "succeeded",
                taskId: savedTask.taskId,
                id: savedTask.id,
            };
        } catch (error) {
            return {
                message: `Database error while creating task: ${error instanceof Error ? error.message : String(error)}`,
                code: "failed"
            };
        }
    }

    /**
     * Private method to actually update a task in the database.
     * This is called by _update_rm_task MCP tool after user approval.
     */
    private async _updateRmTaskInternal(
        rmTaskId: number,
        updateTaskStatus?: TaskStatus,
        updateTaskDueDate?: string,
        updateTaskDetails?: string,
    ): Promise<{ message: string; code: string; taskId?: string; id?: number }> {
        try {
            // Find the task
            const task = await this.taskRepository.findOne({ where: { id: rmTaskId } });
            if (!task) {
                return {
                    message: `No task found with ID ${rmTaskId}`,
                    code: "failed"
                };
            }

            // Build update fields
            if (updateTaskStatus !== undefined) {
                task.status = updateTaskStatus;
            }

            if (updateTaskDueDate !== undefined) {
                const dueDate = new Date(updateTaskDueDate);
                if (isNaN(dueDate.getTime())) {
                    return {
                        message: "Invalid task due date format",
                        code: "failed"
                    };
                }
                task.dueDate = dueDate;
            }

            if (updateTaskDetails !== undefined) {
                task.taskDetails = updateTaskDetails;
            }

            // Save the updated task
            const updatedTask = await this.taskRepository.save(task);

            return {
                message: `Successfully updated task. Task ID: ${updatedTask.taskId}`,
                code: "succeeded",
                taskId: updatedTask.taskId,
                id: updatedTask.id,
            };
        } catch (error) {
            return {
                message: `Database error while updating task: ${error instanceof Error ? error.message : String(error)}`,
                code: "failed"
            };
        }
    }

    /**
     * Internal MCP tool to actually create a task after user approval.
     * This tool is NOT bound to the LLM - it's only called programmatically after approval.
     */
    @Tool({
        name: "_create_rm_task",
        description: "Internal tool to actually create a task in the database. This should only be called after user approval.",
        parameters: z.object({
            customerId: z.number({
                "description": "The unique identifier for the customer",
            }),
            taskType: z.nativeEnum(TaskType, {
                "description": "The type of task to create",
            }),
            taskStatus: z.nativeEnum(TaskStatus, {
                "description": "The initial status of the task",
            }),
            taskDueDate: z.string({
                "description": "The specific due date for the task in YYYY-MM-DD format",
            }),
            taskDetails: z.string({
                "description": "Detailed description of the task",
            }),
        })
    })
    async _createRmTask({
        customerId,
        taskType,
        taskStatus,
        taskDueDate,
        taskDetails
    }: {
        customerId: number;
        taskType: TaskType;
        taskStatus: TaskStatus;
        taskDueDate: string;
        taskDetails: string;
    }, context: Context, request: Request) {
        // Extract relationship manager id from request
        const rmId = (request as any).rmId || (request.headers as any)['x-rm-id'];

        if (!rmId) {
            return {
                message: "Relationship manager id not found in configuration. Please provide rmId in request headers as 'x-rm-id'.",
                code: "failed"
            };
        }

        return await this._createRmTaskInternal(
            rmId,
            customerId,
            taskType,
            taskStatus,
            taskDueDate,
            taskDetails
        );
    }

    /**
     * Internal MCP tool to actually update a task after user approval.
     * This tool is NOT bound to the LLM - it's only called programmatically after approval.
     */
    @Tool({
        name: "_update_rm_task",
        description: "Internal tool to actually update a task in the database. This should only be called after user approval.",
        parameters: z.object({
            rmTaskId: z.number({
                "description": "The unique identifier of the task to update",
            }),
            updateTaskStatus: z.optional(z.nativeEnum(TaskStatus, {
                "description": "The new status of the task.",
            })),
            updateTaskDueDate: z.optional(z.string({
                "description": "The new due date of the task in YYYY-MM-DD format.",
            })),
            updateTaskDetails: z.optional(z.string({
                "description": "The new details of the task.",
            })),
        })
    })
    async _updateRmTask({
        rmTaskId,
        updateTaskStatus,
        updateTaskDueDate,
        updateTaskDetails
    }: {
        rmTaskId: number;
        updateTaskStatus?: TaskStatus;
        updateTaskDueDate?: string;
        updateTaskDetails?: string;
    }, context: Context, request: Request) {
        return await this._updateRmTaskInternal(
            rmTaskId,
            updateTaskStatus,
            updateTaskDueDate,
            updateTaskDetails
        );
    }
}