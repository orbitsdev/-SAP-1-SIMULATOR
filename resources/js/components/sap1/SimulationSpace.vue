<script setup lang="ts">
import Box from './Box.vue';
import Bus from './Bus.vue';

// Import any other components you'll need
</script>

<template>
    <div class="grid grid-cols-16 grid-rows-16 gap-1 w-full h-full" style="min-height: 800px;">
        <!-- Program Counter (PC) - Using grid coordinates directly from the guideline -->
        <Box title="Program Counter" value="PC" :row="3" :col="2" />

    
    </div>
</template>

<style scoped>
/* Define grid columns and rows */
.grid-cols-16 {
  grid-template-columns: repeat(16, minmax(0, 1fr));
}

.grid-rows-16 {
  grid-template-rows: repeat(16, minmax(0, 1fr));
}
</style>
