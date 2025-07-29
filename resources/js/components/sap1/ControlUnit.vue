<script setup>
defineProps({
  signals: {
    type: Array,
    default: () => [
      { label: 'Fetch PC', active: false },
      { label: 'Load IR', active: false },
      { label: 'Inc PC', active: false },
      { label: 'Exec T3', active: false },
      { label: 'Exec T4', active: false },
      { label: 'Exec T5', active: false }
    ]
  }
})
</script>
<template>
  <div class="bg-blue-100 border border-blue-400 rounded p-2 w-40">
    <div class="font-bold text-xs text-center mb-1">Control Unit</div>
    <ul class="text-[10px] font-mono text-center space-y-1">
      <li v-for="(signal, i) in signals" :key="i">
        T{{ i }}: <span :class="signal.active ? 'text-green-600' : 'text-gray-400'">{{ signal.label }}</span>
      </li>
    </ul>
  </div>
</template>
