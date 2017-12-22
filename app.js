const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const flash = require('express-flash')
const session = require('express-session')
const path = require('path')
const app = express()

app.set('port', (process.env.PORT || 5000))
app.engine('ejs', require('ejs-locals'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'alan grant vs. t-rex',
    resave: false,
    saveUninitialized: false
}))
app.use(flash())

app.use('/', require('./routes/index'))
app.use('/products', require('./routes/products'))

// Handle 404
app.use((req, res) => {
    res.status(404).send('404: Not Found!')
})

// Handle 500
app.use((error, req, res) => {
    console.log(error)
    res.status(500).send('500: Internal Server Error!')
})

module.exports = app
