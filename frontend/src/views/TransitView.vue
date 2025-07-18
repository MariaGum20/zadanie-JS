<template>
  <StatusInTransit :orderNumber="$route.query.order" />
</template>

<script setup>
import StatusInTransit from '@/components/StatusInTransit.vue'
</script>