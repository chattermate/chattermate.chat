/**
 * ChatterMate - Widget File Handling Composable
 * Copyright (C) 2024 ChatterMate
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>
 */

import { ref, type Ref } from 'vue'
import { widgetEnv } from '../webclient/widget-env'

export function useWidgetFiles(token: Ref<string | null>, fileInputRef: Ref<HTMLInputElement | null>) {
  // File handling state
  const uploadedAttachments = ref<Array<{
    content: string
    filename: string
    type: string
    size: number
    url: string
    file_url: string
  }>>([])
  
  const previewModal = ref(false)
  const previewFile = ref<{
    url: string
    filename: string
    type: string
    file_url?: string
    size?: number
  } | null>(null)

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Check if file is an image
  const isImageAttachment = (contentType: string): boolean => {
    return contentType.startsWith('image/')
  }

  // Generate download URL for attachments
  const getDownloadUrl = (fileUrl: string | undefined | null): string => {
    if (!fileUrl) return ''
    
    // If it's a blob URL (temporary), return as-is
    if (fileUrl.startsWith('blob:')) {
      return fileUrl
    }
    
    // If it's already a full URL, return as-is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl
    }
    
    // For local storage paths, prepend the API URL
    return `${widgetEnv.API_URL}${fileUrl}`
  }

  // Generate preview URL for file display (similar to FileUpload.vue)
  const getPreviewUrl = (file: {url: string, file_url?: string}): string => {
    const urlToUse = file.file_url || file.url
    if (!urlToUse) return ''
    
    // If it's a blob URL (temporary preview), return as-is
    if (urlToUse.startsWith('blob:')) {
      return urlToUse
    }
    
    // If it's already a full URL (S3), return as-is
    if (urlToUse.startsWith('http://') || urlToUse.startsWith('https://')) {
      return urlToUse
    }
    
    // For local storage, prepend API URL
    return `${widgetEnv.API_URL}${urlToUse}`
  }

  // Handle file selection from input
  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      await uploadFiles(Array.from(target.files))
      // Reset the input value to allow selecting the same file again
      target.value = ''
    }
  }

  // Handle drag and drop
  const handleDrop = async (event: DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files))
    }
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
  }

  // Handle paste events
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

  // Upload files (convert to base64 and store locally)
  const uploadFiles = async (files: File[]) => {
    const MAX_FILES = 3 // Maximum 3 files per message
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB for images
    const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB for documents
    const TARGET_SIZE_KB = 500 // Target 500KB after compression
    
    // Check if adding these files would exceed the limit
    if (uploadedAttachments.value.length >= MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed per message`)
      return
    }
    
    const remainingSlots = MAX_FILES - uploadedAttachments.value.length
    const filesToUpload = files.slice(0, remainingSlots)
    
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more file(s) can be uploaded. Maximum ${MAX_FILES} files per message.`)
    }
    
    for (const file of filesToUpload) {
      try {
        // Check if file with same name already exists
        const isDuplicate = uploadedAttachments.value.some(att => att.filename === file.name)
        if (isDuplicate) {
          console.warn(`File ${file.name} is already selected`)
          alert(`File "${file.name}" is already selected`)
          continue
        }
        
        const isImage = file.type.startsWith('image/')
        const maxSize = isImage ? MAX_FILE_SIZE : MAX_DOCUMENT_SIZE
        
        // Validate file size before upload
        if (file.size > maxSize) {
          const maxSizeMB = maxSize / (1024 * 1024)
          console.error(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB`)
          alert(`File "${file.name}" is too large. Maximum size for ${isImage ? 'images' : 'documents'} is ${maxSizeMB}MB`)
          continue
        }
        
        if (isImage) {
          // Compress image before upload
          try {
            const { blob, base64 } = await compressImage(file, TARGET_SIZE_KB)
            const compressedSize = blob.size
            
            console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(2)}KB → ${(compressedSize / 1024).toFixed(2)}KB`)
            
            uploadedAttachments.value.push({
              content: base64,
              filename: file.name,
              type: file.type,
              size: compressedSize,
              url: URL.createObjectURL(blob),
              file_url: URL.createObjectURL(blob)
            })
          } catch (error) {
            console.error('Image compression failed, uploading original:', error)
            // Fallback to original file if compression fails
            const reader = new FileReader()
            reader.onload = (e) => {
              const base64Content = e.target?.result as string
              const base64Data = base64Content.split(',')[1]
              
              uploadedAttachments.value.push({
                content: base64Data,
                filename: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file),
                file_url: URL.createObjectURL(file)
              })
            }
            reader.readAsDataURL(file)
          }
        } else {
          // For non-images, read as-is
          const reader = new FileReader()
          reader.onload = (e) => {
            const base64Content = e.target?.result as string
            const base64Data = base64Content.split(',')[1]
            
            uploadedAttachments.value.push({
              content: base64Data,
              filename: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              url: '',
              file_url: ''
            })
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('File upload error:', error)
      }
    }
  }

  // Remove attachment and call delete API
  const removeAttachment = async (index: number) => {
    const file = uploadedAttachments.value[index]
    if (!file) return
    
    // Call delete API to remove file from storage
    try {
      // Extract the file path from the URL
      let filePath = file.url
      
      // Remove /uploads/ prefix if present
      if (filePath.startsWith('/uploads/')) {
        filePath = filePath.substring(9)
      } else if (filePath.startsWith('/')) {
        filePath = filePath.substring(1)
      }
      
      // For S3 URLs, extract the path after the bucket name
      if (filePath.includes('amazonaws.com/')) {
        filePath = filePath.split('amazonaws.com/')[1]
      }
      
      const headers: Record<string, string> = {}
      if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`
      }
      
      const response = await fetch(`${widgetEnv.API_URL}/api/v1/files/upload/${filePath}`, {
        method: 'DELETE',
        headers: headers
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to delete file:', errorData.detail)
        // Optionally, show an error message to the user
      } else {
        console.log('File deleted successfully from backend.')
      }
    } catch (error) {
      console.error('Error calling delete API:', error)
    }
    
    // Revoke blob URLs to free memory
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
    if (file.file_url && file.file_url.startsWith('blob:')) {
      URL.revokeObjectURL(file.file_url)
    }
    
    uploadedAttachments.value.splice(index, 1)
  }

  // Open file preview modal
  const openPreview = (file: {
    url: string
    filename: string
    type: string
    file_url?: string
    size?: number
  }) => {
    previewFile.value = file
    previewModal.value = true
  }

  // Close preview modal
  const closePreview = () => {
    previewModal.value = false
    // Don't clear previewFile immediately to allow smooth transition
    setTimeout(() => {
      previewFile.value = null
    }, 300)
  }

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.value?.click()
  }

  // Check if file type is image (utility function)
  const isImage = (type: string): boolean => {
    return type.startsWith('image/')
  }

  return {
    uploadedAttachments,
    previewModal,
    previewFile,
    formatFileSize,
    isImageAttachment,
    getDownloadUrl,
    getPreviewUrl,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handlePaste,
    uploadFiles,
    removeAttachment,
    openPreview,
    closePreview,
    openFilePicker,
    isImage
  }
}
