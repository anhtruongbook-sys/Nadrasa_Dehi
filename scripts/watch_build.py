import urllib.request
import json
import time
import sys
import os

TOKEN = "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"
REPO = "anhtruongbook-sys/Nadrasa_Dehi"
API_URL = f"https://api.github.com/repos/{REPO}/actions/runs"

def get_runs():
    req = urllib.request.Request(API_URL, headers={
        "User-Agent": "Mozilla/5.0",
        "Authorization": f"Bearer {TOKEN}"
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8")).get("workflow_runs", [])

def download_asset_for_tag(tag="v1.3.2"):
    rel_url = f"https://api.github.com/repos/{REPO}/releases/tags/{tag}"
    req = urllib.request.Request(rel_url, headers={
        "User-Agent": "Mozilla/5.0",
        "Authorization": f"Bearer {TOKEN}"
    })
    with urllib.request.urlopen(req) as resp:
        rel_data = json.loads(resp.read().decode("utf-8"))
        for asset in rel_data.get("assets", []):
            if asset.get("name") == "NetaLight.apk":
                asset_id = asset.get("id")
                asset_api_url = f"https://api.github.com/repos/{REPO}/releases/assets/{asset_id}"
                print(f"Downloading {asset.get('name')} (asset_id: {asset_id}) from {asset_api_url}...")
                dl_req = urllib.request.Request(asset_api_url, headers={
                    "User-Agent": "Mozilla/5.0",
                    "Authorization": f"Bearer {TOKEN}",
                    "Accept": "application/octet-stream"
                })
                with urllib.request.urlopen(dl_req) as dl_resp:
                    content = dl_resp.read()
                    with open("NetaLight.apk", "wb") as f:
                        f.write(content)
                size_mb = os.path.getsize("NetaLight.apk") / (1024 * 1024)
                print(f"SUCCESS! Downloaded NetaLight.apk ({size_mb:.2f} MB)")
                return True
    return False

# Target commit is passed via sys.argv or latest commit
target_commit = sys.argv[1] if len(sys.argv) > 1 else None
print(f"Monitoring GitHub Actions runs for {REPO} (target: {target_commit or 'latest'})...")

for attempt in range(60):
    try:
        runs = get_runs()
        if runs:
            latest = runs[0]
            head_sha = latest.get("head_sha", "")[:7]
            status = latest.get("status")
            conclusion = latest.get("conclusion")
            run_id = latest.get("id")
            html_url = latest.get("html_url")
            msg = latest.get("head_commit", {}).get("message", "").split("\n")[0][:60]
            
            print(f"[{time.strftime('%H:%M:%S')}] Run #{run_id} ({head_sha}): status={status}, conclusion={conclusion} | msg: {msg}")
            
            matched = (head_sha == target_commit) if target_commit else True
            if matched and status == "completed":
                print(f"Build completed with conclusion: {conclusion}")
                print(f"URL: {html_url}")
                if conclusion == "success":
                    print("SUCCESS! Downloading updated APK from release v1.3.0...")
                    time.sleep(5)
                    download_asset_for_tag("v1.3.0")
                    sys.exit(0)
                else:
                    print(f"Workflow finished with non-success conclusion: {conclusion}")
                    sys.exit(1)
        else:
            print(f"[{time.strftime('%H:%M:%S')}] No runs found.")
    except Exception as e:
        print(f"Error fetching runs: {e}")
    time.sleep(15)

print("Timeout waiting for build completion.")
sys.exit(2)
