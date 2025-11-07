# Task Management API Documentation

## Overview

This document describes the CRUD operations available for managing RM (Relationship Manager) tasks in the system. The `FactRmTaskService` provides comprehensive task management with built-in validation and constraint checking.

## Entity Relationships

- **FactRmTask** → **RelationshipManager** (ManyToOne)
- **FactRmTask** → **Customer** (ManyToOne)
- A customer must be assigned to the same RM as the task

## Task Constraints

### 1. Create Task Constraints
- RM must exist and be active (`isActive = true`)
- Customer must exist and be active (`isActive = true`)
- Customer must be assigned to the specified RM
- `taskId` must be unique
- Due date cannot be in the past

### 2. Update Task Constraints
- Same constraints as create when updating `rmId` or `customerId`
- Status transitions must be valid (see Status Transitions section)
- Due date cannot be in the past for active tasks (IN_PROGRESS)

### 3. Status Transitions
Valid status transitions:
- **IN_PROGRESS** → COMPLETED
- **COMPLETED** → (no transitions allowed)

## API Endpoints

### 1. Create Task
**POST** `/tasks`

Creates a new task with validation.

**Request Body:**
```json
{
  "taskId": "TASK-001",
  "rmId": 1,
  "customerId": 1,
  "taskType": "CALL",
  "status": "IN_PROGRESS",
  "taskDetails": "Follow up with customer about investment portfolio",
  "dueDate": "2024-12-31"
}
```

**Task Types:**
- `CALL`
- `EMAIL`
- `MEETING`
- `FOLLOW_UP`
- `SEND_INFO_PACKAGE`

**Task Statuses:**
- `IN_PROGRESS`
- `COMPLETED`

**Response:** `200 OK`
```json
{
  "id": 1,
  "taskId": "TASK-001",
  "rmId": 1,
  "customerId": 1,
  "taskType": "CALL",
  "status": "IN_PROGRESS",
  "taskDetails": "Follow up with customer about investment portfolio",
  "dueDate": "2024-12-31",
  "createdAt": "2024-11-04T10:00:00.000Z",
  "updatedAt": "2024-11-04T10:00:00.000Z",
  "relationshipManager": { ... },
  "customer": { ... }
}
```

**Error Cases:**
- `404 Not Found` - RM or Customer not found
- `400 Bad Request` - RM/Customer not active, customer not assigned to RM, duplicate taskId, past due date

---

### 2. Get All Tasks
**GET** `/tasks`

Retrieves all tasks with optional filtering.

**Query Parameters:**
- `rmId` (optional): Filter by Relationship Manager ID
- `customerId` (optional): Filter by Customer ID
- `status` (optional): Filter by task status
- `taskType` (optional): Filter by task type

**Examples:**
```
GET /tasks
GET /tasks?rmId=1
GET /tasks?status=IN_PROGRESS&taskType=CALL
GET /tasks?customerId=5&status=COMPLETED
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "taskId": "TASK-001",
    ...
  },
  ...
]
```

---

### 3. Get Task by ID
**GET** `/tasks/:id`

Retrieves a specific task by its database ID.

**Example:**
```
GET /tasks/1
```

**Response:** `200 OK` (same structure as create response)

**Error Cases:**
- `404 Not Found` - Task not found

---

### 4. Get Task by Task ID
**GET** `/tasks/by-task-id/:taskId`

Retrieves a task by its business key (taskId).

**Example:**
```
GET /tasks/by-task-id/TASK-001
```

**Response:** `200 OK`

**Error Cases:**
- `404 Not Found` - Task not found

---

### 5. Update Task
**PUT** `/tasks/:id`

Updates an existing task. All fields are optional.

**Request Body:**
```json
{
  "taskType": "MEETING",
  "status": "IN_PROGRESS",
  "taskDetails": "Updated task details",
  "dueDate": "2024-12-25",
  "rmId": 2,
  "customerId": 3
}
```

**Example:**
```
PUT /tasks/1
```

**Response:** `200 OK` (updated task)

**Error Cases:**
- `404 Not Found` - Task, RM, or Customer not found
- `400 Bad Request` - Invalid status transition, RM/Customer not active, customer not assigned to RM, past due date for active tasks

---

### 6. Soft Delete Task
**DELETE** `/tasks/:id/soft`

Marks a task as COMPLETED (soft delete).

**Example:**
```
DELETE /tasks/1/soft
```

**Response:** `200 OK` (task with status=COMPLETED)

