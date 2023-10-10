const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended:false }))

const transmisiRouter = require('./routes/transmisi')
app.use('/api/transmisi', transmisiRouter)

const kendaraanRouter = require('./routes/kendaraan')
app.use('/api/kendaraan', kendaraanRouter)

app.listen(port,() => {
    console.log(`http:://localhost:${port}`)
})