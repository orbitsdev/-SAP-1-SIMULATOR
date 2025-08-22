<script setup lang="ts">
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import axios from 'axios'

const showDialog = defineModel<boolean>('open')
const fileInput = ref<File | null>(null)
const error = ref<string | null>(null)
const isUploading = ref<boolean>(false)
const emit = defineEmits<{
  success: [lines: string[]],
  error: [message: string]
}>()

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target?.files?.[0]

  if (!file) {
    fileInput.value = null
    error.value = 'No file selected.'
    return
  }

  if (file.name !== 'program_instructions.txt') {
    fileInput.value = null
    error.value = 'File must be named program_instructions.txt'
    return
  }

  fileInput.value = file
  error.value = null
}

async function handleFileUpload() {
  if (!fileInput.value) {
    error.value = 'Please select a file first'
    return
  }

  const formData = new FormData()
  formData.append('program_file', fileInput.value)

  try {
    error.value = ''
    isUploading.value = true
    const response = await axios.post('/upload-program', formData)

    if (response.data?.error) {
      error.value = response.data.error
      emit('error', response.data.error)
      return
    }

    if (response.data.instructions) {
      emit('success', response.data.instructions)
      showDialog.value = false
    }
  } catch (err: any) {
    console.error('Upload error:', err)
    if (err.response?.data?.error) {
      error.value = err.response.data.error
      emit('error', err.response.data.error)
    } else {
      error.value = 'Failed to upload file'
      emit('error', 'Failed to upload file')
    }
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="showDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload Program File</DialogTitle>
      </DialogHeader>

      <div class="bg-gray-50 p-4 rounded-md mt-3 border border-gray-200">
        <h3 class="font-medium text-gray-700 mb-2">File Requirements:</h3>
        <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>File name: <code class="bg-gray-100 px-1 rounded">program_instructions.txt</code></li>
          <li>Each line must contain exactly 8 binary digits (0s and 1s)</li>
          <li>Empty lines will be ignored</li>
        </ul>

        <h3 class="font-medium text-gray-700 mt-4 mb-2">SAP-1 Instruction Format:</h3>
        <div class="bg-gray-100 p-3 rounded text-sm mb-3">
          <p>Each instruction is 8 bits: <code class="font-bold">CCCC OOOO</code></p>
          <ul class="list-disc pl-5 text-gray-600 space-y-1 mt-1">
            <li><code>CCCC</code>: 4-bit opcode (instruction type)</li>
            <li><code>OOOO</code>: 4-bit operand (memory address)</li>
          </ul>
        </div>

        <h3 class="font-medium text-gray-700 mb-2">Instruction Set:</h3>
        <div class="overflow-auto max-h-60 bg-white border border-gray-200 rounded">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Instruction</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Opcode</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Example</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 text-xs">
              <tr>
                <td class="px-3 py-2 font-medium">LDA</td>
                <td class="px-3 py-2 font-mono">0000</td>
                <td class="px-3 py-2">Load value from memory address into accumulator</td>
                <td class="px-3 py-2 font-mono">00001001 <span class="text-gray-500">// Load from address 9</span></td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-medium">ADD</td>
                <td class="px-3 py-2 font-mono">0001</td>
                <td class="px-3 py-2">Add value from memory address to accumulator</td>
                <td class="px-3 py-2 font-mono">00011010 <span class="text-gray-500">// Add from address A</span></td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-medium">SUB</td>
                <td class="px-3 py-2 font-mono">0010</td>
                <td class="px-3 py-2">Subtract value from memory address from accumulator</td>
                <td class="px-3 py-2 font-mono">00101100 <span class="text-gray-500">// Subtract from address C</span></td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-medium">OUT</td>
                <td class="px-3 py-2 font-mono">1110</td>
                <td class="px-3 py-2">Output accumulator value (operand ignored)</td>
                <td class="px-3 py-2 font-mono">11100000 <span class="text-gray-500">// Output accumulator</span></td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-medium">HLT</td>
                <td class="px-3 py-2 font-mono">1111</td>
                <td class="px-3 py-2">Halt execution (operand ignored)</td>
                <td class="px-3 py-2 font-mono">11110000 <span class="text-gray-500">// Stop program</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="font-medium text-gray-700 mt-4 mb-2">Example Program:</h3>
        <div class="bg-gray-100 p-3 rounded font-mono text-xs">
          <div class="grid grid-cols-2 gap-x-4">
            <div>
              <p class="font-bold mb-1">Instructions:</p>
              <p>00001001  <span class="text-gray-500">// LDA 9 (Load from address 9)</span></p>
              <p>00011010  <span class="text-gray-500">// ADD A (Add from address A)</span></p>
              <p>00101100  <span class="text-gray-500">// SUB C (Subtract from address C)</span></p>
              <p>11100000  <span class="text-gray-500">// OUT (Output result)</span></p>
              <p>11110000  <span class="text-gray-500">// HLT (Stop program)</span></p>
            </div>
            <div>
              <p class="font-bold mb-1">Memory Values:</p>
              <p>00000000  <span class="text-gray-500">// Address 0-7: Program instructions</span></p>
              <p>00000000  <span class="text-gray-500">// (and unused memory)</span></p>
              <p>00000000  <span class="text-gray-500">// </span></p>
              <p>00010000  <span class="text-gray-500">// Address 9: Value = 16 (decimal)</span></p>
              <p>00010100  <span class="text-gray-500">// Address A: Value = 20 (decimal)</span></p>
              <p>00011100  <span class="text-gray-500">// Address C: Value = 28 (decimal)</span></p>
            </div>
          </div>
          <div class="mt-3 text-gray-600 text-xs">
            <p><strong>Program Logic:</strong> Load 16, add 20 (result: 36), subtract 28 (result: 8), output 8, then halt.</p>
          </div>
        </div>

        <div class="bg-blue-50 p-3 rounded mt-3 text-xs text-blue-700 border border-blue-200">
          <p class="font-medium">💡 Tips:</p>
          <ul class="list-disc pl-5 space-y-1 mt-1">
            <li>Memory addresses 0-7 are typically used for program instructions</li>
            <li>Memory addresses 8-F (8-15) are typically used for data values</li>
            <li>Each instruction executes in 6 steps (T0-T5): 3 fetch steps + 3 execute steps</li>
            <li>The simulator will visualize each step of the execution cycle</li>
          </ul>
        </div>
      </div>

      <!-- File Input -->
      <Input type="file" accept=".txt" @change="handleFileChange" class="mt-4" />

      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>

      <div class="mt-4 flex justify-end">
        <Button variant="default" :disabled="isUploading" @click="handleFileUpload">
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