**Error Cases:**
- `404 Not Found` - Task not found
- `400 Bad Request` - Task already completed

---

### 7. Hard Delete Task
**DELETE** `/tasks/:id`

Permanently deletes a task from the database.

**Example:**
```
DELETE /tasks/1
```

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

**Error Cases:**
- `404 Not Found` - Task not found

---

### 8. Get Tasks by RM
**GET** `/tasks/rm/:rmId`

Retrieves all tasks assigned to a specific Relationship Manager.

**Example:**
```
GET /tasks/rm/1
```

**Response:** `200 OK` (array of tasks)

**Error Cases:**
- `404 Not Found` - RM not found

---

### 9. Get Tasks by Customer
**GET** `/tasks/customer/:customerId`

Retrieves all tasks for a specific customer.

**Example:**
```
GET /tasks/customer/5
```

**Response:** `200 OK` (array of tasks)

**Error Cases:**
- `404 Not Found` - Customer not found

---

### 10. Get Overdue Tasks
**GET** `/tasks/overdue/all`

Retrieves all overdue tasks (due date in the past, status IN_PROGRESS).

**Example:**
```
GET /tasks/overdue/all
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "taskId": "TASK-001",
    "dueDate": "2024-10-15",
    "status": "IN_PROGRESS",
    ...
  }
]
```

---

### 11. Get Task Statistics by RM
**GET** `/tasks/stats/rm/:rmId`

Retrieves task statistics for a specific Relationship Manager.

**Example:**
```
GET /tasks/stats/rm/1
```

**Response:** `200 OK`
```json
{
  "total": 25,
  "inProgress": 15,
  "completed": 10,
  "overdue": 3
}
```

**Error Cases:**
- `404 Not Found` - RM not found

---

## Service Methods

The `FactRmTaskService` provides the following methods:

### Core CRUD Operations
- `create(createTaskDto)` - Create a new task
- `findAll(filters?)` - Find all tasks with optional filters
- `findOne(id)` - Find task by database ID
- `findByTaskId(taskId)` - Find task by business key
- `update(id, updateTaskDto)` - Update a task
- `softDelete(id)` - Mark task as COMPLETED
- `remove(id)` - Permanently delete task

### Additional Query Methods
- `findByRmId(rmId)` - Get all tasks for an RM
- `findByCustomerId(customerId)` - Get all tasks for a customer
- `findOverdueTasks()` - Get all overdue tasks
- `getTaskStatsByRm(rmId)` - Get statistics for an RM

### Private Helper Methods
- `validateStatusTransition(currentStatus, newStatus)` - Validate status changes

## Usage Examples

### Example 1: Create a new task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK-001",
    "rmId": 1,
    "customerId": 1,
    "taskType": "CALL",
    "status": "IN_PROGRESS",
    "taskDetails": "Follow up call",
    "dueDate": "2024-12-31"
  }'
```

### Example 2: Update task status to COMPLETED
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Example 3: Get all in-progress tasks for RM #1
```bash
curl http://localhost:3000/tasks?rmId=1&status=IN_PROGRESS
```

### Example 4: Get overdue tasks
```bash
curl http://localhost:3000/tasks/overdue/all
```

### Example 5: Get task statistics for RM #1
```bash
curl http://localhost:3000/tasks/stats/rm/1
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful operation
- `400 Bad Request` - Invalid input or business rule violation
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses follow this format:
```json
{
  "statusCode": 400,
  "message": "Customer 5 is not assigned to RM 1. Customer is assigned to RM 2",
  "error": "Bad Request"
}
```

## Best Practices

1. **Always validate relationships**: Ensure RM and Customer exist and are active before creating tasks
2. **Check customer assignments**: Verify customer is assigned to the RM before creating/updating tasks
3. **Use soft delete for audit trails**: Use soft delete to maintain historical records
4. **Monitor overdue tasks**: Regularly check for overdue tasks using the dedicated endpoint
5. **Validate status transitions**: Follow the allowed status transition rules
6. **Set realistic due dates**: Ensure due dates are in the future for new/active tasks

## Database Schema

```sql
CREATE TABLE fact_rm_task (
  id SERIAL PRIMARY KEY,
  taskId VARCHAR NOT NULL UNIQUE,
  rmId INTEGER NOT NULL,
  customerId INTEGER NOT NULL,
  taskType VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  taskDetails TEXT NOT NULL,
  dueDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (rmId) REFERENCES relationship_manager(id),
  FOREIGN KEY (customerId) REFERENCES customer(id)
);
```

