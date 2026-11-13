/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ref, type Ref } from 'vue'

/** The fields the rating flow reads and writes on a chat message. */
export interface RatingMessage {
    message_type?: string
    attributes?: Record<string, any>
    showFeedback?: boolean
    selectedRating?: number
    isSubmitted?: boolean
    finalRating?: number
    finalFeedback?: string | null
}

export interface RatingOptions {
    messages: Ref<RatingMessage[]>
    /** Sends the rating for the current session over the socket. */
    submitRating: (rating: number, feedback?: string | null) => Promise<unknown>
}

const lastOf = <T>(items: T[]): T | undefined => items[items.length - 1]

/**
 * The end-of-chat star rating: hover, pick, submit. The rating prompt itself is a
 * `rating` message in the chat; this keeps the hover state and marks the message
 * as answered once the socket accepts it.
 */
export function useRating({ messages, submitRating }: RatingOptions) {
    const hoverRating = ref(0)
    const isSubmittingRating = ref(false)


    const handleStarHover = (rating: number) => {
        if (!isSubmittingRating.value) {
            hoverRating.value = rating
        }
    }

    const handleStarLeave = () => {
        if (!isSubmittingRating.value) {
            hoverRating.value = lastOf(messages.value)?.selectedRating || 0
        }
    }

    const handleStarClick = async (rating: number) => {
        if (!isSubmittingRating.value) {
            hoverRating.value = rating
            // Show feedback input after rating selection
            const lastMessage = lastOf(messages.value)
            if (lastMessage && lastMessage.message_type === 'rating') {
                lastMessage.showFeedback = true
                lastMessage.selectedRating = rating
            }
        }
    }

    // One rating at a time: a second press that lands before the button disables
    // (a same-tick double click) is ignored, not sent twice.
    const handleSubmitRating = async (_sessionId: string, rating: number, feedback: string | null = null) => {
        if (isSubmittingRating.value) return
        try {
            isSubmittingRating.value = true
            await submitRating(rating, feedback)

            // Mark the rating message as submitted instead of removing it.
            const ratingMessage = messages.value.find(msg => msg.message_type === 'rating')
            if (ratingMessage) {
                ratingMessage.isSubmitted = true
                ratingMessage.finalRating = rating
                ratingMessage.finalFeedback = feedback
            }
        } catch (error) {
            console.error('Failed to submit rating:', error)
        } finally {
            isSubmittingRating.value = false
        }
    }

    return {
        hoverRating,
        isSubmittingRating,
        handleStarHover,
        handleStarLeave,
        handleStarClick,
        handleSubmitRating,
    }
}
