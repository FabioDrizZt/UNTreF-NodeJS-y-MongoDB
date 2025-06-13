const { z } = require('zod')

const peliSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  year: z.number().int().min(1900, 'Year must be at least 1900').max(2050, 'Year must be at most 2050'),
  director: z.string().min(3, 'Director must be at least 3 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(1000, 'Duration must be at most 1000 minutes'),
  poster: z.string().url({ message: 'Invalid URL' }).optional(),
  genre: z.array(z.enum([
    'Action',
    'Adventure',
    'Crime',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Sci-Fi',
    'Thriller'
  ])),
  rate: z.number().int().min(0, 'Rate must be at least 0').max(10, 'Rate must be at most 10').default(5)
})

const validarPeli = (peli) => {
  return peliSchema.safeParse(peli)
}

const validarPeliParcialmente = (peli) => {
  return peliSchema.partial().safeParse(peli)
}

module.exports = {
  validarPeli,
  validarPeliParcialmente
}