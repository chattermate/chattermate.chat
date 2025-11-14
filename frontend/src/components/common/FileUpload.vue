<!--
ChatterMate - File Upload Component
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { widgetEnv } from '../../webclient/widget-env'

const props = defineProps<{
  token?: string
  authorization?: string
  maxFiles?: number
  acceptTypes?: string
}>()

const emit = defineEmits<{
  (e: 'filesUploaded', files: Array<{content: string, filename: string, content_type: string, size: number}>): void
  (e: 'error', error: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFiles = ref<Array<{file: File, content: string, url: string, file_url: string, filename: string, type: string, size: number}>>([])
const uploading = ref(false)
const dragOver = ref(false)

const maxFiles = computed(() => props.maxFiles || 3)
const acceptTypes = computed(() => props.acceptTypes || 'image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls')

const canUploadMore = computed(() => uploadedFiles.value.length < maxFiles.value)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await uploadFiles(Array.from(target.files))
    // Reset the input value to allow selecting the same file again
    target.value = ''
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    await uploadFiles(Array.from(event.dataTransfer.files))
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = true
}

const handleDragLeave = () => {
  dragOver.value = false
}

const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  const files: File[] = []
  for (const item of Array.from(items)) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        files.push(file)
      }
    }
  }
  
  if (files.length > 0) {
    event.preventDefault()
    await uploadFiles(files)
  }
}

