<script setup>
defineProps({
    text: String
})
</script>
<template>
    <div class="bg-yellow-200 text-yellow-900 text-xs font-semibold px-2 py-1 rounded shadow">
    {{ text }}
  </div>
</template>
