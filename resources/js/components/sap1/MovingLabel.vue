<!-- components/sap1/MovingLabel.vue -->
<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <p
    id="moving-label"
    v-show="text !== ''"
    class="absolute text-white text-lg px-2 shadow font-mono bg-blue-600 rounded z-50 pointer-events-none"
  >
    {{ text }}
  </p>
</template>
