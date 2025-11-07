# Email Generation Service - Documentation

## Overview

The Email Generation Service automatically creates personalized Vietnamese emails **and direct messages** for VPBank customers based on trigger rules (birthdays, card renewals, and segment milestones). RMs can view, regenerate, and manage these communications through REST API endpoints.

## Features

### 1. Automated Email & Message Generation (Daily at 5 AM)
- **Trigger Rules:**
  - **Birthday**: Customers with birthdays today (day/month match)
  - **Card Renewal**: Cards expiring within 30 days
  - **Segment Milestone**: Account anniversaries (1, 3, 5 years) or high-tier segment achievements

### 2. Dual Content Generation
- **Email**: Formal, professional tone suitable for email communication
- **Message**: Informal, conversational tone for direct messages/SMS
- Both generated simultaneously using a single API call to OpenAI

### 3. Personalized Content
- Uses OpenAI GPT-4o to generate personalized Vietnamese content
- Includes customer-specific information:
  - Name, gender (for proper salutation: Anh/Chị)
  - Job title, segment, behavioral description
  - Card products and benefits
  - RM name, title, and level
  - Specific trigger context (birthday age, renewal dates, milestone details)

### 4. RM Custom Prompts
- **RM-Level Customization**: Each RM can set a custom prompt that applies to ALL their generated emails
- **Per-Regeneration Customization**: RMs can provide additional instructions when regenerating specific emails
- **Prompt Combination**: Both custom prompts work together to create personalized communication styles

### 5. Email Lifecycle Management
- **DRAFT**: Newly generated emails (expires after 7 days)
- **SENT**: Marked as sent by RM
- **DELETED**: Marked as deleted by RM
- Auto-cleanup: Draft emails older than 7 days are automatically deleted

## Architecture

### Database Entities

#### GeneratedEmail
```typescript
{
  id: number;
  rmId: number;
  customerId: number;
  emailType: 'BIRTHDAY' | 'CARD_RENEWAL' | 'SEGMENT_MILESTONE';
  subject: string;
  body: string;
  message: string;  // NEW: Informal direct message
  generatedAt: Date;
  expiresAt: Date;  // 7 days from generation
  status: 'DRAFT' | 'SENT' | 'DELETED';
  metadata: Record<string, any>;  // Trigger-specific details
}
```

#### RelationshipManager (Extended)
```typescript
{
  id: number;
  employeeId: number;
  name: string;
  // ... other fields ...
  customPrompt: string | null;  // NEW: Custom prompt for all generated emails
}
```

### Services

1. **GenEmailService** (`genEmail.service.ts`)
   - Generates personalized emails using OpenAI
   - CRUD operations for generated emails
   - Cleanup expired emails

2. **EmailRulesService** (`email-rules.service.ts`)
   - Identifies eligible customers based on trigger rules
   - Validates customer eligibility for specific email types

3. **EmailSchedulerService** (`email-scheduler.service.ts`)
   - Cron job running daily at 5 AM (Asia/Ho_Chi_Minh timezone)
   - Orchestrates email generation and cleanup

## API Endpoints

### Email Generation Endpoints

#### 1. List Emails for an RM
```http
GET /gen-email/list?rmId={id}&status={status}
```

**Query Parameters:**
- `rmId` (required): Relationship Manager ID
- `status` (optional): Filter by status (DRAFT, SENT, DELETED)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "subject": "Chúc mừng sinh nhật Anh Nguyễn Văn A!",
      "body": "Kính gửi Anh Nguyễn Văn A...",
      "message": "Chào anh! Chúc mừng sinh nhật anh nhé! 🎉",
      "emailType": "BIRTHDAY",
      "status": "DRAFT",
      "generatedAt": "2025-11-07T05:00:00Z",
      "expiresAt": "2025-11-14T05:00:00Z",
      "customer": { ... },
      "relationshipManager": { ... },
      "metadata": { "age": 35 }
    }
  ]
}
```

#### 2. Get Specific Email
```http
GET /gen-email/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "subject": "Chúc mừng sinh nhật Anh Nguyễn Văn A!",
    "body": "Kính gửi Anh...",
    "message": "Chào anh! Chúc mừng sinh nhật anh nhé! 🎉",
    "emailType": "BIRTHDAY",
    "status": "DRAFT",
    "customer": { ... },
    "relationshipManager": { ... }
  }
}
```

#### 3. Regenerate Email with Custom Prompt
```http
POST /gen-email/regenerate/:emailId
Content-Type: application/json

