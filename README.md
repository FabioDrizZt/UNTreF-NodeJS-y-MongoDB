# 🎬 Proyecto API de Películas con Node.js, Express y MongoDB 🚀

¡Bienvenidos, desarrolladores! 👋 Este repositorio es una demostración práctica de cómo migrar una API REST de un sistema de almacenamiento basado en archivos a una base de datos robusta como MongoDB. A través de este proyecto, podrán comprender las ventajas de usar una base de datos real y cómo adaptar el código para ello.

## 🎯 Introducción

El objetivo de este proyecto es mostrar la evolución de una API de películas. Partimos de una versión inicial (`serverArchivos.js`) que guarda los datos en un archivo JSON local, y la transformamos en una versión más avanzada y escalable (`server.js`) que utiliza MongoDB como sistema de base de datos.

Este cambio nos permite:
-   🤝 Mejorar la concurrencia: Múltiples peticiones pueden interactuar con los datos de forma más segura.
-   ⚡ Aumentar el rendimiento: Las bases de datos están optimizadas para operaciones de búsqueda, inserción y actualización.
-   🔒 Asegurar la persistencia y la integridad de los datos.
-   🔍 Realizar consultas más complejas de manera eficiente.

## 📂 Archivos Clave

### 📜 `serverArchivos.js` (El Antes ⏮️)

Esta es la primera versión de nuestra API. Sus características principales son:
-   Utiliza `require('./data/movies.json')` para cargar las películas en memoria al iniciar.
-   Para cualquier operación de escritura (crear, actualizar, borrar), utiliza el módulo `fs` de Node.js (concretamente `fs.writeFileSync`) para reescribir todo el archivo `movies.json`.
-   Aunque funcional para un proyecto pequeño, este enfoque es ineficiente y propenso a errores, especialmente si la aplicación crece.

### ✨ `server.js` (El Después ⏭️)

Esta es la versión mejorada y final de nuestra API. Aquí introducimos cambios significativos:
-   🔌 Conexión a MongoDB: Se conecta a una base de datos MongoDB para gestionar los datos de las películas.
-   🔗 Middleware de Conexión: Usa un middleware de Express para gestionar la conexión y desconexión a la base de datos en cada petición a la ruta `/peliculas`.
-   ⏳ Operaciones Asíncronas: Todas las interacciones con la base de datos son asíncronas, utilizando `async/await` para un código más limpio y legible.
-   ✅ Validación con Zod: Se integra `zod` para validar los datos que llegan al servidor, asegurando que tengan el formato esperado antes de interactuar con la base de datos.

---

## 📚 Conceptos Teóricos

En este proyecto aplicamos varios conceptos fundamentales del desarrollo backend.

### ✅ Validación de Datos con Zod

Nunca debemos confiar en los datos que provienen del cliente. La validación es un paso crucial para garantizar la seguridad y la integridad de nuestra aplicación.

**Zod** es una librería de declaración y validación de esquemas que nos ayuda a definir la "forma" que deben tener nuestros datos.

En nuestro `server.js`, la usamos de la siguiente manera:
```javascript
const { validarPeli, validarPeliParcialmente } = require("./schemas/pelis.js");

// ... en el endpoint de creación
const resultado = validarPeli(req.body);
if (!resultado.success) {
  // Si la validación falla, devolvemos un error 400
  return res.status(400).json({ error: resultado.error.message });
}
// Si la validación es exitosa, podemos usar resultado.data de forma segura
await req.db.insertOne(resultado.data);
```

-   `validarPeli`: Valida un objeto completo, ideal para crear una nueva película donde todos los campos son requeridos.
-   `validarPeliParcialmente`: Valida un objeto donde todas sus propiedades son opcionales. Esto es perfecto para el método `PATCH`, donde el cliente puede enviar solo los campos que desea actualizar.

### 🍃 Métodos de MongoDB Utilizados

Interactuamos con MongoDB a través del driver oficial para Node.js. Estos son los métodos que hemos utilizado:

