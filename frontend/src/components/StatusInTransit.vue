<template>
  <div style="position: relative;">
    <!-- Заголовок с номером заказа и статусом -->
    <div class="order-header">
      <h3>Заказ №{{ props.orderNumber }}</h3>
      <p class="status">Статус: В пути</p>
    </div>
    <!-- Карта -->
    <div id="map" style="height: 90vh;"></div>

    <button @click="$router.push('/')">Назад</button>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'

// Точки маршрута — для начального отображения карты
const waypoints = [
  [55.751244, 37.618421], // Красная площадь
  [55.790544, 37.660363]  // ВДНХ
]

const props = defineProps(['orderNumber'])

let map = null
let placemark = null

// Состояния UI
const arrivalTime = ref('—')
const progress = ref(0)
let lastPosition = waypoints[0]

// Имитация координат с сервера
const fetchDriverLocation = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const fakeLocations = [
        [55.751244, 37.618421],
        [55.76, 37.62],
        [55.77, 37.63],
        [55.78, 37.64],
        [55.790544, 37.660363]
      ]
      const index = Math.floor(Math.random() * fakeLocations.length)
      resolve({
        lat: fakeLocations[index][0],
        lng: fakeLocations[index][1],
        eta: new Date(Date.now() + Math.random() * 300000) // через 0–5 мин
      })
    }, 500)
  })
}

// Инициализация карты
const initMap = () => {
  ymaps.ready(() => {
    map = new ymaps.Map('map', {
      center: waypoints[0],
      zoom: 12
    })

    // Создание маркера
    placemark = new ymaps.Placemark(waypoints[0], {
      hintContent: 'Водитель',
      balloonContent: 'Движется...'
    }, {
      iconLayout: 'default#image',
      iconImageHref: 'https://www.pngfind.com/pngs/m/353-3539794_png-file-svg-chevrolet-transparent-png.png ',
      iconImageSize: [30, 30],
      iconImageOffset: [-15, -15]
    })

    map.geoObjects.add(placemark)

    // Запуск обновления позиции водителя
    poll()
  })
}

// Анимированное перемещение маркера на основе времени
let currentAnimation = null
let isPaused = false

const moveMarkerSmoothly = (start, end) => {
  const duration = 5000 // Время анимации в миллисекундах
  const startCoords = [...start]
  const deltaLat = end[0] - start[0]
  const deltaLng = end[1] - start[1]
  let startTime = null

  const animate = (timestamp) => {
    if (isPaused) return

    if (!startTime) {
      startTime = timestamp
    }

    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)

    placemark.geometry.setCoordinates([
      startCoords[0] + deltaLat * progress,
      startCoords[1] + deltaLng * progress
    ])

    if (progress < 1) {
      currentAnimation = requestAnimationFrame(animate)
    }
  }

  currentAnimation = requestAnimationFrame(animate)
}

// Рекурсивный polling вместо бесконечного цикла
const POLLING_INTERVAL = 5000
let pollTimeout = null

const poll = async () => {
  if (isPaused) {
    pollTimeout = setTimeout(poll, POLLING_INTERVAL)
    return
  }

  try {
    const data = await fetchDriverLocation()
    const newPosition = [data.lat, data.lng]
    arrivalTime.value = formatETA(data.eta)

    moveMarkerSmoothly(lastPosition, newPosition)
    lastPosition = newPosition

    const totalDistance = getDistance(lastPosition, waypoints[1])
    const remainingDistance = getDistance(newPosition, waypoints[1])
    progress.value = Math.round((1 - remainingDistance / totalDistance) * 100)
  } catch (err) {
    console.error('Ошибка получения данных:', err)
  }

  pollTimeout = setTimeout(poll, POLLING_INTERVAL)
}

// Форматирование времени прибытия
const formatETA = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Простой подсчёт расстояния между двумя точками
const getDistance = (point1, point2) => {
  const EARTH_RADIUS_METERS = 6371e3

  const latitude1Rad = (point1[0] * Math.PI) / 180
  const latitude2Rad = (point2[0] * Math.PI) / 180
  const deltaLatitudeRad = ((point2[0] - point1[0]) * Math.PI) / 180
  const deltaLongitudeRad = ((point2[1] - point1[1]) * Math.PI) / 180

  const a =
    Math.sin(deltaLatitudeRad / 2) * Math.sin(deltaLatitudeRad / 2) +
    Math.cos(latitude1Rad) * Math.cos(latitude2Rad) * Math.sin(deltaLongitudeRad / 2) * Math.sin(deltaLongitudeRad / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c // расстояние в метрах
}

// Отслеживание активности вкладки
onMounted(() => {
  if (window.ymaps) {
    ymaps.ready(initMap)
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      isPaused = true
      if (currentAnimation) {
        cancelAnimationFrame(currentAnimation)
      }
    } else {
      isPaused = false
      // Запрашиваем новые данные и начинаем анимацию с актуальной позиции
      fetchDriverLocation().then(data => {
        const newPosition = [data.lat, data.lng]
        moveMarkerSmoothly(lastPosition, newPosition)
        lastPosition = newPosition
      })
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Очистка
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (pollTimeout) clearTimeout(pollTimeout)
    if (currentAnimation) cancelAnimationFrame(currentAnimation)
  })
})
</script>

<style scoped>
.route-info-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

.progress-bar {
  width: 200px;
  height: 10px;
  background: #eee;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 5px;
}

.progress-bar div {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.2s ease-in-out;
}
</style>