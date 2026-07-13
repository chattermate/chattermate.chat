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
import { computed } from 'vue'
import type { HelpCenterSettings } from '@/types/faq'
import { contrastInk } from '@/utils/color'

const props = defineProps<{ settings: HelpCenterSettings }>()

const brand = computed(() => props.settings.brand_color || '#4338CA')
const ink = computed(() => contrastInk(brand.value))

const address = computed(() => {
  const domain = props.settings.domain
  if (domain?.domain_status === 'verified' && domain.custom_domain) return domain.custom_domain
  return `${props.settings.slug || 'your-company'}.chattermate.help`
})

const rootStyle = computed(() => ({ '--hc-brand': brand.value, '--hc-ink': ink.value }))

// Hero tint from the brand color at low alpha (1F = ~12%).
const heroStyle = computed(() => ({
  background: `linear-gradient(180deg, ${brand.value}1F, #FFFFFF 92%)`,
}))
</script>

<template>
  <div class="preview" :style="rootStyle">
    <!-- browser chrome -->
    <div class="preview__chrome">
      <span class="preview__dot"></span><span class="preview__dot"></span><span class="preview__dot"></span>
      <div class="preview__address">{{ address }}</div>
    </div>
    <!-- site header -->
    <div class="preview__header">
      <div class="preview__brand">
        <img v-if="settings.logo_url" class="preview__logo-img" :src="settings.logo_url" alt="Logo" />
        <div v-else class="preview__logo-mark"><div class="preview__logo-diamond"></div></div>
        <span class="preview__brand-name">{{ settings.title || 'Your company' }}</span>
      </div>
      <div class="preview__nav">
        <span v-for="link in settings.header_links" :key="link.label" class="preview__nav-link">{{ link.label }}</span>
        <span v-if="settings.cta_enabled && settings.cta_text" class="preview__cta">{{ settings.cta_text }}</span>
      </div>
    </div>
    <!-- hero -->
    <div class="preview__hero" :style="heroStyle">
      <div class="preview__hero-title">How can we help?</div>
      <div class="preview__search">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#9AA0AD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <span class="preview__search-hint">Search for answers…</span>
        <span class="preview__search-btn">Search</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* This component simulates the visitor-facing help center, an external
   light-mode website — the fixed light palette below is deliberate and must
   NOT follow the admin app's theme tokens. */
.preview {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--o10);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.28);
}

.preview__chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 13px;
  background: #ebedf1;
  border-bottom: 1px solid #dde0e7;
}

.preview__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #c6cad3;
}

.preview__address {
  margin-left: 9px;
  flex: 1;
  height: 20px;
  border-radius: 6px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 11px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #9aa0ad;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  background: #ffffff;
  border-bottom: 1px solid #ecedf2;
}

.preview__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.preview__logo-img {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
}

.preview__logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hc-brand);
}

.preview__logo-diamond {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  background: var(--hc-ink);
  transform: rotate(45deg);
}

.preview__brand-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  color: #1a1b25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview__nav {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.preview__nav-link {
  font-size: 12.5px;
  color: #5a6172;
  white-space: nowrap;
}

.preview__cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--hc-brand);
  color: var(--hc-ink);
}

.preview__hero {
  padding: 22px 20px 20px;
}

.preview__hero-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  color: #1a1b25;
  text-align: center;
  margin-bottom: 13px;
}

.preview__search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e4e6ec;
  border-radius: 11px;
  padding: 5px 5px 5px 13px;
  max-width: 340px;
  margin: 0 auto;
  box-shadow: 0 8px 20px rgba(40, 36, 90, 0.08);
}

.preview__search svg {
  flex-shrink: 0;
}

.preview__search-hint {
  flex: 1;
  font-size: 12.5px;
  color: #9aa0ad;
}

.preview__search-btn {
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--hc-brand);
  color: var(--hc-ink);
}
</style>
