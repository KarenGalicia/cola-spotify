require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json());

// Ruta para obtener el token de acceso desde Spotify
app.get('/get-token', async (req, res) => {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();

        if (response.ok) {
            res.json({ access_token: data.access_token });
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el token' });
    }
});

app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
