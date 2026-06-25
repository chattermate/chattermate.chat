<!--
ChatterMate - Conversation Filters
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface FilterValues {
  customerEmailFilter: string
  agentFilter: string
  userFilter: string
  dateFromFilter: string
  dateToFilter: string
}

interface Props {
  showFilters: boolean
  filterValues: FilterValues
  users: Array<{id: string, full_name: string, email: string}>
  agents: Array<{id: string, name: string, display_name: string | null}>
  loadingUsers?: boolean
  loadingAgents?: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'apply', filters: FilterValues): void
  (e: 'clear'): void
  (e: 'update:filterValues', filters: FilterValues): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local filter state
const localFilters = ref<FilterValues>({ ...props.filterValues })

// Update local filters when props change
const updateLocalFilters = () => {
  localFilters.value = { ...props.filterValues }
}

// Watch for prop changes
onMounted(() => {
  updateLocalFilters()
})

const hasActiveFilters = computed(() => {
  return localFilters.value.customerEmailFilter.trim() || 
         localFilters.value.agentFilter.trim() || 
         localFilters.value.userFilter.trim() || 
         localFilters.value.dateFromFilter || 
         localFilters.value.dateToFilter
})

const activeFilterCount = computed(() => {
  return Object.values({
    customerEmailFilter: localFilters.value.customerEmailFilter.trim(),
    agentFilter: localFilters.value.agentFilter.trim(),
    userFilter: localFilters.value.userFilter.trim(),
    dateFromFilter: localFilters.value.dateFromFilter,
    dateToFilter: localFilters.value.dateToFilter
  }).filter(Boolean).length
})

const applyFilters = () => {
  emit('update:filterValues', { ...localFilters.value })
  emit('apply', { ...localFilters.value })
}

const clearFilters = () => {
  localFilters.value = {
    customerEmailFilter: '',
    agentFilter: '',
    userFilter: '',
    dateFromFilter: '',
    dateToFilter: ''
  }
  emit('update:filterValues', { ...localFilters.value })
  emit('clear')
}

// Click outside handler
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const filtersContainer = document.querySelector('.filters-container')
  const filterToggleBtn = document.querySelector('.filter-toggle-btn')
  
  if (props.showFilters && 
      filtersContainer && 
      !filtersContainer.contains(target) && 
      filterToggleBtn && 
      !filterToggleBtn.contains(target)) {
    emit('toggle')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="filter-header-section">
    <!-- Filter Toggle Button -->
    <button 
      @click="emit('toggle')" 
      class="filter-toggle-btn"
      :class="{ active: showFilters, 'has-filters': hasActiveFilters }"
      aria-label="Toggle filters"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      <span v-if="hasActiveFilters" class="filter-count">{{ activeFilterCount }}</span>
    </button>
    
    <!-- Advanced Filters Dropdown -->
    <div v-if="showFilters" class="filters-container">
      <div class="filters-dropdown">
        <div class="filters-header">
          <h3>Filter Conversations</h3>
          <button @click="emit('toggle')" class="close-btn" aria-label="Close filters">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="filters-grid">
          <div class="filter-group">
            <label for="customer-email">Customer Email</label>
            <input 
              id="customer-email"
              v-model="localFilters.customerEmailFilter" 
              type="email" 
              placeholder="Filter by customer email..."
              class="filter-input"
            />
          </div>
          
          <div class="filter-group">
            <label for="agent-filter">Agent</label>
            <select 
              id="agent-filter"
              v-model="localFilters.agentFilter" 
              class="filter-input filter-select"
              :disabled="loadingAgents"
            >
              <option value="">All Agents</option>
              <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                {{ agent.display_name || agent.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="user-filter">User</label>
            <select 
              id="user-filter"
              v-model="localFilters.userFilter" 
              class="filter-input filter-select"
              :disabled="loadingUsers"
            >
              <option value="">All Users</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.full_name }} ({{ user.email }})
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="date-from">From Date</label>
            <input 
              id="date-from"
              v-model="localFilters.dateFromFilter" 
              type="date" 
              class="filter-input"
            />
          </div>
          
          <div class="filter-group">
            <label for="date-to">To Date</label>
            <input 
              id="date-to"
              v-model="localFilters.dateToFilter" 
              type="date" 
              class="filter-input"
            />
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="applyFilters" class="apply-btn">Apply Filters</button>
          <button @click="clearFilters" class="clear-btn">Clear All</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-header-section {
  position: relative;
}

.filter-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-toggle-btn:hover {
  background: var(--background-soft);
  color: var(--text-primary);
  border-color: var(--primary-color-soft);
}

.filter-toggle-btn.active {
  background: var(--primary-color);
  color: #0B0C10;
  border-color: var(--primary-color);
}

.filter-toggle-btn.has-filters {
  background: var(--primary-color-soft);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.filter-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--error-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.filters-container {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.2s ease-out;
  min-width: 600px;
  max-width: 90vw;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filters-dropdown {
  padding: var(--space-lg);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.filters-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--background-color);
  color: var(--text-primary);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--background-color);
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--transition-fast);
}

.filter-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
}

.filter-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-soft);
}

.filter-input::placeholder {
  color: var(--text-muted);
}

.filter-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.apply-btn, .clear-btn {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  min-width: 100px;
}

.apply-btn {
  background: var(--primary-color);
  color: #0B0C10;
}

.apply-btn:hover {
  background: var(--primary-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clear-btn {
  background: var(--background-color);
  color: var(--text-muted);
  border-color: var(--border-color);
}

.clear-btn:hover {
  background: var(--background-soft);
  color: var(--text-primary);
  border-color: var(--text-muted);
}

/* Responsive design */
@media (max-width: 768px) {
  .filters-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    min-width: unset;
    max-width: unset;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .filters-dropdown {
    background: var(--background-color);
    border-radius: var(--radius-lg);
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    justify-content: stretch;
  }
  
  .apply-btn, .clear-btn {
    flex: 1;
  }
}
</style>
