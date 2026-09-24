import requests
import socket
import os
import shutil
import time

socket.setdefaulttimeout(15)

token = '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'
asset_id = 584293152
total_size = 60280087
chunk_size = 2 * 1024 * 1024

chunks_dir = r'c:\Books\Neta Light\temp_chunks'

def get_s3_url():
    r = requests.get(
        f'https://api.github.com/repos/anhtruongbook-sys/Nadrasa_Dehi/releases/assets/{asset_id}',
        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/octet-stream'},
        allow_redirects=False
    )
    if r.status_code in (301, 302, 303, 307):
        return r.headers['Location']
    raise RuntimeError('Failed to get redirect')

s3_url = get_s3_url()
print('Acquired fresh S3 URL.', flush=True)

# For missing chunks: 3 and 4
for idx in [3, 4]:
    s = idx * chunk_size
    e = min((idx + 1) * chunk_size - 1, total_size - 1)
    expected_len = e - s + 1
    chunk_file = os.path.join(chunks_dir, f'chunk_{idx:03d}.bin')
    
    if os.path.exists(chunk_file) and os.path.getsize(chunk_file) == expected_len:
        print(f'Chunk {idx} already exists ({expected_len} bytes).', flush=True)
        continue
    
    # Download in 512KB sub-ranges for 100% stability
    sub_size = 512 * 1024
    sub_chunks = []
    sub_start = s
    while sub_start <= e:
        sub_end = min(sub_start + sub_size - 1, e)
        sub_chunks.append((sub_start, sub_end))
        sub_start = sub_end + 1
    
    print(f'Downloading chunk {idx} in {len(sub_chunks)} sub-chunks...', flush=True)
    full_chunk_bytes = bytearray()
    
    for sub_i, (sub_s, sub_e) in enumerate(sub_chunks):
        sub_len = sub_e - sub_s + 1
        sub_ok = False
        for attempt in range(6):
            try:
                res = requests.get(
                    s3_url,
                    headers={'Range': f'bytes={sub_s}-{sub_e}', 'User-Agent': 'Mozilla/5.0'},
                    timeout=15
                )
                if res.status_code in (200, 206) and len(res.content) == sub_len:
                    full_chunk_bytes.extend(res.content)
                    print(f'Chunk {idx} sub {sub_i+1}/{len(sub_chunks)} done ({sub_len} bytes)', flush=True)
                    sub_ok = True
                    break
                elif res.status_code == 403:
                    s3_url = get_s3_url()
            except Exception as err:
                print(f'Chunk {idx} sub {sub_i+1} err (attempt {attempt+1}): {err}', flush=True)
                s3_url = get_s3_url()
                time.sleep(1)
        if not sub_ok:
            raise RuntimeError(f'Failed sub-chunk {sub_i} of chunk {idx}')
    
    with open(chunk_file, 'wb') as f:
        f.write(full_chunk_bytes)
    print(f'Successfully wrote chunk {idx:03d} ({len(full_chunk_bytes)} bytes)', flush=True)

# Assemble
target_path = r'c:\Books\Neta Light\NetaLight_v1.1.4.apk'
print('Assembling final APK from 29 chunks...', flush=True)
with open(target_path, 'wb') as out_f:
    for i in range(29):
        c_path = os.path.join(chunks_dir, f'chunk_{i:03d}.bin')
        with open(c_path, 'rb') as cf:
            out_f.write(cf.read())

shutil.copyfile(target_path, r'c:\Books\Neta Light\NetaLight.apk')
final_size = os.path.getsize(target_path)
print(f'ALL DONE! Final APK size: {final_size} bytes ({final_size/1024/1024:.2f} MB)', flush=True)
