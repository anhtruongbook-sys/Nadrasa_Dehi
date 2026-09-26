import urllib.request
import os

TOKEN = ""
REPO = "anhtruongbook-sys/Nadrasa_Dehi"
ASSET_ID = 585848316
TARGET_FILE = os.path.join(os.getcwd(), "NetaLight.apk")

asset_url = f"https://api.github.com/repos/{REPO}/releases/assets/{ASSET_ID}"
print(f"Downloading release asset {ASSET_ID} from {asset_url}...")

req = urllib.request.Request(asset_url, headers={
    "User-Agent": "Mozilla/5.0",
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/octet-stream"
})

with urllib.request.urlopen(req) as resp:
    data = resp.read()
    with open(TARGET_FILE, "wb") as f:
        f.write(data)

size_mb = os.path.getsize(TARGET_FILE) / (1024 * 1024)
print(f"SUCCESS! Downloaded updated APK to {TARGET_FILE} ({size_mb:.2f} MB)")
