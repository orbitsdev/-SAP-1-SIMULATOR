<script setup lang="ts">
import { memory } from '@/lib/fakeMemory'
import { computed } from 'vue'

const props = defineProps<{
  activeMemoryAddress?: string;
}>();

const memoryEntries = Object.entries(memory)

const isAddressActive = (address: string) => {
  return props.activeMemoryAddress === address
}

// Convert binary string to decimal for display
const binaryToDecimal = (binary: string): number => {
  return parseInt(binary, 2);
}
</script>
<template>
    <div class="w-64 max-w-xs">
      <h2 class="mb-3 text-base font-semibold text-gray-800 uppercase tracking-widest">
        Memory
      </h2>
      
      <!-- Column headers -->
      <div class="flex justify-between items-center px-3 py-1.5 mb-1 text-xs font-semibold">
        <div class="flex items-center" style="width: 90px;">
          <span>Address</span>
        </div>
        <div class="flex items-center">
          <span>Value</span>
        </div>
      </div>

      <div class="space-y-1 text-xs font-mono">
        <div
          v-for="[address, value] in memoryEntries"
          :key="address"
          :class="[
            'flex justify-between items-center px-3 py-1.5 rounded border transition',
            isAddressActive(address) ? 'active-memory border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          ]"
        >
          <div class="flex items-center">
            <span class="text-gray-500 font-medium">{{ address }}</span>
          </div>
          <div class="flex items-center">
            <span class="bg-white border border-gray-200 px-2 py-0.5 rounded tracking-widest text-gray-700">
              {{ value }}
            </span>
            <span class="text-xs text-gray-400 ml-1">#{{ binaryToDecimal(value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
