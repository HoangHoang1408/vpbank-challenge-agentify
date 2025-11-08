# Email-Task Integration Documentation

## Overview

This document describes the integration between the Email Generation Service (`gen_email`) and the RM Task Service (`rm_task`). When an email is marked as SENT, the system automatically creates or updates a corresponding task for the Relationship Manager to track and follow up.

## Architecture

### Integration Flow

```
Email Status Update (SENT)
    ↓
GenEmailService.updateEmailStatus()
    ↓
createOrUpdateTaskForEmail() [private method]
    ↓
FactRmTaskService.findByTaskId() → exists?
    ├─ Yes → Update existing task
    └─ No  → Create new task
```

## Implementation Details

### 1. Module Dependencies

**File**: `src/gen_email/genEmail.module.ts`

The `GenEmailModule` now imports `RmTaskModule` to access the task service:

```typescript
@Module({
    imports: [
        TypeOrmModule.forFeature([GeneratedEmail, Customer, RelationshipManager]),
        RmTaskModule,  // Added for task integration
    ],
    providers: [GenEmailService, EmailRulesService, EmailSchedulerService],
    exports: [GenEmailService, EmailRulesService, EmailSchedulerService],
    controllers: [GenEmailController],
})
export class GenEmailModule { }
```

### 2. Service Integration

**File**: `src/gen_email/genEmail.service.ts`

#### Injected Dependencies

```typescript
constructor(
    private readonly configService: ConfigService,
    @InjectRepository(GeneratedEmail)
    private readonly emailRepository: Repository<GeneratedEmail>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(RelationshipManager)
    private readonly rmRepository: Repository<RelationshipManager>,
    private readonly taskService: FactRmTaskService,  // Added for task integration
) { }
```

#### Updated Method: `updateEmailStatus()`

When an email status is updated to `SENT`, the system automatically creates or updates a task:

```typescript
async updateEmailStatus(id: number, status: EmailStatus): Promise<GeneratedEmail> {
    const email = await this.getEmailById(id);
    const previousStatus = email.status;
    email.status = status;
    
    const updatedEmail = await this.emailRepository.save(email);

    // If email status changed to SENT, create or update the corresponding task
    if (status === EmailStatus.SENT && previousStatus !== EmailStatus.SENT) {
        await this.createOrUpdateTaskForEmail(updatedEmail);
    }

    return updatedEmail;
}
```

#### New Private Method: `createOrUpdateTaskForEmail()`

This method handles the task creation/update logic:

- **Task ID Format**: `EMAIL-{EMAIL_TYPE}-{EMAIL_ID}`
  - Example: `EMAIL-BIRTHDAY-123`
- **Task Type**: Always `EMAIL`
- **Task Status**: Always `IN_PROGRESS`
- **Due Date**: 7 days from the email send date
- **Task Details**: Generated based on email type and subject

**Error Handling**: If task creation fails, the error is logged but not thrown, ensuring the email status update succeeds.

#### New Private Method: `generateTaskDetails()`

Generates Vietnamese task descriptions based on email type:

| Email Type | Task Description Template |
|------------|---------------------------|
| `BIRTHDAY` | Email Chúc mừng sinh nhật đã được gửi cho khách hàng... |
| `CARD_RENEWAL` | Email Nhắc nhở gia hạn thẻ đã được gửi cho khách hàng... |
| `SEGMENT_MILESTONE` | Email Chúc mừng cột mốc quan trọng đã được gửi cho khách hàng... |

## Task Properties

When a task is created from a sent email, it has the following properties:

| Property | Value | Description |
|----------|-------|-------------|
| `taskId` | `EMAIL-{type}-{id}` | Unique identifier combining email type and ID |
| `rmId` | From email | The RM who sent the email |
| `customerId` | From email | The customer who received the email |
| `taskType` | `EMAIL` | Fixed task type for email follow-ups |
| `status` | `IN_PROGRESS` | Initial status for new tasks |
| `taskDetails` | Generated | Vietnamese description with email subject |
| `dueDate` | +7 days | Follow-up deadline (7 days from send) |

## API Usage

### Sending an Email and Creating a Task

**Endpoint**: `PATCH /gen-email/:id/status`

**Request**:
```json
{
  "status": "SENT"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email status updated to SENT",
  "data": {
    "id": 123,
    "status": "SENT",
    "subject": "Chúc mừng sinh nhật!",
    "body": "...",
    "message": "..."
  }
}
```

**Side Effect**: A task is automatically created with:
- Task ID: `EMAIL-BIRTHDAY-123`
- Status: `IN_PROGRESS`
- Due Date: 7 days from now

### Checking the Created Task

**Endpoint**: `GET /tasks/by-task-id/:taskId`

**Example**:
```bash
GET /tasks/by-task-id/EMAIL-BIRTHDAY-123
```

