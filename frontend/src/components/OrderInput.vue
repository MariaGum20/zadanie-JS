<template>
  <div class="order-input">
    <h2>Введите номер заказа</h2>
    <input v-model="orderNumber" placeholder="Например: 0000123" />
    <button @click="checkStatus">Проверить статус</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const orderNumber = ref('')
const router = useRouter()

// Мок данных
const mockData = {
  '0000123': { status: 'in_transit', driverId: 'D1', coordinates: [55.75, 37.57] },
  '0000456': { status: 'loaded', queueNumber: 3 },
  '0000789': { status: 'in_transit', driverId: 'D2', coordinates: [55.76, 37.58] },
  '0000001': { status: 'in_transit', driverId: 'D3', coordinates: [55.74, 37.60] },
  '0000002': { status: 'loaded', queueNumber: 1 },
  '0000003': { status: 'in_transit', driverId: 'D4', coordinates: [55.73, 37.61] },
  '0000999': { status: 'delivered' }
}

let currentCoordinates = {}

function updateCoordinates(driverId, newCoords) {
  if (!newCoords) return
  const stepCount = 50
  const startCoords = currentCoordinates[driverId] || [...newCoords]
  const deltaLat = (newCoords[0] - startCoords[0]) / stepCount
  const deltaLng = (newCoords[1] - startCoords[1]) / stepCount

  for (let i = 0; i <= stepCount; i++) {
    setTimeout(() => {
      currentCoordinates[driverId] = [
        startCoords[0] + deltaLat * i,
        startCoords[1] + deltaLng * i
      ]
    }, i * 20)
  }
}

function getDriverLocation(driverId) {
  return currentCoordinates[driverId] || [55.75, 37.57]
}

const checkStatus = async () => {
  const data = mockData[orderNumber.value]

  if (!data) {
    console.error('Заказ не найден')
    return router.push({ path: '/other' })
  }

  // Обновляем координаты водителя
  if (data.status === 'in_transit') {
    updateCoordinates(data.driverId, data.coordinates)
    router.push({
      path: '/transit',
      query: {
        order: orderNumber.value,
        lat: getDriverLocation(data.driverId)[0],
        lng: getDriverLocation(data.driverId)[1]
      }
    })
  } else if (data.status === 'loaded') {
    router.push({ path: '/loaded', query: { queue: data.queueNumber } })
  } else {
    router.push('/other')
  }
}
</script>

<style scoped>
.order-input {
  padding: 20px;
  max-width: 400px;
  margin: 40px auto;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-top: 10px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>