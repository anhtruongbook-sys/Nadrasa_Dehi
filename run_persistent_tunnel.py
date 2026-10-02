import sys
import os
import time
import re
import subprocess

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def start_server():
    server_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server.py')
    return subprocess.Popen([sys.executable, server_path], cwd=os.path.dirname(os.path.abspath(__file__)))

def start_tunnel():
    cf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cloudflared.exe')
    cmd = [cf_path, 'tunnel', '--url', 'http://127.0.0.1:8088']
    proc = subprocess.Popen(
        cmd,
        cwd=os.path.dirname(os.path.abspath(__file__)),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        errors='replace'
    )
    
    url = None
    url_regex = re.compile(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com')
    url_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cloudflare_url.txt')
    
    while True:
        line = proc.stdout.readline()
        if not line and proc.poll() is not None:
            break
        if line:
            print(line, end='', flush=True)
            if not url:
                match = url_regex.search(line)
                if match:
                    url = match.group(0)
                    with open(url_file, 'w', encoding='utf-8') as f:
                        f.write(url + '\n')
                    print(f"\n============================================================", flush=True)
                    print(f"🌟 NETA LIGHT CLOUDFLARE TUNNEL URL:", flush=True)
                    print(f"👉 {url}", flush=True)
                    print(f"============================================================\n", flush=True)

    return proc

if __name__ == '__main__':
    print("Khởi chạy máy chủ nội bộ Neta Light (Port 8088)...", flush=True)
    srv_proc = start_server()
    time.sleep(1.5)
    print("Khởi chạy Cloudflare Tunnel độc lập & liên tục...", flush=True)
    try:
        cf_proc = start_tunnel()
    except KeyboardInterrupt:
        srv_proc.terminate()
