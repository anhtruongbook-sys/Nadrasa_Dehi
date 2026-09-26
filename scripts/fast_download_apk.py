import requests
import concurrent.futures
import os
import shutil
import time

token = ''
asset_id = 584293152
total_size = 60280087
chunk_size = 2 * 1024 * 1024  # 2MB

chunks_dir = r'c:\Books\Neta Light\temp_chunks'
os.makedirs(chunks_dir, exist_ok=True)

def get_s3_url():
    r = requests.get(
        f'https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/releases/assets/{asset_id}',
        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/octet-stream'},
        allow_redirects=False
    )
    if r.status_code in (301, 302, 303, 307):
        return r.headers['Location']
    raise RuntimeError(f'Could not get S3 URL: {r.status_code}')

s3_url = get_s3_url()
print('Acquired S3 URL.', flush=True)

chunks = []
start = 0
while start < total_size:
    end = min(start + chunk_size - 1, total_size - 1)
    chunks.append((start, end))
    start = end + 1

def fetch_and_save(idx, s, e, url):
    chunk_file = os.path.join(chunks_dir, f'chunk_{idx:03d}.bin')
    expected_len = e - s + 1
    if os.path.exists(chunk_file) and os.path.getsize(chunk_file) == expected_len:
        return idx, True
    
    headers = {'Range': f'bytes={s}-{e}', 'User-Agent': 'Mozilla/5.0'}
    for attempt in range(4):
        try:
            res = requests.get(url, headers=headers, timeout=(6, 15))
            if res.status_code in (200, 206) and len(res.content) == expected_len:
                with open(chunk_file, 'wb') as f:
                    f.write(res.content)
                return idx, True
        except Exception:
            time.sleep(0.5)
    return idx, False

# Outer loop to guarantee all chunks get downloaded
for loop in range(1, 10):
    missing = []
    for idx, (s, e) in enumerate(chunks):
        chunk_file = os.path.join(chunks_dir, f'chunk_{idx:03d}.bin')
        expected_len = e - s + 1
        if not (os.path.exists(chunk_file) and os.path.getsize(chunk_file) == expected_len):
            missing.append((idx, s, e))
    
    if not missing:
        print('All chunks present!', flush=True)
        break

    print(f'Round {loop}: Downloading {len(missing)} missing chunks with 8 workers...', flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(fetch_and_save, idx, s, e, s3_url) for idx, s, e in missing]
        for fut in concurrent.futures.as_completed(futures):
            idx, ok = fut.result()
            if ok:
                print(f'Saved chunk {idx:03d}', flush=True)
            else:
                print(f'Chunk {idx:03d} failed, will retry next round', flush=True)

    # Refresh S3 URL for next round just in case
    if len(missing) > 0:
        try:
            s3_url = get_s3_url()
        except Exception:
            pass

target_path = r'c:\Books\Neta Light\NetaLight_v1.1.4.apk'
print('Assembling final APK...', flush=True)
with open(target_path, 'wb') as out_f:
    for idx in range(len(chunks)):
        chunk_file = os.path.join(chunks_dir, f'chunk_{idx:03d}.bin')
        with open(chunk_file, 'rb') as cf:
            out_f.write(cf.read())

shutil.copyfile(target_path, r'c:\Books\Neta Light\NetaLight.apk')
final_size = os.path.getsize(target_path)
print(f'SUCCESS! Completed assembling APK: {final_size} bytes ({final_size/1024/1024:.2f} MB)', flush=True)
