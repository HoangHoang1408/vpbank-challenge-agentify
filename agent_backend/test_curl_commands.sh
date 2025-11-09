#!/bin/bash

# Test Agent Backend API with curl
# Make sure the backend is running: python main.py

BASE_URL="http://localhost:8000"

echo "=========================================="
echo "1. Health Check"
echo "=========================================="
curl -X GET "$BASE_URL/health"
echo -e "\n\n"

echo "=========================================="
echo "2. Simple Chat - Find Customer"
echo "=========================================="
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "đề xuất gói vay cho khách hàng có customer id là Thắng",
    "rm_id": 1
  }'
echo -e "\n\n"

echo "=========================================="
echo "3. Create Task (Should Interrupt)"
echo "=========================================="
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Log giúp tôi cái task: tư vấn gói vay cho anh Thắng, cụ thể tư vấn về lãi vay gói nhà ở khu Thường Tín muộn nhất ngày 09/11/2025",
    "rm_id": 1
  }'
echo -e "\n\n"

echo "=========================================="
echo "4. Confirm Task (Resume with yes)"
echo "=========================================="
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "yes",
    "rm_id": 1
  }'
echo -e "\n\n"

echo "=========================================="
echo "5. Check Interrupt Status"
echo "=========================================="
curl -X GET "$BASE_URL/interrupt/1"
echo -e "\n\n"

echo "=========================================="
echo "6. Stream Chat - Find Customer"
echo "=========================================="
curl -X POST "$BASE_URL/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tìm cho tôi thông tin khách hàng có ID là 1",
    "rm_id": 1
  }'
echo -e "\n\n"

echo "=========================================="
echo "7. Stream Chat - Create Task (Should Interrupt)"
echo "=========================================="
curl -X POST "$BASE_URL/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tạo task gọi điện cho khách hàng ID 2 vào ngày 10/11/2025",
    "rm_id": 1
  }'
echo -e "\n\n"

echo "=========================================="
echo "8. Recommend Card Products"
echo "=========================================="
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Gợi ý cho tôi sản phẩm thẻ phù hợp với khách hàng ID 1",
    "rm_id": 1
  }'
echo -e "\n\n"

echo "=========================================="
echo "Test completed!"
echo "=========================================="

