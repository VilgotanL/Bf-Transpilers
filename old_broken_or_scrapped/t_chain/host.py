import http.server
import socketserver

port = 8000

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({
    ".js": "application/javascript"
})

httpd = socketserver.TCPServer(("", port), handler)
httpd.serve_forever()