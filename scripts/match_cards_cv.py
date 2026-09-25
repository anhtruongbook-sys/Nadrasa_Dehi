import os
import cv2
import numpy as np

old_dir = r'C:\Books\Neta Light\neta_cards'
new_dir = r'C:\Books\Neta Light\Bai Neta'

# Card 1..48 and back
old_files = [f'card_{i:02d}.png' for i in range(1, 49)] + ['card_back.png']
new_files = sorted([f for f in os.listdir(new_dir) if f.endswith('.jpg')])

print(f"Loading {len(old_files)} old and {len(new_files)} new images...")

old_imgs = {}
for of in old_files:
    img = cv2.imread(os.path.join(old_dir, of))
    # Resize to standard 200x320
    img_res = cv2.resize(img, (200, 320))
    old_imgs[of] = img_res

new_imgs = {}
for nf in new_files:
    img = cv2.imread(os.path.join(new_dir, nf))
    img_res = cv2.resize(img, (200, 320))
    new_imgs[nf] = img_res

# Calculate normalized cross correlation / MSE / histogram correlation
sim_matrix = np.zeros((len(new_files), len(old_files)))

for i, nf in enumerate(new_files):
    n_img = new_imgs[nf]
    n_hsv = cv2.cvtColor(n_img, cv2.COLOR_BGR2HSV)
    n_hist = cv2.calcHist([n_hsv], [0, 1], None, [50, 60], [0, 180, 0, 256])
    cv2.normalize(n_hist, n_hist, 0, 1, cv2.NORM_MINMAX)

    for j, of in enumerate(old_files):
        o_img = old_imgs[of]
        o_hsv = cv2.cvtColor(o_img, cv2.COLOR_BGR2HSV)
        o_hist = cv2.calcHist([o_hsv], [0, 1], None, [50, 60], [0, 180, 0, 256])
        cv2.normalize(o_hist, o_hist, 0, 1, cv2.NORM_MINMAX)

        # Histogram correlation
        hist_corr = cv2.compareHist(n_hist, o_hist, cv2.HISTCMP_CORREL)

        # Template / pixel match (normalized cross correlation)
        res = cv2.matchTemplate(n_img, o_img, cv2.TM_CCOEFF_NORMED)[0][0]

        # Combine
        sim_matrix[i, j] = 0.5 * hist_corr + 0.5 * res

print("Similarity matrix computed.")

# Find best assignment
# Let's inspect top 3 matches for each new image
for i, nf in enumerate(new_files):
    scores = sim_matrix[i]
    top_indices = np.argsort(scores)[::-1][:3]
    top_matches = [(old_files[idx], scores[idx]) for idx in top_indices]
    matches_str = ", ".join([f"{name} ({sc:.3f})" for name, sc in top_matches])
    print(f"{nf} -> {matches_str}")
