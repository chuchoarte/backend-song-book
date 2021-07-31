const express = require('express');
var cors = require('cors')
const app = express();
require('dotenv').config();

const {PORT} = process.env;

app.use(cors())

app.use(express.static('public'));

app.use('/api/lyric', require('./routes/lyric'));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`)
})