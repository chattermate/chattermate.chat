<!--
ChatterMate - Agent Performance Component
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

<template>
  <div class="agent-performance-container">
    <div v-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else-if="isLoading" class="loading-state">
      Loading agent performance data...
    </div>

    <div v-else class="agent-performance-tabs">
      <div class="tab-buttons">
        <button 
          :class="{ active: activeTab === 'bot' }"
          @click="activeTab = 'bot'"
        >
          Bot Agents
        </button>
        <button 
          :class="{ active: activeTab === 'human' }"
          @click="activeTab = 'human'"
        >
          Human Agents
        </button>
      </div>

      <div class="tab-content">
        <!-- Bot Agents Tab -->
        <div v-if="activeTab === 'bot'" class="agents-table-container">
          <div v-if="!performanceData?.bot_agents?.length" class="no-data">
            No bot agent data available
          </div>
          <table v-else class="agents-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Total Chats</th>
                <th>Closed Chats</th>
                <th>Closure Rate</th>
                <th>Avg. Rating</th>
                <th>Rating Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="agent in performanceData.bot_agents" :key="agent.id">
                <td>{{ agent.name }}</td>
                <td>{{ agent.total_chats }}</td>
                <td>{{ agent.closed_chats }}</td>
                <td>{{ calculateClosureRate(agent.closed_chats, agent.total_chats) }}%</td>
                <td>
                  <div class="rating-display">
                    <span class="stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" 
                         :class="{ filled: n <= Math.round(agent.avg_rating) }"></i>
                    </span>
                    <span class="rating-value">{{ agent.avg_rating.toFixed(1) }}</span>
                  </div>
                </td>
                <td>{{ agent.rating_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Human Agents Tab -->
        <div v-if="activeTab === 'human'" class="agents-table-container">
          <div v-if="!performanceData?.human_agents?.length" class="no-data">
            No human agent data available
          </div>
          <table v-else class="agents-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Total Chats</th>
                <th>Closed Chats</th>
                <th>Closure Rate</th>
                <th>Avg. Rating</th>
                <th>Rating Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="agent in performanceData.human_agents" :key="agent.id">
                <td>{{ agent.name }}</td>
                <td>{{ agent.total_chats }}</td>
                <td>{{ agent.closed_chats }}</td>
                <td>{{ calculateClosureRate(agent.closed_chats, agent.total_chats) }}%</td>
                <td>
                  <div class="rating-display">
                    <span class="stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" 
                         :class="{ filled: n <= Math.round(agent.avg_rating) }"></i>
                    </span>
                    <span class="rating-value">{{ agent.avg_rating.toFixed(1) }}</span>
                  </div>
                </td>
                <td>{{ agent.rating_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'

interface AgentData {
  id: string
  name: string
  total_chats: number
  closed_chats: number
  avg_rating: number
  rating_count: number
}

interface PerformanceData {
  bot_agents: AgentData[]
  human_agents: AgentData[]
  time_range: string
}

const props = defineProps<{
  timeRange: string
}>()

const emit = defineEmits<{
  (e: 'time-range-change', range: string): void
}>()

const isLoading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref('bot')
const performanceData = ref<PerformanceData | null>(null)

const calculateClosureRate = (closed: number, total: number): string => {
  if (!total) return '0.0'
  return ((closed / total) * 100).toFixed(1)
}

const fetchPerformanceData = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await api.get('/analytics/agent-performance', {
      params: { time_range: props.timeRange }
    })
    performanceData.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to fetch agent performance data'
  } finally {
    isLoading.value = false
  }
}

// Watch for time range changes from parent
watch(() => props.timeRange, (newRange) => {
  fetchPerformanceData()
})

onMounted(() => {
  fetchPerformanceData()
})
</script>

<style scoped>
.agent-performance-container {
  padding: var(--space-lg);
}

.agent-performance-tabs {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab-buttons button {
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-md);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  position: relative;
}

.tab-buttons button.active {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-buttons button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-solid);
}

.tab-content {
  padding: var(--space-lg);
}

.agents-table-container {
  overflow-x: auto;
}

.agents-table {
  width: 100%;
  border-collapse: collapse;
}

.agents-table th,
.agents-table td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.agents-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.agents-table td {
  font-size: var(--text-md);
}

.rating-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.stars i.filled {
  color: #FFD700;
}

.rating-value {
  font-weight: 600;
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