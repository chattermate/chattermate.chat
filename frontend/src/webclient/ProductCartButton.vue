<!--
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
-->
<script setup lang="ts">
/** Adds a product to the store's cart from its card in the chat. */
import { computed } from 'vue'
import { addToCart, cartState, viewCart } from './shopify-cart'

const props = defineProps<{ variantId: string }>()
const state = computed(() => cartState(props.variantId))
</script>

<template>
  <div class="cm-cart">
    <button v-if="state.status === 'added'" type="button" class="cm-cart-button" @click="viewCart">
      View cart
    </button>
    <button
      v-else
      type="button"
      class="cm-cart-button"
      :disabled="state.status === 'adding'"
      @click="addToCart(variantId)"
    >{{ state.status === 'adding' ? 'Adding…' : 'Add to cart' }}</button>
    <p v-if="state.status === 'added'" class="cm-cart-note" role="status">Added to your cart</p>
    <p v-else-if="state.error" class="cm-cart-note cm-cart-error" role="alert">{{ state.error }}</p>
  </div>
</template>

<style scoped>
.cm-cart {
  width: 100%;
}

.cm-cart-button {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 16px;
  background: var(--cm-accent);
  color: var(--cm-on-accent);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
}

.cm-cart-button:hover:not(:disabled) {
  opacity: 0.9;
}

.cm-cart-button:disabled {
  opacity: 0.6;
  cursor: progress;
}

.cm-cart-button:focus-visible {
  outline: 2px solid var(--cm-accent);
  outline-offset: 2px;
}

.cm-cart-note {
  margin: 4px 0 0;
  color: var(--cm-muted);
  font-size: var(--text-xs);
  line-height: 1.3;
}

.cm-cart-error {
  color: var(--error-color);
}
</style>