// Compress image if it's too large
const compressImage = async (file: File, maxSizeKB: number = 500): Promise<{blob: Blob, base64: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions (max 1920px width/height while maintaining aspect ratio)
        const maxDimension = 1920
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Start with quality 0.9 and reduce if needed
        let quality = 0.9
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            const sizeKB = blob.size / 1024
            
            // If still too large and quality can be reduced, try again
            if (sizeKB > maxSizeKB && quality > 0.3) {
              quality -= 0.1
              tryCompress()
            } else {
              // Convert blob to base64
              const reader = new FileReader()
              reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1]
                resolve({ blob, base64 })
              }
              reader.readAsDataURL(blob)
            }
          }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality)
        }
        
        tryCompress()
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const uploadFiles = async (files: File[]) => {
  if (!canUploadMore.value) {
    emit('error', `Maximum ${maxFiles.value} files allowed`)
    return
  }
  
  const remainingSlots = maxFiles.value - uploadedFiles.value.length
  const filesToUpload = files.slice(0, remainingSlots)
  
  if (files.length > remainingSlots) {
    emit('error', `Only ${remainingSlots} more file(s) can be uploaded`)
  }
  
  const TARGET_SIZE_KB = 500 // Target 500KB after compression
  
  // Read files and store them temporarily (will be uploaded when message is sent)
  for (const file of filesToUpload) {
    try {
      // Check if file with same name already exists
      const isDuplicate = uploadedFiles.value.some(f => f.filename === file.name)
      if (isDuplicate) {
        console.warn(`File ${file.name} is already selected`)
        emit('error', `File "${file.name}" is already selected`)
        continue
      }
      
      const isImage = file.type.startsWith('image/')
      
      if (isImage) {
        // Compress image before upload
        try {
          const { blob, base64 } = await compressImage(file, TARGET_SIZE_KB)
          const compressedSize = blob.size
          
          console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(2)}KB → ${(compressedSize / 1024).toFixed(2)}KB`)
          
          uploadedFiles.value.push({
            file: file,
            content: base64,
            filename: file.name,
            type: file.type,
            size: compressedSize,
            url: URL.createObjectURL(blob),
            file_url: URL.createObjectURL(blob)
          })
          
          // Emit the files after compression
          emit('filesUploaded', uploadedFiles.value.map(f => ({
            content: f.content,
            filename: f.filename,
            content_type: f.type,
            size: f.size
          })))
        } catch (error) {
          console.error('Image compression failed, uploading original:', error)
          // Fallback to original file if compression fails
          const reader = new FileReader()
          reader.onload = (e) => {
            const base64Content = e.target?.result as string
            const base64Data = base64Content.split(',')[1]
            
            uploadedFiles.value.push({
              file: file,
              content: base64Data,
              filename: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              url: URL.createObjectURL(file),
              file_url: URL.createObjectURL(file)
            })
            
            emit('filesUploaded', uploadedFiles.value.map(f => ({
              content: f.content,
              filename: f.filename,
              content_type: f.type,
              size: f.size
            })))
          }
          reader.readAsDataURL(file)
        }
      } else {
        // For non-images, read as-is
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64Content = e.target?.result as string
          const base64Data = base64Content.split(',')[1]
          
          uploadedFiles.value.push({
            file: file,
            content: base64Data,
            filename: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            url: '',
            file_url: ''
          })
          
          emit('filesUploaded', uploadedFiles.value.map(f => ({
            content: f.content,
            filename: f.filename,
            content_type: f.type,
            size: f.size
          })))
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('File read error:', error)
      emit('error', `Failed to read ${file.name}`)
    }
  }
}

const removeFile = (index: number) => {
  const file = uploadedFiles.value[index]
  if (!file) return
  
  // Revoke object URL if it exists to free memory
  if (file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url)
  }
  if (file.file_url && file.file_url.startsWith('blob:')) {
    URL.revokeObjectURL(file.file_url)
  }
  
  // Remove from local array
  uploadedFiles.value.splice(index, 1)
  emit('filesUploaded', uploadedFiles.value.map(f => ({
    content: f.content,
    filename: f.filename,
    content_type: f.type,
    size: f.size
  })))
}

const openFilePicker = () => {
  fileInput.value?.click()
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const isImage = (type: string | undefined | null): boolean => {
  return type ? type.startsWith('image/') : false
}

// Generate preview URL for file display
const getPreviewUrl = (file: {url: string, file_url: string}): string => {
  // If file_url is a blob URL (temporary preview), return as-is
  if (file.file_url.startsWith('blob:')) {
    return file.file_url
  }
  
  // If file_url is already a full URL (S3), return as-is
  if (file.file_url.startsWith('http://') || file.file_url.startsWith('https://')) {
    return file.file_url
  }
  
  // For local storage, prepend API URL
  return `${widgetEnv.API_URL}${file.file_url}`
}

defineExpose({
  uploadedFiles,
  clearFiles: () => { uploadedFiles.value = [] },
  handlePaste
})
</script>

<template>
  <div class="file-upload-container">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />
    
    <!-- Upload button -->
    <button
      v-if="canUploadMore"
      type="button"
      class="upload-button"
      :disabled="uploading"
      @click="openFilePicker"
      :title="'Attach files (or paste screenshots)'"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
    
    <!-- Drop zone overlay -->
    <div
      v-if="dragOver"
      class="drop-zone-overlay"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div class="drop-zone-content">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>Drop files here</p>
      </div>
    </div>
    
    <!-- File previews -->
    <div v-if="uploadedFiles.length > 0" class="file-previews">
      <div
        v-for="(file, index) in uploadedFiles"
        :key="index"
        class="file-preview"
      >
        <div class="file-preview-content">
          <img
            v-if="isImage(file.type)"
            :src="getPreviewUrl(file)"
            :alt="file.filename"
            class="file-preview-image"
          />
          <div v-else class="file-preview-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
        </div>
        <div class="file-preview-info">
          <div class="file-preview-name">{{ file.filename }}</div>
          <div class="file-preview-size">{{ formatFileSize(file.size) }}</div>
        </div>
        <button
          type="button"
          class="file-preview-remove"
          @click="removeFile(index)"
          :title="'Remove file'"
        >
          ×
        </button>
      </div>
    </div>
    
    <!-- Upload progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="upload-spinner"></div>
      <span>Uploading...</span>
    </div>
  </div>
</template>

<style scoped>
.file-upload-container {
  position: relative;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  padding: 0;
}

.upload-button:hover:not(:disabled) {
  background: #f0f0f0;
  color: #333;
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drop-zone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.drop-zone-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  color: #333;
}

.drop-zone-content svg {
  margin-bottom: 16px;
}

.drop-zone-content p {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.file-previews {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(59, 130, 246, 0.01) 100%);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px dashed rgba(59, 130, 246, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 13px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02);
  max-width: 100%;
  overflow: hidden;
}

.file-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg,
    #3b82f6 0%,
    #60a5fa 50%,
    #93c5fd 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.file-preview:hover {
  box-shadow:
    0 8px 16px rgba(59, 130, 246, 0.12),
    0 4px 8px rgba(59, 130, 246, 0.08);
  transform: translateY(-2px);
  border-color: #93c5fd;
}

.file-preview:hover::before {
  opacity: 1;
}

.file-preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 2px 8px rgba(59, 130, 246, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
}

.file-preview-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.4) 0%,
    transparent 100%);
  pointer-events: none;
}

.file-preview-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 10px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.file-preview:hover .file-preview-image {
  transform: scale(1.05);
}

.file-preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.file-preview:hover .file-preview-icon {
  transform: scale(1.1) rotate(-5deg);
}

.file-preview-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.file-preview-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.file-preview-size {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.file-preview-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

.file-preview-remove:hover {
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  border-color: #ef4444;
  color: white;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.25);
}

.file-preview-remove:active {
  transform: scale(1) rotate(90deg);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: #666;
  font-size: 13px;
}

.upload-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
