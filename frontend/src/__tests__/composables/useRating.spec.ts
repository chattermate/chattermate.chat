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

import { describe, it, expect, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { useRating, type RatingMessage } from '@/composables/useRating'

const setup = (messageList: RatingMessage[] = [{ message_type: 'rating' }]) => {
    const messages = ref<RatingMessage[]>(messageList)
    const submitRating = vi.fn().mockResolvedValue(undefined)
    return { messages, submitRating, ...useRating({ messages, submitRating }) }
}

describe('useRating', () => {
    afterEach(() => vi.restoreAllMocks())

    it('picking a star opens the feedback and remembers the pick', async () => {
        const rating = setup()
        await rating.handleStarClick(4)
        expect(rating.hoverRating.value).toBe(4)
        expect(rating.messages.value[0]).toMatchObject({ showFeedback: true, selectedRating: 4 })
    })

    it('leaving the stars falls back to the picked star', async () => {
        const rating = setup()
        await rating.handleStarClick(4)
        rating.handleStarHover(2)
        rating.handleStarLeave()
        expect(rating.hoverRating.value).toBe(4)
    })

    it('submitting marks the rating message as answered', async () => {
        const rating = setup()
        await rating.handleSubmitRating('s-1', 5, 'great')
        expect(rating.submitRating).toHaveBeenCalledWith(5, 'great')
        expect(rating.messages.value[0]).toMatchObject({ isSubmitted: true, finalRating: 5, finalFeedback: 'great' })
        expect(rating.isSubmittingRating.value).toBe(false)
    })

    it('leaves the rating open when the submit fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const rating = setup()
        rating.submitRating.mockRejectedValue(new Error('socket closed'))
        await rating.handleSubmitRating('s-1', 3, null)
        expect(rating.messages.value[0].isSubmitted).toBeUndefined()
        expect(rating.messages.value[0].finalRating).toBeUndefined()
        expect(rating.isSubmittingRating.value).toBe(false)
    })

    it('ignores hovering and clicking the stars while a rating is being sent', async () => {
        let finish: (value: unknown) => void = () => {}
        const rating = setup()
        await rating.handleStarClick(4)
        rating.submitRating.mockImplementation(() => new Promise(resolve => { finish = resolve }))

        const sending = rating.handleSubmitRating('s-1', 4)
        expect(rating.isSubmittingRating.value).toBe(true)

        rating.handleStarHover(1)
        expect(rating.hoverRating.value).toBe(4)
        await rating.handleStarClick(2)
        expect(rating.hoverRating.value).toBe(4)
        expect(rating.messages.value[0].selectedRating).toBe(4)

        finish(undefined)
        await sending
        expect(rating.isSubmittingRating.value).toBe(false)
    })

    it('a star click only highlights when the last message is not the rating prompt', async () => {
        const rating = setup([{ message_type: 'rating' }, { message_type: 'bot' }])
        await rating.handleStarClick(5)
        expect(rating.hoverRating.value).toBe(5)
        expect(rating.messages.value[0].showFeedback).toBeUndefined()
        expect(rating.messages.value[1].showFeedback).toBeUndefined()
        expect(rating.messages.value[1].selectedRating).toBeUndefined()
    })
})
