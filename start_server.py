import http.server
import socketserver

PORT = 8000

class COOPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 1. Security Headers (Required for FFmpeg/SharedArrayBuffer)
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        
        # 2. Disable Caching (So browser always sees code updates)
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        
        # 3. Finalize headers
        super().end_headers()

# GLOBAL SETTING: Tell the server that .wasm files are "application/wasm"
# This fixes the MIME type without breaking the HTTP protocol
http.server.SimpleHTTPRequestHandler.extensions_map['.wasm'] = 'application/wasm'

print(f"Server started at http://localhost:{PORT}")
print("Press Ctrl+C to stop.")

# Allow address reuse to prevent "Address already in use" errors
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), COOPHandler) as httpd:
    httpd.serve_forever()
