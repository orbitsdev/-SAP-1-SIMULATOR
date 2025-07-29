<script setup lang="ts">
const rows = Array.from({ length: 16 }, (_, i) => i + 1)
const cols = Array.from({ length: 16 }, (_, i) => i + 1)
</script>

<template>
 <div class="grid grid-cols-16 gap-px w-full h-full" style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">
  <template v-for="row in 16" :key="row">
    <template v-for="col in 16" :key="`${row}-${col}`">
      <div class="w-12 h-12 bg-blue-100 border border-yellow-300 text-[10px] text-blue-800 font-mono flex items-center justify-center">
        {{ row }},{{ col }}
      </div>
    </template>
  </template>
</div>

</template>