-   `connect()`: Establece la conexión con nuestro servidor de MongoDB.
-   `db('moviesdb')`: Selecciona la base de datos con la que queremos trabajar.
-   `collection('movies')`: Selecciona la colección (similar a una tabla en SQL) donde se guardan nuestros documentos.
-   `find(query)`: Busca y devuelve todos los documentos que coinciden con el objeto `query`. Si la `query` está vacía (`{}`), devuelve todos los documentos. Devuelve un cursor, por lo que usamos `.toArray()` para convertir los resultados en un array.
-   `findOne({ _id: new ObjectId(id) })`: Busca y devuelve el primer documento que coincide con la query. Lo usamos para buscar películas por su `_id`. Es importante notar que el `id` debe ser convertido a un tipo `ObjectId` de MongoDB.
-   `insertOne(documento)`: Inserta un nuevo documento en la colección.
-   `deleteOne({ _id: new ObjectId(id) })`: Elimina el primer documento que coincide con la query. Devuelve un objeto con información sobre la operación, como `deletedCount`.
-   `findOneAndUpdate({ query }, { $set: datos }, { options })`: Busca un documento, lo actualiza y, opcionalmente, devuelve el documento modificado.
    -   `$set`: Es un operador de actualización de MongoDB que reemplaza el valor de un campo con el valor especificado.

### 🌐 Métodos HTTP y Endpoints

Nuestra API sigue un enfoque RESTful, utilizando los métodos HTTP (o "verbos") para indicar las acciones a realizar sobre los recursos. Nuestro recurso principal es `/peliculas`.

-   **`GET /peliculas`**: Obtiene una lista de todas las películas. Permite filtrar por género a través de un query param (ej: `/peliculas?genero=Action`).
-   **`GET /peliculas/:id`**: Obtiene una película específica por su ID.
-   **`POST /peliculas`**: Crea una nueva película. Los datos se envían en el cuerpo (`body`) de la petición.
-   **`PATCH /peliculas/:id`**: Actualiza parcialmente una película existente. Los datos a modificar se envían en el `body`.
-   **`DELETE /peliculas/:id`**: Elimina una película específica.

### 🚦 Códigos de Estado HTTP

Los códigos de estado son la forma en que el servidor le comunica al cliente el resultado de su petición. Es fundamental usarlos correctamente.

-   **`200 OK`**: La petición fue exitosa. Lo usamos para peticiones `GET` y `PATCH` exitosas.
-   **`201 Created`**: El recurso fue creado exitosamente. Lo usamos después de un `POST` exitoso.
-   **`204 No Content`**: La petición fue exitosa pero no hay contenido para devolver. Es común usarlo en peticiones `DELETE` exitosas.
-   **`400 Bad Request`**: El servidor no pudo entender la petición debido a una sintaxis inválida. Lo devolvemos cuando la validación de `zod` falla.
-   **`404 Not Found`**: El recurso solicitado no fue encontrado. Lo devolvemos cuando se busca una película con un `id` que no existe.
-   **`500 Internal Server Error`**: Ocurrió un error inesperado en el servidor. Lo usamos para capturar errores en nuestras operaciones de base de datos.

---

## 🚀 ¿Cómo ejecutar el proyecto?

Sigue estos pasos para poner en marcha el servidor en tu máquina local.

### 📋 Prerrequisitos
-   Node.js (versión 18 o superior)
-   MongoDB (puedes instalarlo localmente o usar un servicio en la nube como MongoDB Atlas)
-   Un gestor de paquetes como `npm` o `yarn`.

### 👣 Pasos
1.  **Clonar el repositorio**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**
    Crea un archivo llamado `.env` en la raíz del proyecto y añade tu cadena de conexión de MongoDB:
    ```
    MONGO_URI=mongodb://localhost:27017
    ```
    *Recuerda reemplazar la URI si tu base de datos está en otro lugar.*

4.  **Ejecutar el servidor**
    ```bash
    npm start
    ```
    o
    ```bash
    node server.js
    ```
    ¡Listo! El servidor estará escuchando en `http://localhost:3000`. 