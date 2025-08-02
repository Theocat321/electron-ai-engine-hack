#!/usr/bin/env python3
"""
Test script for the orchestration agent task generation functionality.

Usage:
    python test_task_generation.py <image_path> <user_query>

Example:
    python test_task_generation.py screenshot.png "Send an email to john@example.com"
"""

import sys
import os
from pathlib import Path
from orchestration_agent import OrchestrationAgent
from state import create_initial_state


def load_image(image_path: str) -> bytes:
    """
    Load an image file and return its bytes.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        bytes: Image data as bytes
        
    Raises:
        FileNotFoundError: If image file doesn't exist
        IOError: If unable to read the image file
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    try:
        with open(image_path, 'rb') as f:
            return f.read()
    except IOError as e:
        raise IOError(f"Unable to read image file {image_path}: {e}")


def test_task_generation(image_path: str, user_query: str):
    """
    Test the orchestration agent task generation.
    
    Args:
        image_path: Path to the screenshot image
        user_query: User's request/query
    """
    print(f"Testing task generation with:")
    print(f"  Image: {image_path}")
    print(f"  Query: {user_query}")
    print("-" * 50)
    
    try:
        # Load the image
        print("Loading image...")
        image_data = load_image(image_path)
        print(f"✓ Image loaded successfully ({len(image_data)} bytes)")
        
        # Create initial state
        print("Creating initial state...")
        state = create_initial_state(image_data, user_query)
        print("✓ Initial state created")
        
        # Initialize the orchestration agent
        print("Initializing orchestration agent...")
        agent = OrchestrationAgent()
        print("✓ Agent initialized")
        
        # Generate task and description
        print("Generating task and description...")
        task, description = agent.generate_tasks(state)
        
        # Display results
        print("\n" + "=" * 50)
        print("GENERATED TASK AND DESCRIPTION:")
        print("=" * 50)
        
        if not task:
            print("❌ No task generated")
        else:
            print("✓ Task generated successfully:\n")
            print(f"Task: {task}")
            print(f"\nDescription: {description}")
        
        print("\n" + "=" * 50)
        print("Test completed successfully!")
        
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except IOError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


def main():
    """Main function to handle command line arguments and run the test."""
    if len(sys.argv) != 3:
        print("Usage: python test_task_generation.py <image_path> <user_query>")
        print("\nExample:")
        print('  python test_task_generation.py screenshot.png "Send an email to john@example.com"')
        sys.exit(1)
    
    image_path = sys.argv[1]
    user_query = sys.argv[2]
    
    # Verify the image path
    if not Path(image_path).suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']:
        print(f"Warning: '{image_path}' doesn't appear to be a common image format")
    
    test_task_generation(image_path, user_query)


if __name__ == "__main__":
    main()