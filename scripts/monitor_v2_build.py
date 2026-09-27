import os
import urllib.request
import json
import time
import sys
import subprocess

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

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
REPO = "anhtruongbook-sys/Nadrasa_Dehi"
RUN_ID = 36287940826
TAG = "v2.0.1"

def check_run_status():
    url = f"https://api.github.com/repos/{REPO}/actions/runs/{RUN_ID}"
    headers = {"User-Agent": "Mozilla/5.0"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('status'), data.get('conclusion')
    except Exception as e:
        return 'error', str(e)

def get_release_url():
    url = f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}"
    headers = {"User-Agent": "Mozilla/5.0"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for asset in data.get('assets', []):
                if asset.get('name') == 'NetaLight.apk':
                    return asset.get('browser_download_url'), asset.get('size')
            return data.get('html_url'), None
    except Exception as e:
        return None, str(e)

print(f"Monitoring GitHub Actions build for run {RUN_ID} (commit 5e3f06a -> release {TAG})...")
for i in range(40):
    status, conclusion = check_run_status()
    print(f"[{i*10}s] Status: {status} | Conclusion: {conclusion}")
    if status == 'completed':
        if conclusion == 'success':
            print("Build SUCCESS! Checking Release asset...")
            time.sleep(3)
            dl_url, size = get_release_url()
            print(f"Release URL: {dl_url} (Size: {size})")
        else:
            print(f"Build finished with conclusion: {conclusion}")
        break
    time.sleep(10)
