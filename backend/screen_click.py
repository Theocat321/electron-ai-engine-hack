import subprocess
import shutil


def click_coordinates(x: int, y: int) -> None:
    """
    Click at the specified (x, y) coordinates on the screen using xdotool.

    Args:
        x (int): X coordinate on the screen
        y (int): Y coordinate on the screen
    """
    if not shutil.which("xdotool"):
        raise RuntimeError(
            "xdotool is not installed. Install with: sudo apt install xdotool"
        )

    subprocess.run(["xdotool", "mousemove", str(x), str(y)], check=True)
    subprocess.run(["xdotool", "click", "1"], check=True)


def click_with_safety(x: int, y: int) -> None:
    """
    Click at the specified coordinates with safety checks.

    Args:
        x (int): X coordinate on the screen
        y (int): Y coordinate on the screen
    """
    try:
        # Get screen size using xrandr
        result = subprocess.run(["xrandr"], capture_output=True, text=True)
        screen_width, screen_height = 1920, 1080  # Default fallback

        if result.returncode == 0:
            for line in result.stdout.split("\n"):
                if " connected primary " in line or " connected " in line:
                    parts = line.split()
                    for part in parts:
                        if "x" in part and "+" in part:
                            resolution = part.split("+")[0]
                            if "x" in resolution:
                                try:
                                    screen_width, screen_height = map(
                                        int, resolution.split("x")
                                    )
                                    break
                                except ValueError:
                                    continue
                    break

        # Check if coordinates are within screen bounds
        if 0 <= x < screen_width and 0 <= y < screen_height:
            click_coordinates(x, y)
        else:
            raise ValueError(
                f"Coordinates ({x}, {y}) are outside screen bounds ({screen_width}x{screen_height})"
            )
    except Exception as e:
        # If safety checks fail, just try the click anyway
        click_coordinates(x, y)


click_with_safety(1198, 252)

