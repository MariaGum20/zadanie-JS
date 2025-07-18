import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3000

// Тестовые заказы
const orders = {
  '0000123': {
    status: 'in_transit',
    queueNumber: 3,
    route: [
      { lat: 55.75, lng: 37.57 },
      { lat: 55.76, lng: 37.61 }
    ]
  },
  '0000456': {
    status: 'loaded',
    queueNumber: 1
  }
}

// Разрешаем все источники
app.use(cors())

// Для парсинга URL-параметров
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API endpoint
app.get('/api/order', (req, res) => {
  const { orderNumber } = req.query
  const order = orders[orderNumber]

  if (!order) return res.status(404).json({ error: 'Заказ не найден' })

  res.json(order)
})

// Для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Backend работает!')
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Backend запущен на http://localhost:${PORT}`)
})