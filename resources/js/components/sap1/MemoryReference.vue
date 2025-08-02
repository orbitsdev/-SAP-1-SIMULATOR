<script setup lang="ts">
import { memory } from '@/lib/fakeMemory'

const memoryEntries = Object.entries(memory)
</script>
<template>
    <div class="w-64 max-w-xs">
      <h2 class="mb-3 text-base font-semibold text-gray-800 uppercase tracking-widest">
        Memory
      </h2>

      <div class="space-y-1 text-xs font-mono">
        <div
          v-for="[address, value] in memoryEntries"
          :key="address"
          class="flex justify-between items-center px-3 py-1.5 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
        >
          <span class="text-gray-500 font-medium">{{ address }}</span>
          <span class="bg-white border border-gray-200 px-2 py-0.5 rounded tracking-widest text-gray-700">
            {{ value }}
          </span>
        </div>
      </div>
    </div>
  </template>
