import urllib.request
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = "https://raw.githubusercontent.com/doanguyen/lasotuvi/master/lasotuvi/App.py"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
dest = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\lasotuvi_ref\App.py"
try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
        with open(dest, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Downloaded App.py ({len(content)} chars)")
except Exception as e:
    print(f"Error: {e}")
