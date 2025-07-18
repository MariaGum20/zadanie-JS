<template>
  <StatusLoaded :queueNumber="$route.query.queue" />
</template>

<script setup>
import StatusLoaded from '@/components/StatusLoaded.vue'
</script>