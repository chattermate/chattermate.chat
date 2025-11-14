/**
 * ChatterMate - Conversation File Handling Composable
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
import type { ChatDetail } from '@/types/chat'
import FileUpload from '@/components/common/FileUpload.vue'

export function useConversationFiles(
  currentChat: Ref<ChatDetail>,
  newMessage: Ref<string>,
  canSendMessage: Ref<boolean>,
  scrollToBottom: () => void
) {
  // File upload refs
  const fileUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)
  const uploadedFiles = ref<Array<{content: string, filename: string, content_type: string, size: number}>>([])

  // Handle file uploads
  const handleFilesUploaded = (files: Array<{content: string, filename: string, content_type: string, size: number}>) => {
    uploadedFiles.value = files
  }

  const handleFileUploadError = (error: string) => {
    console.error('File upload error:', error)
  }

  // Handle paste events for screenshots
  const handleChatPaste = (event: ClipboardEvent) => {
    if (fileUploadRef.value) {
      fileUploadRef.value.handlePaste(event)
    }
  }

  // Wrapper to send message with attachments
  const handleSendMessageWithAttachments = async () => {
    if (!newMessage.value.trim() && uploadedFiles.value.length === 0) return
    if (!canSendMessage.value) return

    try {
      const messageText = newMessage.value
      const socketService = (await import('@/services/socket')).socketService
      
      // Clear input immediately for better UX
      newMessage.value = ''
      
      // Add message locally first
      const timestamp = new Date().toISOString()
      const localMessage: any = {
        message: messageText,
        message_type: 'agent',
        created_at: timestamp,
        session_id: currentChat.value.session_id
      }
      
      // Add temporary attachments for immediate display
      if (uploadedFiles.value.length > 0) {
        localMessage.attachments = uploadedFiles.value.map((file, idx) => {
          // Create temporary blob URL for images
          let tempUrl = ''
          if (file.content_type.startsWith('image/')) {
            // Convert base64 to blob URL for immediate display
            const byteCharacters = atob(file.content)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: file.content_type })
            tempUrl = URL.createObjectURL(blob)
          }
          
          return {
            id: Date.now() * 1000 + idx, // Temporary ID
            filename: file.filename,
            file_url: tempUrl, // Temporary blob URL
            content_type: file.content_type,
            file_size: file.size,
            _isTemporary: true // Flag to identify temporary attachments
          }
        })
      }
      
      // Update chat with new message
      currentChat.value.messages.push(localMessage)
      currentChat.value.updated_at = timestamp
      
      // Prepare files for upload (if any)
      const files = uploadedFiles.value.map(f => ({
        content: f.content,
        filename: f.filename,
        content_type: f.content_type,
        size: f.size
      }))
      
      // Emit message with files through socket
      socketService.emit('agent_message', {
        message: messageText,
        session_id: currentChat.value.session_id,
        message_type: 'agent',
        created_at: timestamp,
        files: files  // Send files with the message
      })
      
      scrollToBottom()
      
      // Clear uploaded files after sending
      if (uploadedFiles.value.length > 0) {
        if (fileUploadRef.value) {
          fileUploadRef.value.clearFiles()
        }
        uploadedFiles.value = []
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Check if attachment is an image
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
    
    // If it's already a full URL (AWS S3), return as-is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl
    }
    
    // For local storage, construct the download URL
    // fileUrl format: "/uploads/chat_attachments/org-id/filename.jpg"
    const apiUrl = import.meta.env.VITE_API_URL || ''
    
    // If fileUrl already starts with /api/v1/files/download, use as-is
    if (fileUrl.startsWith('/api/v1/files/download/')) {
      return `${apiUrl}${fileUrl}`
    }
    
    // Remove /uploads/ prefix if present and construct download URL
    const cleanUrl = fileUrl.startsWith('/uploads/') 
                     ? fileUrl.replace('/uploads/', '') 
                     : fileUrl.replace('/', '')
    return `${apiUrl}/files/download/${cleanUrl}`
  }

  // Generate image URL for attachments
  const getImageUrl = (fileUrl: string | undefined | null): string => {
    if (!fileUrl) return ''
    
    // If it's a blob URL (temporary), return as-is
    if (fileUrl.startsWith('blob:')) {
      return fileUrl
    }
    
    // If it's already a full URL (AWS S3), return as-is
    if (fileUrl.includes('amazonaws.com')) {
      return fileUrl
    }
    
    // Remove /api/v1 prefix if present and construct full URL
    const cleanUrl = fileUrl.replace('/api/v1', '')
    const apiUrl = import.meta.env.VITE_API_URL || ''
    return `${apiUrl}${cleanUrl}`
  }

  return {
    fileUploadRef,
    uploadedFiles,
    handleFilesUploaded,
    handleFileUploadError,
    handleChatPaste,
    handleSendMessageWithAttachments,
    formatFileSize,
    isImageAttachment,
    getDownloadUrl,
    getImageUrl
  }
}
