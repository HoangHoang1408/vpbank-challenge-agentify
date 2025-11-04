import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { FactRmTaskService } from './rm_task.service';
import { CreateTaskDto, UpdateTaskDto, FilterTaskDto } from './dto';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
    constructor(
        private readonly taskService: FactRmTaskService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiBody({ type: CreateTaskDto })
    @ApiResponse({ status: 201, description: 'Task created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createTask(@Body() createTaskDto: CreateTaskDto) {
        return await this.taskService.create(createTaskDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks with optional filters' })
    @ApiQuery({ name: 'rmId', required: false, type: Number, description: 'Filter by RM ID' })
    @ApiQuery({ name: 'customerId', required: false, type: Number, description: 'Filter by Customer ID' })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS'], description: 'Filter by status' })
    @ApiQuery({ name: 'taskType', required: false, enum: ['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'SEND_INFO_PACKAGE'], description: 'Filter by task type' })
    @ApiResponse({ status: 200, description: 'List of tasks retrieved successfully' })
    async getAllTasks(@Query() filterTaskDto: FilterTaskDto) {
        return await this.taskService.findAll(filterTaskDto);
    }

    @Get('overdue/all')
    @ApiOperation({ summary: 'Get overdue tasks' })
    @ApiResponse({ status: 200, description: 'Overdue tasks retrieved successfully' })
    async getOverdueTasks() {
        return await this.taskService.findOverdueTasks();
    }

    @Get('rm/:rmId')
    @ApiOperation({ summary: 'Get tasks by RM ID' })
    @ApiParam({ name: 'rmId', type: Number, description: 'Relationship Manager ID' })
    @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
    async getTasksByRm(@Param('rmId', ParseIntPipe) rmId: number) {
        return await this.taskService.findByRmId(rmId);
    }

    @Get('customer/:customerId')
    @ApiOperation({ summary: 'Get tasks by Customer ID' })
    @ApiParam({ name: 'customerId', type: Number, description: 'Customer ID' })
    @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
    async getTasksByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
        return await this.taskService.findByCustomerId(customerId);
    }

    @Get('stats/rm/:rmId')
    @ApiOperation({ summary: 'Get task statistics for a specific RM' })
    @ApiParam({ name: 'rmId', type: Number, description: 'Relationship Manager ID' })
    @ApiResponse({ status: 200, description: 'Task statistics retrieved successfully' })
    async getTaskStatsByRm(@Param('rmId', ParseIntPipe) rmId: number) {
        return await this.taskService.getTaskStatsByRm(rmId);
    }

    @Get('by-task-id/:taskId')
    @ApiOperation({ summary: 'Get a task by taskId (business key)' })
    @ApiParam({ name: 'taskId', type: String, description: 'Task business key' })
    @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getTaskByTaskId(@Param('taskId') taskId: string) {
        return await this.taskService.findByTaskId(taskId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific task by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getTask(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a task' })
    @ApiParam({ name: 'id', type: Number, description: 'Task ID' })
    @ApiBody({ type: UpdateTaskDto })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async updateTask(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return await this.taskService.update(id, updateTaskDto);
    }

    @Delete(':id/soft')
    @ApiOperation({ summary: 'Soft delete a task (mark as CANCELLED)' })
    @ApiParam({ name: 'id', type: Number, description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task soft deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async softDeleteTask(@Param('id', ParseIntPipe) id: number) {
        return await this.taskService.softDelete(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Hard delete a task (permanent)' })
    @ApiParam({ name: 'id', type: Number, description: 'Task ID' })
    @ApiResponse({ status: 200, description: 'Task deleted successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async deleteTask(@Param('id', ParseIntPipe) id: number) {
        await this.taskService.remove(id);
        return { message: 'Task deleted successfully' };
    }
}

