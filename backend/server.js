require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;


connectDB();

app.get('/', (req, res) => {
    res.send('This is from the Backend Server')
})

app.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`)
})