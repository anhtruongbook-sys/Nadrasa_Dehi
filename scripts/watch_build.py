import urllib.request
import json
import time
import sys

TOKEN = "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"
REPO = "anhtruongbook-sys/Nadrasa_Dehi"
API_URL = f"https://api.github.com/repos/{REPO}/actions/runs"

print(f"Monitoring GitHub Actions runs for {REPO} commit 73167d8...")

def get_runs():
    req = urllib.request.Request(API_URL, headers={
        "User-Agent": "Mozilla/5.0",
        "Authorization": f"Bearer {TOKEN}"
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8")).get("workflow_runs", [])

for attempt in range(40):
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
            
            if head_sha == "73167d8" and status == "completed":
                print(f"Build completed with conclusion: {conclusion}")
                print(f"URL: {html_url}")
                if conclusion == "success":
                    print("SUCCESS! Release is created.")
                    sys.exit(0)
                else:
                    print(f"Workflow finished with non-success conclusion: {conclusion}")
                    sys.exit(1)
        else:
            print(f"[{time.strftime('%H:%M:%S')}] No runs found.")
    except Exception as e:
        print(f"Error fetching runs: {e}")
    time.sleep(12)

print("Timeout waiting for build completion.")
sys.exit(2)
