<script setup lang="ts">
import { memory } from '@/lib/fakeMemory'
import { computed } from 'vue'
import { instructionSet } from '@/lib/instructions'

const props = defineProps<{
  activeMemoryAddress?: string;
  currentInstruction?: number;
}>();

const memoryEntries = Object.entries(memory)

const isAddressActive = (address: string) => {
  return props.activeMemoryAddress === address
}

const isProgramCounter = (address: string) => {
  return props.currentInstruction !== undefined && 
         parseInt(address, 2) === props.currentInstruction
}

// Convert binary string to decimal for display
const binaryToDecimal = (binary: string): number => {
  return parseInt(binary, 2);
}

// Determine if a value is an instruction or data
const isInstruction = (value: string): boolean => {
  const opcode = value.slice(0, 4);
  return instructionSet.some(ins => ins.binary === opcode);
}

// Get instruction name if it's an instruction
const getInstructionName = (value: string): string => {
  if (!isInstruction(value)) return '';
  const opcode = value.slice(0, 4);
  const instruction = instructionSet.find(ins => ins.binary === opcode);
  return instruction ? instruction.name : '';
}

// Get memory content description
const getMemoryDescription = (address: string, value: string): string => {
  const addressDecimal = parseInt(address, 2);
  const valueDecimal = parseInt(value, 2);
  
  if (isInstruction(value)) {
    const name = getInstructionName(value);
    const operand = parseInt(value.slice(4, 8), 2);
    if (name === 'OUT' || name === 'HLT') {
      return `${name} instruction`;
    } else {
      return `${name} from address ${operand}`;
    }
  } else {
    return `Data value: ${valueDecimal}`;
  }
}
</script>
<template>
    <div class="w-80 max-w-sm">
      <h2 class="mb-3 text-base font-semibold text-gray-800 uppercase tracking-widest">
        Memory
      </h2>
      
      <div class="mb-2 text-xs text-gray-600">
        <div class="flex items-center mb-1">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          <span>Program Counter</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>Active Memory Address</span>
        </div>
      </div>
      
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
            'flex flex-col px-3 py-1.5 rounded border transition',
            isProgramCounter(address) && isAddressActive(address) ? 'border-purple-500 bg-purple-50' :
            isProgramCounter(address) ? 'border-blue-500 bg-blue-50' :
            isAddressActive(address) ? 'border-green-500 bg-green-50' : 
            'border-gray-200 bg-gray-50 hover:bg-gray-100'
          ]"
        >
          <div class="flex justify-between items-center w-full">
            <div class="flex items-center">
              <span class="text-gray-500 font-medium">{{ address }}</span>
              <span class="text-xs text-gray-400 ml-1">({{ binaryToDecimal(address) }})</span>
              <span v-if="isProgramCounter(address)" class="ml-1 text-blue-600 text-xs">(PC)</span>
            </div>
            <div class="flex items-center">
              <span class="bg-white border border-gray-200 px-2 py-0.5 rounded tracking-widest text-gray-700">
                {{ value }}
              </span>
              <span class="text-xs text-gray-400 ml-1">#{{ binaryToDecimal(value) }}</span>
            </div>
          </div>
          <div class="mt-1 text-xs text-gray-600">
            {{ getMemoryDescription(address, value) }}
          </div>
        </div>
      </div>
    </div>
  </template>
