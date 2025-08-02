#!/usr/bin/env python3
"""
Test script for FastAPI endpoints.

Usage:
    python test_api_endpoints.py <image_path> <user_query>

Example:
    python test_api_endpoints.py screenshot.png "Send an email to john@example.com"
"""

import sys
import os
import base64
import json
import requests
import time
from pathlib import Path
from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)

def load_image_as_base64(image_path: str) -> str:
    """
    Load an image file and return it as base64 string.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        str: Base64 encoded image data
        
    Raises:
        FileNotFoundError: If image file doesn't exist
        IOError: If unable to read the image file
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()
            return base64.b64encode(image_data).decode('utf-8')
    except IOError as e:
        raise IOError(f"Unable to read image file {image_path}: {e}")


def test_health_endpoint():
    """Test the health check endpoint."""
    print("🔍 Testing health endpoint...")
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✅ Health endpoint working correctly")
    

def test_status_endpoint():
    """Test the status endpoint when no session is active."""
    print("🔍 Testing status endpoint (no active session)...")
    response = client.get("/status")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "No active session"
    print("✅ Status endpoint working correctly")


def test_reset_endpoint():
    """Test the reset endpoint."""
    print("🔍 Testing reset endpoint...")
    response = client.post("/reset")
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    print("✅ Reset endpoint working correctly")


def test_initialize_endpoint(image_base64: str, user_query: str):
    """Test the initialize endpoint."""
    print("🔍 Testing initialize endpoint...")
    
    payload = {
        "user_query": user_query,
        "screenshot_base64": image_base64
    }
    
    response = client.post("/initialize", json=payload)
    
    if response.status_code != 200:
        print(f"❌ Initialize endpoint failed with status {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    data = response.json()
    
    # Validate response structure
    required_fields = ["x", "y", "task", "task_description", "is_completed"]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"
    
    assert isinstance(data["x"], int), "x coordinate should be integer"
    assert isinstance(data["y"], int), "y coordinate should be integer"
    assert isinstance(data["task"], str), "task should be string"
    assert isinstance(data["task_description"], str), "task_description should be string"
    assert isinstance(data["is_completed"], bool), "is_completed should be boolean"
    
    print("✅ Initialize endpoint working correctly")
    print(f"   Task: {data['task']}")
    print(f"   Coordinates: ({data['x']}, {data['y']})")
    print(f"   Description: {data['task_description']}")
    print(f"   Completed: {data['is_completed']}")
    
    return data


def test_status_with_active_session():
    """Test the status endpoint when a session is active."""
    print("🔍 Testing status endpoint (active session)...")
    response = client.get("/status")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Active session"
    assert "current_task" in data
    assert "coordinates" in data
    print("✅ Status endpoint with active session working correctly")


def test_update_screenshot_endpoint(image_base64: str):
    """Test the update screenshot endpoint."""
    print("🔍 Testing update screenshot endpoint...")
    
    payload = {
        "screenshot_base64": image_base64
    }
    
    response = client.post("/update_screenshot", json=payload)
    
    if response.status_code != 200:
        print(f"❌ Update screenshot endpoint failed with status {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    data = response.json()
    
    # Validate response structure
    required_fields = ["x", "y", "task", "task_description", "is_completed"]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"
    
    print("✅ Update screenshot endpoint working correctly")
    print(f"   Task: {data['task']}")
    print(f"   Coordinates: ({data['x']}, {data['y']})")
    print(f"   Description: {data['task_description']}")
    print(f"   Completed: {data['is_completed']}")
    
    return data


def test_update_screenshot_without_session():
    """Test update screenshot endpoint without an active session."""
    print("🔍 Testing update screenshot endpoint (no session)...")
    
    # Reset session first
    client.post("/reset")
    
    payload = {
        "screenshot_base64": "dummy_base64_data"
    }
    
    response = client.post("/update_screenshot", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert "No active session" in data["detail"]
    print("✅ Update screenshot endpoint correctly handles missing session")


def test_invalid_base64():
    """Test endpoints with invalid base64 data."""
    print("🔍 Testing invalid base64 handling...")
    
    payload = {
        "user_query": "Test query",
        "screenshot_base64": "invalid_base64_data"
    }
    
    response = client.post("/initialize", json=payload)
    assert response.status_code == 500
    print("✅ Invalid base64 data handled correctly")


def run_full_workflow_test(image_path: str, user_query: str):
    """Run a complete workflow test."""
    print("\n" + "="*60)
    print("🚀 RUNNING FULL API WORKFLOW TEST")
    print("="*60)
    print(f"Image: {image_path}")
    print(f"Query: {user_query}")
    print("-" * 60)
    
    try:
        # Load image
        print("📸 Loading image...")
        image_base64 = load_image_as_base64(image_path)
        print(f"✅ Image loaded ({len(image_base64)} characters in base64)")
        
        # Test individual endpoints
        test_health_endpoint()
        test_status_endpoint()
        test_reset_endpoint()
        test_update_screenshot_without_session()
        test_invalid_base64()
        
        # Test initialize workflow
        init_result = test_initialize_endpoint(image_base64, user_query)
        if not init_result:
            return False
            
        # Test status with active session
        test_status_with_active_session()
        
        # Test update screenshot (simulating user action completion)
        update_result = test_update_screenshot_endpoint(image_base64)
        if not update_result:
            return False
        
        # Test final reset
        test_reset_endpoint()
        
        print("\n" + "="*60)
        print("🎉 ALL TESTS PASSED!")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        print("="*60)
        return False


def main():
    """Main function to handle command line arguments and run tests."""
    if len(sys.argv) != 3:
        print("Usage: python test_api_endpoints.py <image_path> <user_query>")
        print("\nExample:")
        print('  python test_api_endpoints.py screenshot.png "Send an email to john@example.com"')
        sys.exit(1)
    
    image_path = sys.argv[1]
    user_query = sys.argv[2]
    
    # Verify the image path
    if not Path(image_path).suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']:
        print(f"Warning: '{image_path}' doesn't appear to be a common image format")
    
    success = run_full_workflow_test(image_path, user_query)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()