{
  "model": "gpt-4o",  // optional, defaults to gpt-4o
  "customPrompt": "Làm cho nội dung ngắn gọn hơn và tập trung vào ưu đãi thẻ tín dụng"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email regenerated successfully",
  "data": {
    "id": 1,
    "subject": "...",
    "body": "...",
    "message": "...",
    "status": "DRAFT",
    "expiresAt": "2025-11-14T05:00:00Z"
  }
}
```

**Note:** The regeneration will use:
1. The RM's custom prompt (if set)
2. The per-regeneration custom prompt (if provided)
3. Both prompts are combined with the base prompt

#### 4. Update Email Status
```http
PATCH /gen-email/:id/status
Content-Type: application/json

{
  "status": "SENT"  // SENT or DELETED
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email status updated to SENT",
  "data": { ... }
}
```

#### 5. Delete Email (Hard Delete)
```http
DELETE /gen-email/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Email deleted successfully"
}
```

#### 6. Manual Trigger (Testing)
```http
POST /gen-email/trigger-generation
```

**Response:**
```json
{
  "success": true,
  "message": "Email generation triggered",
  "data": {
    "cleaned": 5,
    "generated": 12,
    "errors": 0
  }
}
```

### RM Custom Prompt Endpoints

#### 7. Update RM Custom Prompt
```http
PATCH /rms/:id/custom-prompt
Content-Type: application/json

{
  "customPrompt": "Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn, nhấn mạnh vào lợi ích cụ thể cho khách hàng."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom prompt updated successfully",
  "data": {
    "id": 1,
    "customPrompt": "Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn..."
  }
}
```

**To remove custom prompt:**
```json
{
  "customPrompt": null
}
```

#### 8. Get RM Custom Prompt
```http
GET /rms/:id/custom-prompt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyen Van A",
    "customPrompt": "Tôi muốn tất cả email đều có giọng điệu vui vẻ và nhiệt tình hơn..."
  }
}
```

## Email & Message Content Examples

### Birthday Communication

**Email:**
- Subject: "Chúc mừng sinh nhật Anh Nguyễn Văn A!"
- Body: Formal email with warm birthday wishes, segment/profession reference, card benefits, special offers, and appreciation for the relationship

**Message:**
```
Chào anh Nguyễn Văn A! 🎉

Chúc mừng sinh nhật anh nhé! Chúc anh luôn khỏe mạnh, thành công và hạnh phúc. 

Anh có nhiều ưu đãi đặc biệt dành riêng cho sinh nhật đấy. Liên hệ em bất cứ lúc nào nhé!

Trân trọng,
[RM Name]
```

### Card Renewal Communication

**Email:**
- Subject: "Nhắc nhở gia hạn thẻ VPBank Platinum"
- Body: Professional reminder with card benefits, upgrade suggestions, renewal guidance, and consultation offer

**Message:**
```
Chào anh! 

Thẻ Platinum của anh sắp đến hạn gia hạn rồi (còn 15 ngày). Em gửi thông tin chi tiết qua email nhé.

Anh cần hỗ trợ gì cứ liên hệ em!

[RM Name]
```

### Segment Milestone Communication

**Email:**
- Subject: "Chúc mừng 3 năm đồng hành với VPBank!"
- Body: Celebration of milestone, gratitude, current privileges, exclusive benefits, and commitment to support

**Message:**
```
Chúc mừng anh đã đồng hành cùng VPBank được 3 năm! 🎊

Cảm ơn anh đã luôn tin tưởng và đồng hành. Có nhiều ưu đãi đặc biệt dành cho anh, em sẽ gửi chi tiết qua email nhé!

[RM Name]
```

## Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
APP_PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_NAME=vpbank_db
```

### Cron Schedule
The scheduler runs at 5 AM Vietnam time (Asia/Ho_Chi_Minh):
```typescript
@Cron('0 5 * * *', {
  name: 'daily-email-generation',
  timeZone: 'Asia/Ho_Chi_Minh',
})
```

To change the schedule, modify the cron expression in `email-scheduler.service.ts`.

## Usage Flow

### Automated Flow (Daily)
1. **5:00 AM**: Cron job triggers
2. **Cleanup**: Delete expired draft emails (older than 7 days)
3. **Identify**: Find eligible customers based on rules
4. **Generate**: Create personalized emails using OpenAI
5. **Store**: Save emails to database with DRAFT status and 7-day expiration

### RM Manual Flow

#### Initial Setup (One-Time)
1. **Configure Custom Prompt** (optional): Set personal communication style via `PATCH /rms/{id}/custom-prompt`

#### Daily Email Management
1. **List**: Fetch draft emails via `GET /gen-email/list?rmId={id}`
2. **Review**: Review both email and message content
3. **Regenerate** (optional): If not satisfied, regenerate with optional custom instructions
4. **Send**: 
   - Send formal email through email client
   - Send informal message via SMS/chat platform
5. **Mark as Sent**: Update status via `PATCH /gen-email/:id/status`
6. **Delete** (optional): Remove unwanted content via `DELETE /gen-email/:id`

## Testing

### Manual Trigger
To test email generation without waiting for 5 AM:
```bash
curl -X POST http://localhost:3000/gen-email/trigger-generation
```

