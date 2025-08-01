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
    error.value = 'Please select a file first.'
    emit('error', 'Please select a file first.')
    return
  }

  const formData = new FormData()
  formData.append('program_file', fileInput.value)

  try {
    const response = await axios.post('/upload-program', formData)
    showDialog.value = false

    // Use the lines directly from the upload response if available
    if (response.data.lines) {
      emit('success', response.data.lines)
    } else {
      // Fallback to loading program if lines not in response
      const res = await axios.get('/program-load')
      if (res.data.exists) {
        emit('success', res.data.lines)
      } else {
        emit('error', 'No program instructions found after upload.')
      }
    }
  } catch (err: any) {
    if (err.response?.data?.error) {
      error.value = err.response.data.error
      emit('error', err.response.data.error)
    } else {
      error.value = 'Upload failed.'
      emit('error', 'Upload failed: ' + (err.message || 'Unknown error'))
    }
  }
}
</script>

<template>
  <Dialog v-model:open="showDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload Program File</DialogTitle>
      </DialogHeader>

      <!-- File Input -->
      <Input type="file" accept=".txt" @change="handleFileChange" class="mt-4" />

      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>

      <div class="mt-4 flex justify-end">
        <Button variant="default" @click="handleFileUpload">
          Upload
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
