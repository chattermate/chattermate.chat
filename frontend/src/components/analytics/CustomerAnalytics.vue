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

<template>
  <div class="customer-analytics-container">
    <div v-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else-if="isLoading" class="loading-state">
      Loading customer analytics data...
    </div>

    <div v-else class="customer-analytics-content">
      <!-- Customer Table -->
      <div class="customers-table-container">
        <div v-if="!customerData?.customers?.length" class="no-data">
          No customer data available
        </div>
        <table v-else class="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Total Chats</th>
              <th>Last Interaction</th>
              <th>Avg. Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in paginatedCustomers" :key="customer.id">
              <td>
                <div class="customer-info">
                  <span class="customer-name">{{ customer.full_name || 'Anonymous' }}</span>
                  <span class="customer-email">{{ customer.email }}</span>
                </div>
              </td>
              <td>{{ customer.total_chats }}</td>
              <td>{{ formatDate(customer.last_interaction) }}</td>
              <td>
                <div class="rating-display">
                  <span class="stars">
                    <svg v-for="n in 5" :key="n" class="star-icon" :class="{ filled: n <= Math.round(customer.avg_rating) }" 
                      xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </span>
                  <span class="rating-value">{{ customer.avg_rating.toFixed(1) }}</span>
                </div>
              </td>
              <td>
                <button 
                  class="view-details-btn"
                  @click="showCustomerDetails(customer)"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination Controls -->
        <div v-if="customerData?.customers?.length" class="pagination-controls">
          <div class="pagination-summary">
            <span class="total-items">{{ customerData.pagination.total_count }} customers</span>
          </div>
          
          <div class="pagination-buttons">
            <button 
              class="pagination-btn first-page" 
              :disabled="currentPage === 1"
              @click="goToPage(1)"
              title="First Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </button>
            
            <button 
              class="pagination-btn" 
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
              title="Previous Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <div class="page-indicator">
              <div class="page-input-container">
                <input 
                  type="number" 
                  class="page-input" 
                  :value="currentPage"
                  min="1"
                  :max="totalPages"
                  @change="handlePageInputChange($event)"
                />
                <span class="page-separator">of</span>
                <span class="total-pages">{{ totalPages }}</span>
              </div>
            </div>
            
            <button 
              class="pagination-btn" 
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
              title="Next Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            
            <button 
              class="pagination-btn last-page" 
              :disabled="currentPage === totalPages"
              @click="goToPage(totalPages)"
              title="Last Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </div>
          
          <div class="pagination-size">
            <select 
              class="page-size-select" 
              :value="itemsPerPage" 
              @change="handlePageSizeChange($event)"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <!-- Customer Details Modal -->
      <div v-if="selectedCustomer" class="customer-details-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Customer Details</h3>
            <button class="close-btn" @click="selectedCustomer = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="customer-profile">
              <h4>{{ selectedCustomer.full_name || 'Anonymous' }}</h4>
              <p class="customer-email">{{ selectedCustomer.email }}</p>
              <div class="customer-stats">
                <div class="stat-item">
                  <span class="stat-label">Total Chats:</span>
                  <span class="stat-value">{{ selectedCustomer.total_chats }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Rating:</span>
                  <div class="rating-display">
                    <span class="stars">
                      <svg v-for="n in 5" :key="n" class="star-icon" :class="{ filled: n <= Math.round(selectedCustomer.avg_rating) }"
                        xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </span>
                    <span class="rating-value">{{ selectedCustomer.avg_rating.toFixed(1) }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Last Interaction:</span>
                  <span class="stat-value">{{ formatDate(selectedCustomer.last_interaction) }}</span>
                </div>
              </div>
            </div>

            <div class="feedback-section">
              <h4>Interaction History & Feedback</h4>
              <div v-if="!selectedCustomer.feedback || !selectedCustomer.feedback.length" class="no-data">
                No feedback or rating history available
              </div>
              <div v-else class="feedback-list">
                <div v-for="(item, index) in selectedCustomer.feedback" :key="index" class="feedback-item">
                  <div class="feedback-header">
                    <div class="feedback-date-agent">
                      <span class="feedback-date">{{ formatDate(item.created_at) }}</span>
                      <span class="agent-info">
                        Handled by: <span class="agent-name">{{ item.agent_name || 'AI Bot' }}</span>
                      </span>
                    </div>
                    <div class="rating-display">
                      <span class="stars">
                        <svg v-for="n in 5" :key="n" class="star-icon" :class="{ filled: n <= item.rating }"
                          xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </span>
                      <span class="rating-value">{{ item.rating.toFixed(1) }}</span>
                    </div>
                  </div>
                  <div v-if="item.feedback" class="feedback-content">
                    <h5 class="feedback-label">Customer Feedback:</h5>
                    <p class="feedback-text">{{ item.feedback }}</p>
                  </div>
                  <div v-else class="feedback-content no-comment">
                    <p class="feedback-text">No comment provided</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import api from '@/services/api'

interface CustomerFeedback {
  rating: number
  feedback: string | null
  created_at: string
  agent_name: string | null
}

interface CustomerData {
  id: string
  email: string
  full_name: string | null
  total_chats: number
  last_interaction: string
  avg_rating: number
  rating_count: number
  feedback?: CustomerFeedback[]
}

interface PaginationData {
  page: number
  page_size: number
  total_count: number
  total_pages: number
}

interface CustomerAnalyticsData {
  customers: CustomerData[]
  time_range: string
  pagination: PaginationData
}

const props = defineProps<{
  timeRange: string
}>()

const isLoading = ref(true)
const error = ref<string | null>(null)
const customerData = ref<CustomerAnalyticsData | null>(null)
const selectedCustomer = ref<CustomerData | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const totalPages = computed(() => {
  if (!customerData.value?.pagination) return 1
  return customerData.value.pagination.total_pages
})

// Use the customers directly from the API response
const paginatedCustomers = computed(() => {
  if (!customerData.value?.customers) return []
  return customerData.value.customers
})

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString()
}

const fetchCustomerData = async (page = currentPage.value) => {
  try {
    isLoading.value = true
    error.value = null
    const response = await api.get('/analytics/customer-analytics', {
      params: { 
        time_range: props.timeRange,
        page: page,
        page_size: itemsPerPage.value
      }
    })
    customerData.value = response.data
    currentPage.value = response.data.pagination.page
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to fetch customer analytics data'
  } finally {
    isLoading.value = false
  }
}

const showCustomerDetails = async (customer: CustomerData) => {
  try {
    const response = await api.get(`/analytics/customer-details/${customer.id}`, {
      params: { time_range: props.timeRange }
    })
    selectedCustomer.value = {
      ...customer,
      feedback: response.data.feedback
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to fetch customer details'
  }
}

// Handle page changes
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  fetchCustomerData(page)
}

// Watch for time range changes from parent
watch(() => props.timeRange, (newRange) => {
  // Reset to page 1 when time range changes
  fetchCustomerData(1)
})

const handlePageInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const page = parseInt(input.value)
  if (page >= 1 && page <= totalPages.value) {
    goToPage(page)
  } else {
    // Reset to current page if invalid input
    input.value = currentPage.value.toString()
  }
}

const handlePageSizeChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const newSize = parseInt(select.value)
  if (newSize !== itemsPerPage.value) {
    itemsPerPage.value = newSize
    // Reset to page 1 when changing page size
    fetchCustomerData(1)
  }
}

onMounted(() => {
  fetchCustomerData()
})
</script>

<style scoped>
:root {
  --primary-color-rgb: 59, 130, 246; /* Default blue color - should match your primary color */
}

.customer-analytics-container {
  padding: var(--space-lg);
}

.customer-analytics-content {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.customers-table-container {
  overflow-x: auto;
  padding: var(--space-lg);
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th,
.customers-table td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.customers-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.customers-table td {
  font-size: var(--text-md);
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
}

.customer-email {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.rating-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.rating-display.small .stars i {
  font-size: var(--text-xs);
}

.stars {
  display: flex;
  gap: 2px;
}

.star-icon {
  color: var(--text-muted);
  stroke-width: 1;
  width: 14px;
  height: 14px;
}

.star-icon.filled {
  color: #FFD700;
  fill: #FFD700;
  stroke: #FFD700;
}

/* Add specific styles for the star SVGs */
.stars svg {
  display: block;
}

.rating-value {
  font-weight: 600;
}

.view-details-btn {
  background-color: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.view-details-btn:hover {
  background-color: var(--accent-solid);
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-color);
  background-color: var(--background-soft);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.pagination-btn.first-page:hover:not(:disabled) i,
.pagination-btn.last-page:hover:not(:disabled) i {
  animation: pulse 0.5s ease-in-out;
}

.page-input:focus {
  animation: pulse 0.5s ease-in-out;
}

.pagination-summary {
  font-weight: 500;
}

.total-items {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  background-color: var(--background-mute);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.pagination-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--accent-solid);
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: var(--radius-full);
  z-index: 0;
}

.pagination-btn i {
  position: relative;
  z-index: 1;
}

.pagination-btn:hover:not(:disabled)::before {
  opacity: 0.1;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.pagination-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  margin: 0 var(--space-sm);
  display: flex;
  align-items: center;
}

.page-input-container {
  display: flex;
  align-items: center;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 var(--space-sm);
  height: 36px;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}

.page-input-container:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.page-input {
  width: 40px;
  border: none;
  background: transparent;
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-primary);
  padding: 0;
  -moz-appearance: textfield;
  outline: none;
}

.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-separator {
  margin: 0 var(--space-xs);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.total-pages {
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--text-sm);
  min-width: 20px;
  text-align: center;
}

.pagination-size {
  position: relative;
}

.page-size-select {
  appearance: none;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 var(--space-xl) 0 var(--space-sm);
  height: 36px;
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}

.page-size-select:hover {
  border-color: var(--primary-color-light);
}

.page-size-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.dropdown-icon {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.pagination-size:hover .dropdown-icon {
  color: var(--primary-color);
}

/* Remove the old Font Awesome after pseudo-element */
.pagination-size::after {
  content: none;
}

.customer-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--background-color);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--text-xl);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--text-xl);
  cursor: pointer;
  color: var(--text-muted);
}

.modal-body {
  padding: var(--space-lg);
}

.customer-profile {
  margin-bottom: var(--space-xl);
}

.customer-profile h4 {
  margin: 0 0 var(--space-xs);
  font-size: var(--text-lg);
}

.customer-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.stat-value {
  font-weight: 500;
}

.feedback-section {
  margin-top: var(--space-xl);
}

.feedback-section h4 {
  margin: 0 0 var(--space-md);
  font-size: var(--text-lg);
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.feedback-item {
  background: var(--background-soft);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
  margin-bottom: var(--space-md);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color-light);
}

.feedback-date-agent {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.feedback-date {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.agent-info {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.agent-name {
  font-weight: 500;
}

.feedback-content {
  padding: var(--space-sm) 0;
}

.feedback-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 var(--space-xs);
}

.feedback-text {
  margin: 0;
  font-size: var(--text-md);
  line-height: 1.5;
}

.no-comment .feedback-text {
  font-style: italic;
  color: var(--text-muted);
}

.feedback-meta {
  display: none; /* Hide the old meta section */
}

.error-state {
  background-color: var(--error-color);
  color: white;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-secondary);
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-size: var(--text-md);
}
</style> 