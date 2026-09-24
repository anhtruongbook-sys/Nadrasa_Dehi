import urllib.request
import json

TOKEN = "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"
API_URL = "https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/runs?per_page=3"

req = urllib.request.Request(API_URL, headers={
    "Authorization": f"Bearer {TOKEN}",
    "User-Agent": "Mozilla/5.0"
})

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        for run in data.get("workflow_runs", []):
            commit = run.get("head_commit", {}).get("id", "")[:7]
            msg = run.get("head_commit", {}).get("message", "").split("\n")[0][:50]
            print(f"Run {run.get('id')}: [{run.get('status')}] {run.get('conclusion')} | Commit: {commit} - {msg}")
except Exception as e:
    print(f"Error: {e}")
