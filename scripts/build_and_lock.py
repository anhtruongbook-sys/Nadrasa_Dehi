import os
import time
import sys
import urllib.request
import json
import subprocess

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def load_token():
    t = os.environ.get('GITHUB_TOKEN', '')
    if not t and os.path.exists('scripts/github_token.txt'):
        try:
            with open('scripts/github_token.txt', 'r', encoding='utf-8') as f:
                t = f.read().strip()
        except Exception:
            pass
    return t

def get_current_repo():
    try:
        proc = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True, check=True)
        url = proc.stdout.strip()
        # Parse owner/repo from https://github.com/owner/repo.git or git@github.com:owner/repo.git
        if 'github.com' in url:
            clean = url.split('github.com')[-1].lstrip('/:')
            if clean.endswith('.git'):
                clean = clean[:-4]
            return clean
    except Exception:
        pass
    return 'anhtruongbook-sys/Nadrasa_Dehi'

TOKEN = load_token()
REPO = get_current_repo()
TAG = 'v2.2.2'

def get_latest_commit():
    try:
        proc = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True)
        return proc.stdout.strip()[:7]
    except Exception:
        return ''

COMMIT = get_latest_commit()

def check_runs():
    req = urllib.request.Request(f'https://api.github.com/repos/{REPO}/actions/runs', headers={
        'User-Agent': 'Mozilla/5.0',
        'Authorization': f'Bearer {TOKEN}'
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8')).get('workflow_runs', [])

def set_private(is_priv):
    payload = json.dumps({'private': is_priv}).encode('utf-8')
    req = urllib.request.Request(f'https://api.github.com/repos/{REPO}', data=payload, method='PATCH', headers={
        'User-Agent': 'Mozilla/5.0',
        'Authorization': f'Bearer {TOKEN}',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            print(f"Repo private set to: {d.get('private')}")
    except Exception as e:
        print(f"Error setting private: {e}")

def rerun_workflow(run_id):
    req = urllib.request.Request(f'https://api.github.com/repos/{REPO}/actions/runs/{run_id}/rerun', data=b'{}', method='POST', headers={
        'User-Agent': 'Mozilla/5.0',
        'Authorization': f'Bearer {TOKEN}',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Rerun triggered for run ID: {run_id}")
    except Exception as e:
        print(f"Error rerunning workflow: {e}")

def download_apk():
    rel_url = f'https://api.github.com/repos/{REPO}/releases/tags/{TAG}'
    req = urllib.request.Request(rel_url, headers={
        'User-Agent': 'Mozilla/5.0',
        'Authorization': f'Bearer {TOKEN}'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            rel_data = json.loads(resp.read().decode('utf-8'))
            for asset in rel_data.get('assets', []):
                if asset.get('name') == 'NetaLight.apk':
                    asset_id = asset.get('id')
                    asset_api_url = f'https://api.github.com/repos/{REPO}/releases/assets/{asset_id}'
                    print(f'Downloading NetaLight.apk (id {asset_id})...')
                    dl_req = urllib.request.Request(asset_api_url, headers={
                        'User-Agent': 'Mozilla/5.0',
                        'Authorization': f'Bearer {TOKEN}',
                        'Accept': 'application/octet-stream'
                    })
                    with urllib.request.urlopen(dl_req) as dl_resp:
                        with open('NetaLight.apk', 'wb') as f:
                            f.write(dl_resp.read())
                    sz = os.path.getsize('NetaLight.apk') / (1024 * 1024)
                    print(f'SUCCESS: Downloaded NetaLight.apk ({sz:.2f} MB)')
                    return True
    except Exception as e:
        print(f"Error fetching release: {e}")
    return False

if __name__ == '__main__':
    try:
        print(f"Target repository detected: {REPO}")
        print("Temporarily setting repo to PUBLIC to build APK via GitHub Actions...")
        set_private(False)
        time.sleep(3)

        print("Checking runs for commit", COMMIT)
        has_rerun = False
        for i in range(70):
            runs = check_runs()
            target_run = None
            for r in runs:
                if r.get('head_sha', '').startswith(COMMIT):
                    target_run = r
                    break
            if target_run:
                status = target_run.get('status')
                conclusion = target_run.get('conclusion')
                run_id = target_run.get('id')
                print(f'[{i}] Run {run_id}: Status={status}, Conclusion={conclusion}')
                
                if status == 'completed':
                    if conclusion == 'failure' and not has_rerun:
                        print("Previous run failed (likely due to spending limit when private). Rerunning now...")
                        rerun_workflow(run_id)
                        has_rerun = True
                        time.sleep(10)
                        continue
                    elif conclusion == 'success':
                        print("Build succeeded! Downloading release APK...")
                        download_apk()
                        break
            else:
                print(f'[{i}] Waiting for run to appear for {COMMIT}...')
            time.sleep(15)
    finally:
        print('Restoring private repository status...')
        set_private(True)
