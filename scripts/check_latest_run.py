import os
import subprocess
import urllib.request
import json
import sys

def get_token():
    if os.path.exists("scripts/github_token.txt"):
        try:
            with open("scripts/github_token.txt", "r", encoding="utf-8") as f:
                t = f.read().strip()
                if t: return t
        except Exception:
            pass
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
req = urllib.request.Request(
    "https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/runs",
    headers={"Authorization": f"Bearer {token}", "User-Agent": "Mozilla/5.0"}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    for r in data.get("workflow_runs", [])[:5]:
        print(f"ID: {r.get('id')} | Name: {r.get('name')} | SHA: {r.get('head_sha')[:7]} | Status: {r.get('status')} | Conclusion: {r.get('conclusion')} | Msg: {r.get('head_commit', {}).get('message', '').splitlines()[0]}")
