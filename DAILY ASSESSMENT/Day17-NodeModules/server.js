const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000

const server = http.createServer((req, res) => {
    if (req.url === '/') {

        const filePath = path.join(__dirname, 'index.html')
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(200, { 'Content-Type': 'text/plain' })
                res.end('Hello from Node.js Server')
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(data)
            }
        })
    } else if (req.url === '/about') {
        const filePath = path.join(__dirname, 'about.html')
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(200, { 'Content-Type': 'text/plain' })
                res.end('About Page')
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(data)
            }
        })
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('404 Not Found')
    }
})

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
    console.log('Visit / for Home and /about for About Page')
    console.log('Press Ctrl+C to stop the server.')
})
