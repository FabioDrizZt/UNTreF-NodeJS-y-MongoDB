const express = require('express')
const app = express()
const port = 3000
const pelis = require('./data/movies.json')
const crypto = require('node:crypto')
const fs = require('fs')
const { validarPeli } = require('./schemas/pelis.js')

// deshabilitar cabecera de express
app.disable('x-powered-by')
// Agregamos middleware de parseo de json
app.use(express.json())

// Ruta raiz
app.get('/', (req, res) => {
  res.send('Hello World!')
})
// Mostrar Peliculas por genero
app.get('/peliculas', (req, res) => {
  // const { genero } = req.query
  const genero = req.query.genero.toLowerCase()
  if (genero) {
    const pelisGenero = pelis.filter(peli => peli.genre.some(g => g.toLowerCase() === genero))
    if (pelisGenero.length) {
      res.json(pelisGenero)
    } else {
      res.status(404).json({ error: 'No movies found' })
    }
  }
  if (pelis) {
    res.json(pelis)
  } else {
    res.status(404).json({ error: 'No movies found' })
  }
})
// Mostrar Peliculas por id
app.get('/peliculas/:id', (req, res) => {
  const { id } = req.params
  const peli = pelis.find(peli => peli.id === id)
  if (peli) {
    res.json(peli)
  } else {
    res.status(404).json({ error: 'Peli not found' })
  }
})
// Agregar Peliculas
app.post('/peliculas', (req, res) => {
  const resultado = validarPeli(req.body)
  if (!resultado.success) {
    res.status(400).json({ error: 'Invalid data: ', data: resultado.error })
  }
  const peliNueva = {
    id: crypto.randomUUID()
    , ...resultado.data
  }
  /* const peliNueva = { id: crypto.randomUUID(), ...req.body } */
  try {
    pelis.push(peliNueva)
    // enviarlo al archivo con fs
    fs.writeFileSync('./data/movies.json', JSON.stringify(pelis, null, 2))
    // 201: Creado
    res.status(201).json(peliNueva)
  } catch (error) {
    res.status(500).json({ error: 'Error creating movie' })
  }
})
// Borrar Peliculas
app.delete('/peliculas/:id', (req, res) => {
  const { id } = req.params
  const peliaBorrarIndex = pelis.findIndex(peli => peli.id === id)
  if (peliaBorrarIndex < 0) { // -1 si no sencuentra
    res.status(404).json({ error: 'Movie not found' })
  }

  try {
    const peliBorrada = pelis.splice(peliaBorrarIndex, 1)
    fs.writeFileSync('./data/movies.json', JSON.stringify(pelis, null, 2))
    // 204 No contenido
    // res.status(204).json({ message: 'Movie deleted' })
    res.status(200).json({ message: 'Movie deleted', data: peliBorrada })
  }
  catch (error) {
    // 500 error interno
    res.status(500).json({ error: 'Error deleting movie' })
  }
})
// Modificar Peliculas
app.patch('/peliculas/:id', (req, res) => {
  /* Validación de datos enviados por el cliente
  const resultado = validarPeli(req.body)
    const peliNueva = {
      id: crypto.randomUUID()
      , ...resultado.data
    } */
  const { id } = req.params
  const peliModificadaIndex = pelis.findIndex(peli => peli.id === id)
  if (peliModificadaIndex < 0) { // -1 si no sencuentra
    res.status(404).json({ error: 'Movie not found' })
  }
  try {
    pelis[peliModificadaIndex] = { ...pelis[peliModificadaIndex], ...req.body }
    fs.writeFileSync('./data/movies.json', JSON.stringify(pelis, null, 2))
    res.status(200).json({ message: 'Movie updated', data: pelis[peliModificadaIndex] })
  } catch (error) {
    res.status(500).json({ error: 'Error updating movie' })
  }
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
