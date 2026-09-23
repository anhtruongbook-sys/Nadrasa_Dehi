import sys
import os
import mimetypes
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

class FastCardHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        if self.path.endswith(('.png', '.jpg', '.jpeg', '.ico', '.webp')):
            # Cache ảnh tĩnh 1 ngày
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            # HTML, JS, CSS: Luôn kiểm tra bản mới nhất
            self.send_header('Cache-Control', 'no-cache, must-revalidate, max-age=0')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = 8080
    host = '0.0.0.0'
    server = ThreadingHTTPServer((host, port), FastCardHandler)
    print(f'Neta Light High-Performance Server running on port {port}...')
    server.serve_forever()
