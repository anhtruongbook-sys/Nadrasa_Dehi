import urllib.request
import json

TOKEN = ""
RUN_ID = "36097871218"

req = urllib.request.Request(
    f"https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/actions/runs/{RUN_ID}/jobs",
    headers={"Authorization": f"Bearer {TOKEN}", "User-Agent": "Mozilla/5.0"}
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        for job in data.get("jobs", []):
            print(f"Job: {job.get('name')} - Status: {job.get('status')}")
            for step in job.get("steps", []):
                print(f"  Step: {step.get('name')} - {step.get('status')} ({step.get('conclusion')})")
except Exception as e:
    print(f"Error: {e}")
