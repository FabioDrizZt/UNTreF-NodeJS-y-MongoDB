const { connect, disconnect } = require("./db/connection");
const { ObjectId } = require("mongodb");
const express = require("express");
const { validarPeli, validarPeliParcialmente } = require("./schemas/pelis.js");
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
  res.send("Bienvenido a la API de Peliculas 🎞");
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
    const movie = await req.db.findOne({ _id: new ObjectId(id) });
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
    res.status(400).json({ error: resultado.error.message });
  }
  try {
    await req.db.insertOne(resultado.data);
    res.status(201).json(resultado.data);
  } catch (error) {
    res.status(500).json({ error: "Error creating movie" });
  }
});
// Borrar Peliculas
app.delete("/peliculas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { deletedCount } = await req.db.deleteOne({ _id: new ObjectId(id) });
    res
      .status(deletedCount === 0 ? 404 : 204)
      .json(
        deletedCount === 0
          ? { error: "Movie not found" }
          : { message: "Movie deleted" }
      );
  } catch (error) {
    res.status(500).json({ error: "Error deleting movie" });
  }
});
// Modificar Peliculas
app.patch("/peliculas/:id", async (req, res) => {
  const resultado = validarPeliParcialmente(req.body);
  const peliNueva = resultado.data;
  if (!resultado.success) {
    res.status(400).json({ error: resultado.error.message });
  }
  const { id } = req.params;
  try {
    const updateResult = await req.db.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: peliNueva },
      { returnDocument: "after" }
    );
    if (!updateResult) {
      res.status(404).json({ message: "Peli no encontrada para actualizar" });
    } else {
      res.json({
        message: "Peli actualizada con éxito",
        updatedMovie: updateResult,
      });
    }
  } catch (error) {
    res.status(500).send("Error al actualizar la película");
  }
});
// Escuchar el servidor
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
