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

TOKEN = get_token()
RUN_ID = "36256632140"

req = urllib.request.Request(
    f"https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/runs/{RUN_ID}/jobs",
    headers={"Authorization": f"Bearer {TOKEN}", "User-Agent": "Mozilla/5.0"}
)

try:
    # Check run details
    run_url = f"https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/runs/{RUN_ID}"
    req_run = urllib.request.Request(run_url, headers={"Authorization": f"Bearer {TOKEN}", "User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_run) as resp:
        run_data = json.loads(resp.read().decode("utf-8"))
        print(f"Run name: {run_data.get('name')}")
        print(f"Event: {run_data.get('event')}, Status: {run_data.get('status')}, Conclusion: {run_data.get('conclusion')}")
        print(f"HTML: {run_data.get('html_url')}")

    # Check job logs
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        for job in data.get("jobs", []):
            job_id = job.get('id')
            print(f"Job ID: {job_id} | Name: {job.get('name')} | Status: {job.get('status')} | Conclusion: {job.get('conclusion')}")
            for step in job.get("steps", []):
                print(f"  Step: {step.get('name')} - {step.get('status')} ({step.get('conclusion')})")
            # Try fetching job logs
            log_url = f"https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/jobs/{job_id}/logs"
            try:
                import requests
                r = requests.get(log_url, headers={"Authorization": f"Bearer {TOKEN}", "User-Agent": "Mozilla/5.0"}, allow_redirects=True)
                log_text = r.text
                print(f"--- LOGS FOR JOB {job_id} ({len(log_text)} bytes) ---")
                for line in log_text.splitlines()[:30]:
                    print(" ", line)
                if len(log_text.splitlines()) > 30:
                    print(f"--- LAST 30 LINES ---")
                    for line in log_text.splitlines()[-30:]:
                        print(" ", line)
            except Exception as le:
                print(f"Could not fetch logs: {le}")
except Exception as e:
    print(f"Error: {e}")
