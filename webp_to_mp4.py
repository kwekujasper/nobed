import sys
from PIL import Image
import imageio
import numpy as np

webp_path = r"C:\Users\Kwekujasper\.gemini\antigravity\brain\fce29315-937e-49f0-b83d-c26c085c8aa8\nechis_moh_full_demo_1772193275321.webp"
out_path   = r"C:\Users\Kwekujasper\Desktop\NECHIS_MoH_Pitch\NECHIS_Demo.mp4"

img = Image.open(webp_path)
frames = []
try:
    while True:
        frame = img.copy().convert("RGB")
        frames.append(np.array(frame))
        img.seek(img.tell() + 1)
except EOFError:
    pass

print(f"Extracted {len(frames)} frames")

if not frames:
    print("ERROR: No frames found in WebP")
    sys.exit(1)

fps = 12  # browser recordings are ~12 fps

writer = imageio.get_writer(out_path, fps=fps, codec="libx264", quality=8)
for f in frames:
    writer.append_data(f)
writer.close()

print(f"MP4 saved to: {out_path}")
