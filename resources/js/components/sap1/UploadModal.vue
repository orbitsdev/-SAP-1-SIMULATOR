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

        <div class="bg-gray-100 p-3 rounded text-sm mt-3">
          <p class="font-bold">Example Program:</p>
          <pre class="mt-2 text-xs">00001001
00011010
00101100
11100000
11110000</pre>
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
