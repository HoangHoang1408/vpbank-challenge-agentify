# Agent Backend API - cURL Test Commands

## Prerequisites
Make sure the backend is running:
```bash
cd agent_backend
python main.py
```

---

## 1. Health Check

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "agent_initialized": true
}
```

---

## 2. Root Endpoint

```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "message": "Agent Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## 3. Simple Chat - Find Customer

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tìm giúp tôi thông tin khách hàng tên Thắng",
    "rm_id": 1
  }'
```

curl -X POST "http://localhost:8000/chat" \ 
  -H "Content-Type: application/json" \
  -d '{
    "message": "Log giúp tôi cái task: tư vấn gói vay cho anh Thắng, cụ thể tư vấn về lãi vay gói nhà ở khu Thường Tín muộn nhất ngày 09/11/2025",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Log giúp tôi cái task: tư vấn gói vay cho anh Thắng, cụ thể tư vấn về lãi vay gói nhà ở khu Thường Tín muộn nhất ngày 09/11/2025",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Dương Thành Thắng",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ừ đúng r. log work cho tôi đi",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "yes",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ok t cảm ơn",
    "rm_id": 1
  }'


curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tuần này tôi làm được bao nhiêu task rồi",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "hình như sẽ hết hạn ngày 9 tháng này",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "gợi ý cho tôi sản phẩm cho anh Duy Bình",
    "rm_id": 1
  }'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "",
    "rm_id": 1
  }'


**Expected Response:**
```json
{
  "message": "AI response about customer...",
  "interrupted": false
}
```

---

## 4. Create Task (Should Trigger Interrupt)

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Log giúp tôi cái task: tư vấn gói vay cho anh Thắng về lãi vay gói nhà ở khu Thường Tín muộn nhất ngày 09/11/2025",
    "rm_id": 1
  }'
```

**Expected Response:**
```json
{
  "message": "Hãy confirm task sau: create_rm_task(...)\nNhập 'yes' nếu muốn tiếp tục, 'no' nếu muốn hủy bỏ.",
  "interrupted": true
}
```

---

## 5. Confirm Task (Resume with "yes")

After receiving an interrupt, send "yes" to confirm:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "yes",
    "rm_id": 1
  }'
```

**Expected Response:**
```json
{
  "message": "Task executed successfully! ...",
  "interrupted": false
}
```

---

## 6. Cancel Task (Resume with "no")

After receiving an interrupt, send "no" to cancel:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "no",
    "rm_id": 1
  }'
```

---

## 7. Check Interrupt Status

```bash
curl http://localhost:8000/interrupt/1
```

**Expected Response (no interrupt):**
```json
{
  "has_interrupt": false,
  "interrupt_message": null
}
```

**Expected Response (pending interrupt):**
```json
{
  "has_interrupt": true,
  "interrupt_message": "Hãy confirm task sau: ..."
}
```

---

## 8. Stream Chat - Normal Query

```bash
curl -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tìm cho tôi thông tin khách hàng có ID là 1",
    "rm_id": 1
  }'
```

**Expected Response (SSE Stream):**
```
data: {"content": "Based", "done": false, "interrupted": false}

data: {"content": " on", "done": false, "interrupted": false}

data: {"content": " the", "done": false, "interrupted": false}

...

data: {"content": "", "done": true, "interrupted": false}

data: [DONE]
```

---

## 9. Stream Chat - Create Task (Should Interrupt)

```bash
curl -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tạo task gọi điện cho khách hàng ID 2 vào ngày 10/11/2025",
    "rm_id": 1
  }'
```

**Expected Response (SSE Stream with Interrupt):**
```
data: {"content": "chunk1", "done": false, "interrupted": false}

data: {"content": "chunk2", "done": false, "interrupted": false}

...

data: {"content": "Hãy confirm task sau: create_rm_task(...)", "done": true, "interrupted": true}

data: [DONE]
```

---

## 10. Recommend Card Products

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Gợi ý cho tôi sản phẩm thẻ phù hợp với khách hàng ID 1",
    "rm_id": 1
  }'
```

---

## 11. Find RM Tasks

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cho tôi xem danh sách task của tôi",
    "rm_id": 1
  }'
```

---

## 12. Update Task (Should Trigger Interrupt)

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cập nhật task ID 1 thành COMPLETED",
    "rm_id": 1
  }'
```

---

## Test Flow: Complete Task Creation

### Step 1: Ask to create task
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Log task: Gọi điện tư vấn cho khách hàng ID 3 về thẻ tín dụng vào ngày 15/11/2025",
    "rm_id": 1
  }'
```

### Step 2: Confirm with "yes"
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "yes",
    "rm_id": 1
  }'
```

### Step 3: Check if task was created
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cho tôi xem task vừa tạo",
    "rm_id": 1
  }'
```

---

## Debugging Tips

### Enable verbose mode to see headers:
```bash
curl -v -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "rm_id": 1}'
```

### Pretty print JSON response (requires jq):
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "rm_id": 1}' | jq .
```

### Test with different RM IDs:
```bash
# RM ID 1
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Cho tôi xem task của tôi", "rm_id": 1}'

# RM ID 2
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Cho tôi xem task của tôi", "rm_id": 2}'
```

---

## Notes

- Each RM ID has its own conversation thread (thread_id = "rm_{rm_id}")
- Interrupts are thread-specific, so make sure to use the same rm_id when confirming
- The streaming endpoint uses Server-Sent Events (SSE) format
- All timestamps should be in format "DD/MM/YYYY" (e.g., "09/11/2025")

