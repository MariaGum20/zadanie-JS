<template>
  <div class="container">
    <h2>Статус: Загружен</h2>
    <p>Вы в очереди под номером {{ queueNumber }}</p>
    <button @click="$router.push('/')">Назад</button>
  </div>
</template>

<script setup>
defineProps(['queueNumber'])
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>