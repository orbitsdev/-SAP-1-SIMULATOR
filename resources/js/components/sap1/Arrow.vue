<script setup>
defineProps({
    width: Number,
    height: Number
})
</script>
<template>
 <svg :width="width" :height="height" viewBox="0 0 100 20">
    <line x1="0" y1="10" x2="90" y2="10" stroke="black" stroke-width="2"/>
    <polygon points="90,5 100,10 90,15" fill="black" />
  </svg>
</template>
