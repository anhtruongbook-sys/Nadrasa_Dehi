import subprocess
import urllib.request
import json
import sys

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

token = get_token()
run_id = "36261195185"
req = urllib.request.Request(
    f"https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/runs/{run_id}/jobs",
    headers={"Authorization": f"Bearer {token}", "User-Agent": "Mozilla/5.0"}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    for job in data.get("jobs", []):
        print(f"Job: {job.get('name')} | Status: {job.get('status')} | Conclusion: {job.get('conclusion')}")
        for s in job.get("steps", []):
            print(f"  Step: {s.get('name')} -> {s.get('status')} ({s.get('conclusion')})")
