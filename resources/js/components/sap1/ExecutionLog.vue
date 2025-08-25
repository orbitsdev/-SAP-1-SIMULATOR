<script setup lang="ts">
const props = defineProps<{
  logs?: string[];
}>();
</script>

<template>
  <div class="bg-gray-50 border border-gray-300 rounded-md p-4 max-h-80 overflow-y-auto">
    <h3 class="text-base font-semibold mb-2">Execution Log</h3>
    <div v-if="!props.logs || props.logs.length === 0" class="text-gray-500 text-sm italic">
      No execution logs yet. Run the simulation to see logs.
    </div>
    <div v-else class="space-y-1 text-sm font-mono text-gray-700">
      <div 
        v-for="(log, index) in props.logs" 
        :key="index" 
        class="py-1 border-b border-gray-100"
      >
        {{ log }}
      </div>
    </div>
  </div>
</template>
