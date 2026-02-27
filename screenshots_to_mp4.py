import os, glob
from PIL import Image
import imageio
import numpy as np

src_dir = r"C:\Users\Kwekujasper\.gemini\antigravity\brain\fce29315-937e-49f0-b83d-c26c085c8aa8"
out_path = r"C:\Users\Kwekujasper\Desktop\NECHIS_Full_System_Tour\NECHIS_Full_System_Tour.mp4"
os.makedirs(os.path.dirname(out_path), exist_ok=True)

# Collect all PNGs sorted by modification time (= capture order)
pngs = sorted(
    glob.glob(os.path.join(src_dir, "*.png")),
    key=os.path.getmtime
)
print(f"Found {len(pngs)} screenshots")

# Target size (1920x1008 divisible by 16)
W, H = 1920, 1008
FPS = 1        # 1 frame per second will be shown for 3 seconds each
HOLD = 3       # seconds per slide

writer = imageio.get_writer(out_path, fps=FPS, codec="libx264", quality=8)

for i, p in enumerate(pngs):
    try:
        img = Image.open(p).convert("RGB")
        # Pad/resize to target keeping aspect ratio
        img.thumbnail((W, H), Image.LANCZOS)
        canvas = Image.new("RGB", (W, H), (10, 16, 30))
        x = (W - img.width) // 2
        y = (H - img.height) // 2
        canvas.paste(img, (x, y))
        frame = np.array(canvas)
        for _ in range(HOLD):
            writer.append_data(frame)
        print(f"  [{i+1}/{len(pngs)}] {os.path.basename(p)}")
    except Exception as e:
        print(f"  SKIP {os.path.basename(p)}: {e}")

writer.close()
size_mb = os.path.getsize(out_path) / 1024 / 1024
print(f"\nMP4 saved: {out_path}  ({size_mb:.1f} MB, {len(pngs)*HOLD}s total)")
