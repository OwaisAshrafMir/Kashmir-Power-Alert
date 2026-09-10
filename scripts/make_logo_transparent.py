from PIL import Image
from collections import deque
from pathlib import Path

src = Path(
    r"C:\Users\User\.cursor\projects\d-Projects-hostnsell-backend-consolidation\assets\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_449ad1945037cfb8222319b4ad7caa09_images_image-03e27d22-5103-456f-bfe4-276e67bf814d.png"
)
out = Path(r"D:\Projects\Kashmir Power Alerts\public\logo.png")
img = Image.open(src).convert("RGBA")
px = img.load()
w, h = img.size


def is_bg(r, g, b, a):
    return a > 0 and r >= 248 and g >= 248 and b >= 248


visited = [[False] * h for _ in range(w)]
q = deque()
starts = [
    (0, 0),
    (w - 1, 0),
    (0, h - 1),
    (w - 1, h - 1),
    (w // 2, 0),
    (w // 2, h - 1),
    (0, h // 2),
    (w - 1, h // 2),
]
for x, y in starts:
    r, g, b, a = px[x, y]
    if is_bg(r, g, b, a):
        visited[x][y] = True
        q.append((x, y))

cleared = 0
while q:
    x, y = q.popleft()
    px[x, y] = (0, 0, 0, 0)
    cleared += 1
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if nx < 0 or ny < 0 or nx >= w or ny >= h or visited[nx][ny]:
            continue
        r, g, b, a = px[nx, ny]
        if is_bg(r, g, b, a):
            visited[nx][ny] = True
            q.append((nx, ny))

# soft fringe cleanup at transparent edges
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        if r >= 250 and g >= 250 and b >= 250:
            transparent = 0
            total = 0
            for dx, dy in (
                (1, 0),
                (-1, 0),
                (0, 1),
                (0, -1),
                (1, 1),
                (-1, -1),
                (1, -1),
                (-1, 1),
            ):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    total += 1
                    if px[nx, ny][3] == 0:
                        transparent += 1
            if total and transparent / total >= 0.5:
                px[x, y] = (0, 0, 0, 0)

img.save(out, "PNG")
print(f"saved {out} cleared={cleared} size={w}x{h} corner={img.getpixel((0,0))}")


def square_icon(size, dest):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    logo = Image.open(out).convert("RGBA")
    scale = min(size / logo.width, size / logo.height) * 0.9
    nw, nh = int(logo.width * scale), int(logo.height * scale)
    logo = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(logo, ((size - nw) // 2, (size - nh) // 2), logo)
    canvas.save(dest, "PNG")


base = Path(r"D:\Projects\Kashmir Power Alerts\public")
square_icon(192, base / "icon-192.png")
square_icon(512, base / "icon-512.png")
square_icon(180, base / "apple-touch-icon.png")
img.save(Path(r"D:\Projects\Kashmir Power Alerts\src\app\icon.png"), "PNG")
Image.open(base / "apple-touch-icon.png").save(
    Path(r"D:\Projects\Kashmir Power Alerts\src\app\apple-icon.png"), "PNG"
)
print("icons ok")
