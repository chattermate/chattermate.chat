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


import { ref, watch, type WatchSource } from 'vue'

/**
 * For an <img> with a stand-in: failed turns true when the image won't load
 * (bind onError to @error), and false again whenever the source changes.
 */
export function useImageFallback(source: WatchSource<string | null | undefined>) {
    const failed = ref(false)
    watch(source, () => { failed.value = false })
    const onError = () => { failed.value = true }
    return { failed, onError }
}
