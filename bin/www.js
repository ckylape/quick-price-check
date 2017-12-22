#!/usr/bin/env node
const app = require('../app')
const http = require('http')
const server = http.createServer(app)

server.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + server.address().port)
})