const { connect, disconnect } = require("./db/connection");
const { ObjectId } = require("mongodb");
const express = require("express");
const { validarPeli } = require("./schemas/pelis.js");
const app = express();
const port = process.env.PORT || 3000;

// Agregamos middleware de parseo de json
app.use(express.json());
// Agregamos middleware para la conexion y desconexión con la DB
app.use("/peliculas", async (req, res, next) => {
  try {
    const client = await connect();
    req.db = client.db("moviesdb").collection("movies");
    console.log("conectado a movies");
    next();
  } catch (error) {
    console.error({ error });
  }
  res.on("finish", async () => {
    await disconnect();
  });
});
// Ruta raiz
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de Peliculas");
});
// Mostrar todas las Peliculas
app.get("/peliculas", async (req, res) => {
  const genre = req.query.genero;
  const query = !genre ? {} : { genre };
  try {
    const movies = await req.db.find(query).toArray();
    if (movies.length === 0) {
      res.status(404).json({ error: "No movies found" });
    } else {
      res.json(movies);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las peliculas" });
  }
});
// Mostrar Peliculas por id
app.get("/peliculas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const objectId = new ObjectId(id);
    const movie = await req.db.findOne({ _id: objectId });
    if (!movie) {
      res.status(404).json({ error: "No movie found" });
    } else {
      res.json(movie);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la pelicula" });
  }
});
// Mostrar Peliculas por director
app.get("/peliculas/director/:director", async (req, res) => {
  const { director } = req.params;
  try {
    const movies = await req.db.find({ director }).toArray();
    if (movies.length === 0) {
      res.status(404).json({ error: "No movie found" });
    } else {
      res.json(movies);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las peliculas" });
  }
});
// Mostrar Peliculas con una puntuación mayor o igual a :rate
app.get("/peliculas/rate/:rate", async (req, res) => {
  const rate = parseFloat(req.params.rate);
  try {
    const movies = await req.db.find({ rate: { $gte: rate } }).toArray();
    if (movies.length === 0) {
      res.status(404).json({ error: "No movie found" });
    } else {
      res.json(movies);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las peliculas" });
  }
});
// Agregar Peliculas
app.post("/peliculas", async (req, res) => {
  const resultado = validarPeli(req.body);
  if (!resultado.success) {
    res
      .status(400)
      .json({ error: "Invalid data: ", data: resultado.error.message });
  }
  const peliNueva = resultado.data;
  try {
    await req.db.insertOne(peliNueva);
    res.status(201).json(peliNueva);
  } catch (error) {
    res.status(500).json({ error: "Error creating movie" });
  }
});
// Escuchar el servidor
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