**Response**:
```json
{
  "id": 456,
  "taskId": "EMAIL-BIRTHDAY-123",
  "rmId": 1,
  "customerId": 5,
  "taskType": "EMAIL",
  "status": "IN_PROGRESS",
  "taskDetails": "Email Chúc mừng sinh nhật đã được gửi cho khách hàng. Chủ đề: \"Chúc mừng sinh nhật!\". Theo dõi phản hồi và tương tác của khách hàng.",
  "dueDate": "2025-11-14",
  "createdAt": "2025-11-07T10:30:00Z",
  "updatedAt": "2025-11-07T10:30:00Z",
  "relationshipManager": { ... },
  "customer": { ... }
}
```

### Viewing All Email Tasks for an RM

**Endpoint**: `GET /tasks?rmId={id}&taskType=EMAIL`

**Example**:
```bash
GET /tasks?rmId=1&taskType=EMAIL
```

This returns all email-related tasks for the specified RM.

## Behavior Details

### Task Creation vs Update

1. **First Time Email is Sent**:
   - System attempts to find task with ID `EMAIL-{type}-{id}`
   - Task not found → Creates new task
   - Logs: `Created task EMAIL-BIRTHDAY-123 for sent email 123`

2. **Email Status Changed to SENT Again** (edge case):
   - System attempts to find task with ID `EMAIL-{type}-{id}`
   - Task found → Updates existing task
   - Logs: `Updated task EMAIL-BIRTHDAY-123 for sent email 123`

### Error Handling

- **Task Creation Fails**: Error is logged but email status update succeeds
- **Validation Errors**: If RM or Customer is invalid, task creation fails gracefully
- **Database Errors**: Logged but don't affect email status

### Logging

The service logs the following events:

```typescript
// Success - Task Created
this.logger.log(`Created task EMAIL-BIRTHDAY-123 for sent email 123`);

// Success - Task Updated
this.logger.log(`Updated task EMAIL-BIRTHDAY-123 for sent email 123`);

// Error
this.logger.error(`Failed to create/update task for email 123:`, error);
```

## Testing

### Manual Testing Steps

1. **Generate an Email**:
   ```bash
   POST /gen-email/trigger-generation
   ```

2. **List Generated Emails**:
   ```bash
   GET /gen-email/list?rmId=1&status=DRAFT
   ```

3. **Mark Email as Sent**:
   ```bash
   PATCH /gen-email/{id}/status
   Body: { "status": "SENT" }
   ```

4. **Verify Task Created**:
   ```bash
   GET /tasks/by-task-id/EMAIL-BIRTHDAY-{id}
   ```

5. **Check RM's Tasks**:
   ```bash
   GET /tasks?rmId=1&taskType=EMAIL
   ```

### Expected Results

- Email status changes to `SENT`
- Task is created with `IN_PROGRESS` status
- Task has correct `rmId`, `customerId`, and `taskType`
- Task `dueDate` is 7 days in the future
- Task `taskDetails` includes email subject in Vietnamese

## Database Schema

### No Schema Changes Required

The integration uses existing tables:
- `generated_email` (from gen_email module)
- `fact_rm_task` (from rm_task module)

No new columns or relationships were added.

## Future Enhancements

### Potential Improvements

1. **Task Completion Tracking**:
   - Automatically mark task as `COMPLETED` when customer responds
   - Track response time and engagement metrics

2. **Configurable Due Dates**:
   - Allow RMs to set custom follow-up periods
   - Different due dates based on email type

3. **Task Notifications**:
   - Send reminders to RMs about pending email follow-ups
   - Escalate overdue email tasks

4. **Bulk Email Sending**:
   - Support sending multiple emails at once
   - Batch task creation for performance

5. **Task Templates**:
   - Customizable task descriptions per email type
   - RM-specific task templates

## Troubleshooting

### Task Not Created After Sending Email

**Possible Causes**:
1. Email status was already `SENT` before the update
2. Task service threw an error (check logs)
3. RM or Customer validation failed

**Solution**: Check application logs for error messages starting with:
```
Failed to create/update task for email {id}:
```

### Duplicate Tasks

**Cause**: Email status changed to `SENT` multiple times

**Solution**: The system handles this by updating the existing task instead of creating a duplicate.

### Task Has Wrong Information

**Possible Causes**:
1. Email data was incorrect when task was created
2. Task generation logic has a bug

**Solution**: 
1. Verify email data is correct
2. Check `generateTaskDetails()` method
3. Update task manually if needed using `PUT /tasks/{id}`

## Code References

### Key Files Modified

1. `src/gen_email/genEmail.module.ts` - Added RmTaskModule import
2. `src/gen_email/genEmail.service.ts` - Added task integration logic

### Key Methods

- `GenEmailService.updateEmailStatus()` - Triggers task creation
- `GenEmailService.createOrUpdateTaskForEmail()` - Handles task logic
- `GenEmailService.generateTaskDetails()` - Generates task descriptions

### Dependencies

- `FactRmTaskService` - Task management service
- `TaskType`, `TaskStatus` - Task enums

## Support

For issues or questions about the email-task integration:

1. Check application logs for error messages
2. Verify email and task data in the database
3. Review this documentation for expected behavior
4. Contact the development team with specific error messages

