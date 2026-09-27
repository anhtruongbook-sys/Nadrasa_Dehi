from PIL import Image

img = Image.open(r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\.user_uploaded\media_1790447055778.png")
width, height = img.size
print(f"Image size: {width}x{height}")

# Crop around the red box: y from ~25% to ~35% of height
crop_box = (0, int(height * 0.26), width, int(height * 0.36))
cropped = img.crop(crop_box)
cropped.save(r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\crop_user_red_box.png")
print("Saved crop_user_red_box.png")
