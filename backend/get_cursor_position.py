import subprocess
import shutil


def get_cursor_position() -> tuple[int, int]:
    """
    Get the current cursor position on the screen using xdotool.

    Returns:
        tuple[int, int]: (x, y) coordinates of the cursor
    """
    if not shutil.which("xdotool"):
        raise RuntimeError(
            "xdotool is not installed. Install with: sudo apt install xdotool"
        )

    result = subprocess.run(
        ["xdotool", "getmouselocation"], capture_output=True, text=True, check=True
    )
    output = result.stdout.strip()

    # Parse output like "x:123 y:456 screen:0 window:12345"
    parts = output.split()
    x = int(parts[0].split(":")[1])
    y = int(parts[1].split(":")[1])

    return (x, y)


if __name__ == "__main__":
    try:
        while True:
            x, y = get_cursor_position()
            print(f"Current cursor position: ({x}, {y})")
    except Exception as e:
        print(f"Error: {e}")

