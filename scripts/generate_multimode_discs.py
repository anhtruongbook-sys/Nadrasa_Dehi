import numpy as np
from PIL import Image, ImageFilter, ImageOps

orig_path = r"C:\Books\Common Study\la_kinh_36_tang_satellite\Thước Lập Cực (Final).jpg"
im = Image.open(orig_path).convert("RGB")

cx, cy = 1647, 1647
R = 1328

# Crop bounding box of circle
box = (cx - R, cy - R, cx + R, cy + R)
crop = im.crop(box) # 2656 x 2656
W, H = crop.size

# Rotate 180 deg so North 0 deg is at 12 o'clock top
crop = crop.rotate(180, resample=Image.BICUBIC)

arr = np.array(crop, dtype=np.float32)
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

# Compute luminance
lum = 0.299 * r + 0.587 * g + 0.114 * b

# Detect red content: red is significantly higher than green and blue
redness = r - np.maximum(g, b)
is_red = (redness > 28) & (r > 90)

# Detect circular mask (with 3px smooth anti-aliased edge)
y, x = np.ogrid[:H, :W]
dist = np.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2)
circle_mask = np.clip((R - dist) / 2.5, 0.0, 1.0)

# Calculate transparency for white background:
# Pure white (lum ~ 255) -> alpha = 0
# Dark ink (lum < 160) -> alpha = 1.0
# Smooth transition between 160 and 245
ink_strength = np.clip((245.0 - lum) / (245.0 - 150.0), 0.0, 1.0)

# For red ink, keep it opaque
ink_strength = np.where(is_red, np.clip((255.0 - np.minimum(g, b)) / 100.0, 0.85, 1.0), ink_strength)

# Alpha channel = ink_strength * circle_mask * 255
alpha_trans = (ink_strength * circle_mask * 255.0).astype(np.uint8)

# Output 1: True Transparent Disc (Classic Black & Red)
# Clean up RGB: make paper white areas transparent while retaining RGB colors
rgba_trans = np.zeros((H, W, 4), dtype=np.uint8)
rgba_trans[:, :, 0] = np.clip(r, 0, 255).astype(np.uint8)
rgba_trans[:, :, 1] = np.clip(g, 0, 255).astype(np.uint8)
rgba_trans[:, :, 2] = np.clip(b, 0, 255).astype(np.uint8)
rgba_trans[:, :, 3] = alpha_trans

img_trans = Image.fromarray(rgba_trans, mode="RGBA")
img_trans_2048 = img_trans.resize((2048, 2048), Image.Resampling.LANCZOS)
img_trans_2048.save("assets/lakinh/thuoc_lap_cuc_trans.png", format="PNG", optimize=True)
print("Saved assets/lakinh/thuoc_lap_cuc_trans.png")

# Output 2: Golden Night / Satellite HUD Disc
# Convert black/grey ink to glowing warm gold/ivory (#ffea85 / #f6c85f)
# Red remains glowing ruby red (#ff4757)
gold_r = 255
gold_g = 225
gold_b = 135

gold_rgba = np.zeros((H, W, 4), dtype=np.uint8)
# Where it's red:
gold_rgba[:, :, 0] = np.where(is_red, np.clip(r * 1.15, 0, 255), gold_r).astype(np.uint8)
gold_rgba[:, :, 1] = np.where(is_red, np.clip(g * 0.7, 0, 255), gold_g).astype(np.uint8)
gold_rgba[:, :, 2] = np.where(is_red, np.clip(b * 0.7, 0, 255), gold_b).astype(np.uint8)
gold_rgba[:, :, 3] = alpha_trans

img_gold = Image.fromarray(gold_rgba, mode="RGBA")
img_gold_2048 = img_gold.resize((2048, 2048), Image.Resampling.LANCZOS)
img_gold_2048.save("assets/lakinh/thuoc_lap_cuc_gold.png", format="PNG", optimize=True)
print("Saved assets/lakinh/thuoc_lap_cuc_gold.png")
