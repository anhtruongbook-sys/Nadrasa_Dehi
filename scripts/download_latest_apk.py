import requests
import json
import os
import subprocess

def get_token():
    try:
        proc = subprocess.Popen(["git", "credential", "fill"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        out, _ = proc.communicate("protocol=https\nhost=github.com\n")
        for line in out.splitlines():
            if line.startswith("password="):
                return line.split("=", 1)[1].strip()
    except Exception:
        pass
    return ""

TOKEN = get_token()
headers = {"Authorization": f"Bearer {TOKEN}"}

print("Fetching release v1.9.1 info...")
rel = requests.get(
    "https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/releases/tags/v1.9.1",
    headers=headers
).json()

asset = None
for a in rel.get("assets", []):
    if a.get("name") == "NetaLight.apk":
        asset = a
        break

if not asset:
    print("Asset NetaLight.apk not found in release!")
    exit(1)

aid = asset["id"]
size_mb = asset["size"] / (1024 * 1024)
print(f"Downloading NetaLight.apk (ID: {aid}, {size_mb:.2f} MB)...")

download_headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/octet-stream",
    "User-Agent": "Mozilla/5.0"
}
r = requests.get(
    f"https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/releases/assets/{aid}",
    headers=download_headers,
    stream=True
)

if r.status_code == 200:
    with open("NetaLight.apk", "wb") as f:
        for chunk in r.iter_content(chunk_size=1024 * 1024):
            if chunk:
                f.write(chunk)
    actual_mb = os.path.getsize("NetaLight.apk") / (1024 * 1024)
    print(f"SUCCESS: NetaLight.apk updated locally! ({actual_mb:.2f} MB)")
else:
    print(f"Failed to download: Status {r.status_code}")
