"""Simple test client for the agent backend."""
import requests
import json
import sys


def test_chat():
    """Test basic chat endpoint."""
    print("Testing /chat endpoint...")
    
    response = requests.post(
        "http://localhost:8000/chat",
        json={
            "message": "Find customer named Thắng",
            "thread_id": "test-thread-1",
            "rm_id": 1
        },
        timeout=30
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Success!")
        print(f"Response: {result['response'][:200]}...")
        print(f"Has interrupt: {result['has_interrupt']}")
        return True
    else:
        print(f"✗ Failed with status {response.status_code}")
        print(f"Error: {response.text}")
        return False


def test_health():
    """Test health endpoint."""
    print("Testing /health endpoint...")
    
    response = requests.get("http://localhost:8000/health", timeout=5)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Health check passed!")
        print(f"Status: {result['status']}")
        print(f"Agent initialized: {result['agent_initialized']}")
        return True
    else:
        print(f"✗ Health check failed with status {response.status_code}")
        return False


def test_stream():
    """Test streaming endpoint."""
    print("Testing /chat/stream endpoint...")
    
    response = requests.post(
        "http://localhost:8000/chat/stream",
        json={
            "message": "What's my performance this month?",
            "thread_id": "test-thread-2",
            "rm_id": 1
        },
        stream=True,
        timeout=30
    )
    
    if response.status_code == 200:
        print("✓ Streaming started!")
        content = ""
        for line in response.iter_lines():
            if line:
                data = line.decode('utf-8')
                if data.startswith('data: '):
                    content_str = data[6:]  # Remove 'data: ' prefix
                    if content_str == '[DONE]':
                        break
                    try:
                        chunk = json.loads(content_str)
                        if 'content' in chunk:
                            content += chunk['content']
                            print(chunk['content'], end='', flush=True)
                        elif 'error' in chunk:
                            print(f"\n✗ Error: {chunk['error']}")
                            return False
                    except json.JSONDecodeError:
                        pass
        print(f"\n✓ Streaming completed!")
        print(f"Total content length: {len(content)}")
        return True
    else:
        print(f"✗ Failed with status {response.status_code}")
        print(f"Error: {response.text}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Agent Backend Test Client")
    print("=" * 50)
    print()
    
    # Test health first
    if not test_health():
        print("\n✗ Health check failed. Is the server running?")
        sys.exit(1)
    
    print()
    
    # Test chat
    if not test_chat():
        print("\n✗ Chat test failed.")
        sys.exit(1)
    
    print()
    
    # Test streaming
    if not test_stream():
        print("\n✗ Streaming test failed.")
        sys.exit(1)
    
    print()
    print("=" * 50)
    print("✓ All tests passed!")
    print("=" * 50)

