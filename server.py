import sys
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

class FastCardHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        if self.path.endswith(('.png', '.jpg', '.jpeg', '.ico', '.webp')):
            # Cache ảnh tĩnh trong 1 ngày để di động tải cực nhanh
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = 8080
    host = '0.0.0.0'
    server = ThreadingHTTPServer((host, port), FastCardHandler)
    print(f'Neta Light High-Performance Server running on port {port}...')
    server.serve_forever()
