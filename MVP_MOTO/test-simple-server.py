import http.server
import socketserver
import json
from datetime import datetime

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"📥 Requisição recebida: {self.path}")
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/health':
            response = {
                'status': 'OK',
                'message': 'Servidor Python funcionando',
                'timestamp': datetime.now().isoformat()
            }
        else:
            response = {
                'message': 'Servidor Python de teste',
                'path': self.path
            }
        
        self.wfile.write(json.dumps(response).encode())

PORT = 8080
print(f"🚀 Servidor Python rodando na porta {PORT}")
print(f"📊 Teste: http://localhost:{PORT}/health")

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Parando servidor...")
        httpd.shutdown()
        print("✅ Servidor parado")