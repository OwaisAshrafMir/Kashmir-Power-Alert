from PIL import Image
from collections import deque
from pathlib import Path

src = Path(r"D:\Projects\Kashmir Power Alerts\public\logo-source.png")
out = Path(r"D:\Projects\Kashmir Power Alerts\public\logo.png")
public = Path(r"D:\Projects\Kashmir Power Alerts\public")
app = Path(r"D:\Projects\Kashmir Power Alerts\src\app")

img = Image.open(src).convert("RGBA")
px = img.load()
w, h = img.size

def is_bg(r, g, b, a):
    return a > 0 and r >= 248 and g >= 248 and b >= 248

visited = [[False] * h for _ in range(w)]
q = deque()
for x, y in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
    r,g,b,a = px[x,y]
    if is_bg(r,g,b,a):
        visited[x][y] = True
        q.append((x,y))
while q:
    x,y = q.popleft()
    px[x,y] = (0,0,0,0)
    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx,ny = x+dx,y+dy
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
            r,g,b,a = px[nx,ny]
            if is_bg(r,g,b,a):
                visited[nx][ny] = True
                q.append((nx,ny))

for y in range(h):
    for x in range(w):
        r,g,b,a = px[x,y]
        if a and r >= 250 and g >= 250 and b >= 250:
            transparent = 0
            total = 0
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
                nx,ny = x+dx,y+dy
                if 0 <= nx < w and 0 <= ny < h:
                    total += 1
                    if px[nx,ny][3] == 0:
                        transparent += 1
            if total and transparent/total >= 0.5:
                px[x,y] = (0,0,0,0)

bbox = img.getbbox()
if bbox:
    pad = 8
    l,t,r,b = bbox
    img = img.crop((max(0,l-pad), max(0,t-pad), min(w,r+pad), min(h,b+pad)))

img.save(out, "PNG")
print("logo.png", img.size)

def square_icon(size, dest):
    canvas = Image.new("RGBA", (size, size), (0,0,0,0))
    logo = Image.open(out).convert("RGBA")
    scale = min(size/logo.width, size/logo.height) * 0.92
    nw, nh = int(logo.width*scale), int(logo.height*scale)
    logo = logo.resize((nw,nh), Image.Resampling.LANCZOS)
    canvas.paste(logo, ((size-nw)//2, (size-nh)//2), logo)
    canvas.save(dest, "PNG")

square_icon(192, public/"icon-192.png")
square_icon(512, public/"icon-512.png")
square_icon(180, public/"apple-touch-icon.png")
img.save(app/"icon.png", "PNG")
Image.open(public/"apple-touch-icon.png").save(app/"apple-icon.png", "PNG")
print("ok")
