import sys, os
from PIL import Image
import imageio
import numpy as np

webp_path = r"C:\Users\Kwekujasper\.gemini\antigravity\brain\fce29315-937e-49f0-b83d-c26c085c8aa8\nechis_full_system_tour_1772197073339.webp"
out_path   = r"C:\Users\Kwekujasper\Desktop\NECHIS_Full_System_Tour\NECHIS_Full_System_Tour.mp4"

os.makedirs(os.path.dirname(out_path), exist_ok=True)

img = Image.open(webp_path)
frames = []
try:
    while True:
        frames.append(np.array(img.copy().convert("RGB")))
        img.seek(img.tell() + 1)
except EOFError:
    pass

print(f"Extracted {len(frames)} frames")
if not frames:
    print("ERROR: No frames"); sys.exit(1)

writer = imageio.get_writer(out_path, fps=12, codec="libx264", quality=8)
for f in frames:
    writer.append_data(f)
writer.close()
print(f"MP4 saved: {out_path}")
