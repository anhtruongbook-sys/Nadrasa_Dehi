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
        # Standard OWASP / W3C Security Headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Permissions-Policy', 'geolocation=(self "*"), camera=(), microphone=()')
        self.send_header('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' data: blob: https:; frame-ancestors 'self';")
        if self.path.endswith(('.png', '.jpg', '.jpeg', '.ico', '.webp')):
            # Cache ảnh tĩnh 1 ngày
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            # HTML, JS, CSS: Tuyệt đối không cache để điện thoại luôn nhận bản mới nhất
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = 8080
    host = '0.0.0.0'
    server = ThreadingHTTPServer((host, port), FastCardHandler)
    print(f'Neta Light High-Performance Server running on port {port}...')
    server.serve_forever()
