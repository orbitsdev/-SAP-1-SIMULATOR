<script setup>
defineProps({
    width: Number,
    height: Number
})
</script>
<template>
   <div
    class="bg-gray-500 w-full h-1 my-4"
    :style="{ width: width + 'px', height: height + 'px' }"
  >

  </div>
</template>