### Check Logs
The scheduler logs all activities:
```
[EmailSchedulerService] Starting daily email generation job at 5 AM...
[EmailSchedulerService] Cleaned up 3 expired draft emails
[EmailSchedulerService] Found 15 eligible customers for email generation
[EmailSchedulerService] Generated BIRTHDAY email for customer John Doe (ID: 1)
[EmailSchedulerService] Daily email generation completed. Success: 15, Errors: 0
```

## Custom Prompt Usage

### RM-Level Custom Prompt

Each RM can set a custom prompt that applies to ALL their auto-generated emails:

```bash
# Set custom prompt for RM ID 1
curl -X PATCH http://localhost:3000/rms/1/custom-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "customPrompt": "Tôi muốn tất cả email có giọng điệu thân thiện và nhiệt tình. Luôn nhấn mạnh lợi ích cụ thể cho khách hàng và tạo cảm giác gần gũi."
  }'
```

**Effect:** This prompt will be automatically applied to:
- All scheduled daily email generations for this RM's customers
- Manual email regenerations (unless overridden)

### Per-Regeneration Custom Prompt

When regenerating a specific email, RMs can provide additional instructions:

```bash
curl -X POST http://localhost:3000/gen-email/regenerate/1 \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "customPrompt": "Làm ngắn gọn hơn, tập trung vào ưu đãi thẻ tín dụng và bỏ phần giới thiệu dài dòng"
  }'
```

**Prompt Combination Order:**
1. Base prompt (email type + customer context)
2. RM's custom prompt (if set)
3. Per-regeneration custom prompt (if provided)

**Example Final Prompt:**
```
[Base Prompt]
Thông tin khách hàng: Anh Nguyễn Văn A, Diamond segment...

[RM Custom Prompt]
Hướng dẫn cá nhân hóa từ RM: Tôi muốn tất cả email có giọng điệu thân thiện và nhiệt tình...

[Per-Regeneration Prompt]
Yêu cầu bổ sung cho lần tạo này: Làm ngắn gọn hơn, tập trung vào ưu đãi thẻ tín dụng...
```

## Model Selection

By default, the service uses GPT-4o. To use a different model:

```bash
# Regenerate with specific model
curl -X POST http://localhost:3000/gen-email/regenerate/1 \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o-mini"}'
```

Available OpenAI models:
- `gpt-4o` (default, best quality)
- `gpt-4o-mini` (faster, lower cost)
- `gpt-3.5-turbo`

## Troubleshooting

### No emails generated
- Check if customers meet trigger criteria
- Verify OpenAI API key is valid
- Check scheduler logs for errors

### Emails not expiring
- Ensure cron job is running (check logs at 5 AM)
- Verify database timestamps are correct

### OpenAI errors
- Check API key validity
- Ensure sufficient OpenAI credits
- Verify network connectivity

## Database Migration

The `GeneratedEmail` entity will be automatically created when you start the application (TypeORM synchronize is enabled). In production, disable synchronize and use migrations:

```typescript
// app.module.ts
synchronize: false, // Set to false in production
```

## Security Considerations

1. **RM Authorization**: Currently, any RM can query any email by rmId. Implement authentication to ensure RMs only access their own emails.
2. **Rate Limiting**: Consider adding rate limits to prevent API abuse.
3. **OpenAI Costs**: Monitor OpenAI usage to control costs.
4. **Data Privacy**: Ensure customer data is handled according to privacy regulations.

## Key Features Summary

### ✅ Implemented
- [x] Dual content generation (email + message)
- [x] RM-level custom prompts
- [x] Per-regeneration custom prompts
- [x] Automated daily generation
- [x] OpenAI GPT-4o integration
- [x] Email lifecycle management
- [x] Multiple email types (birthday, renewal, milestone)
- [x] REST API endpoints
- [x] Comprehensive API documentation

### Message Field
The `message` field provides informal, conversational content that:
- Is shorter and more casual than emails
- Suitable for SMS, WhatsApp, Zalo, or direct messaging platforms
- Automatically adjusts tone based on customer segment and relationship
- Generated simultaneously with email for consistency
- Can include emojis and informal language

### Custom Prompt Benefits
- **Consistency**: All emails from an RM maintain consistent style
- **Personalization**: Each RM can express their unique communication style
- **Flexibility**: Per-regeneration prompts allow one-off adjustments
- **Efficiency**: No need to manually edit every generated email

## Future Enhancements

- [ ] Email templates library
- [ ] A/B testing for email variations
- [ ] Email performance analytics
- [ ] Multi-language support
- [ ] Email preview in browser
- [ ] Bulk operations for RMs
- [ ] Email scheduling (send later)
- [ ] Integration with actual email/SMS sending service
- [ ] Message template suggestions
- [ ] Tone analysis for custom prompts




