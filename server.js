const { connect, disconnect } = require('./db/connection');

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// Agregamos middleware de parseo de json
app.use(express.json())

// Ruta raiz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Peliculas')
})
// Mostrar todas las Peliculas
app.get('/peliculas', async (req, res) => {
    const genre = req.query.genero
    const query = !genero ? {} : {genre}
    const client = await connect()
    try {
        const movies = await client.db('moviesdb').collection('movies').find(query).toArray()
        if (movies.length === 0) {
            res.status(404).json({ error: 'No movies found' })
        } else {
            res.json(movies)
        }
    } catch (error) {
        res.status(500).json({ error: 'Error getting movies' })
    } finally {
        disconnect()
    }
})
// Mostrar Peliculas por id
app.get('/peliculas/:id', async (req, res) => {
    const client = await connect()
    const { id } = req.params
    try {
        const movie = await client.db('moviesdb').collection('movies').findOne({ id })
        if (!movie) {
            res.status(404).json({ error: 'No movie found' })
        } else {
            res.json(movie)
        }
    } catch (error) {
        res.status(500).json({ error: 'Error getting movie' })
    } finally {
        disconnect()
    }
})
// Escuchar el servidor
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
