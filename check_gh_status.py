import subprocess
import urllib.request
import json

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
url = "https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/runs?per_page=5"

req = urllib.request.Request(url, headers={
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "NetaLight-Checker"
})

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Total runs: {data.get('total_count')}")
        for r in data.get('workflow_runs', []):
            commit_msg = r.get('head_commit', {}).get('message', '').split('\n')[0][:50]
            print(f"- ID: {r['id']} | Status: {r['status']} | Conclusion: {r.get('conclusion')} | Event: {r['event']} | Branch: {r['head_branch']} | Commit: {commit_msg}")
except Exception as e:
    print(f"Error: {e}")
