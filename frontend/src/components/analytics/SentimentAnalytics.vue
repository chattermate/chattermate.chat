<!--
ChatterMate - Sentiment Analytics Component
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
  <div class="sentiment-analytics-container">
    <div v-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else-if="isLoading" class="loading-state">
      Loading sentiment analytics data...
    </div>

    <div v-else-if="!sentimentData?.total_analyzed" class="no-data">
      No sentiment data available for the selected period
    </div>

    <div v-else class="sentiment-analytics-content">
      <!-- Summary Cards -->
      <div class="metrics-overview">
        <div class="metric-card">
          <h3>Messages Analyzed</h3>
          <div class="metric-value">{{ sentimentData.total_analyzed }}</div>
        </div>
        <div class="metric-card">
          <h3>Average Sentiment</h3>
          <div class="metric-value">
            {{ sentimentData.avg_score.toFixed(2) }}
            <span class="change" :class="{ positive: sentimentData.score_change >= 0 }">
              {{ sentimentData.score_change >= 0 ? '+' : '' }}{{ sentimentData.score_change.toFixed(1) }}%
              <i :class="sentimentData.score_trend === 'up' ? 'trend-up' : 'trend-down'"></i>
            </span>
          </div>
          <div class="metric-sub">{{ scoreLabel(sentimentData.avg_score) }}</div>
        </div>
        <div class="metric-card">
          <h3>Positive</h3>
          <div class="metric-value positive-text">{{ sentimentData.distribution.positive }}</div>
          <div class="metric-sub">{{ percentOf(sentimentData.distribution.positive) }}% of total</div>
        </div>
        <div class="metric-card">
          <h3>Negative</h3>
          <div class="metric-value negative-text">{{ sentimentData.distribution.negative }}</div>
          <div class="metric-sub">{{ percentOf(sentimentData.distribution.negative) }}% of total</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="chart-container">
          <h3>Sentiment Distribution</h3>
          <div v-if="!hasDistribution" class="no-data">
            No distribution data available
          </div>
          <apexchart
            v-else
            type="donut"
            height="300"
            :options="distributionOptions"
            :series="distributionSeries"
          />
        </div>

        <div class="chart-container">
          <h3>Sentiment Trend Over Time</h3>
          <div v-if="!sentimentData.trend?.data?.length" class="no-data">
            No trend data available
          </div>
          <apexchart
            v-else
            type="area"
            height="300"
            :options="trendOptions"
            :series="trendSeries"
          />
        </div>
      </div>

      <!-- Negative Sessions Needing Attention -->
      <div class="negative-sessions-section">
        <h3>Sessions Needing Attention</h3>
        <div v-if="!sentimentData.negative_sessions?.length" class="no-data small">
          No negative sentiment sessions in this period 🎉
        </div>
        <table v-else class="sentiment-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Sentiment</th>
              <th>Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in sentimentData.negative_sessions" :key="session.session_id">
              <td>
                <router-link
                  class="session-link"
                  :to="{ name: 'conversations', query: { session: session.session_id, status: session.status } }"
                  title="Open conversation history"
                >
                  {{ shortId(session.session_id) }}
                </router-link>
              </td>
              <td>
                <span class="sentiment-badge" :class="session.sentiment_label">
                  {{ session.sentiment_label }}
                </span>
              </td>
              <td>{{ session.sentiment_score !== null ? session.sentiment_score.toFixed(2) : 'N/A' }}</td>
              <td><span class="status-text">{{ session.status }}</span></td>
              <td>
                <button class="view-details-btn" @click="showSessionDetails(session.session_id)">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Session Detail Modal -->
      <div v-if="selectedSession" class="session-details-modal" @click.self="selectedSession = null">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Session Sentiment Breakdown</h3>
            <button class="close-btn" @click="selectedSession = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="session-overall">
              <span class="overall-label">Overall:</span>
              <span class="sentiment-badge" :class="selectedSession.overall_sentiment.label || 'neutral'">
                {{ selectedSession.overall_sentiment.label || 'N/A' }}
              </span>
              <span v-if="selectedSession.overall_sentiment.score !== null" class="overall-score">
                ({{ selectedSession.overall_sentiment.score.toFixed(2) }})
              </span>
            </div>

            <div v-if="detailLoading" class="loading-state">Loading messages...</div>
            <div v-else-if="!selectedSession.messages?.length" class="no-data small">
              No analyzed customer messages in this session
            </div>
            <div v-else class="message-list">
              <div
                v-for="msg in selectedSession.messages"
                :key="msg.id"
                class="message-item"
                :class="msg.sentiment_label"
              >
                <div class="message-header">
                  <span class="sentiment-badge" :class="msg.sentiment_label">
                    {{ msg.sentiment_label }}
                  </span>
                  <span class="message-score">
                    {{ msg.sentiment_score !== null ? msg.sentiment_score.toFixed(2) : '' }}
                  </span>
                  <span class="message-date">{{ formatDate(msg.created_at) }}</span>
                </div>
                <p class="message-text">{{ msg.message || 'No content' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'

interface SentimentDistribution {
  positive: number
  neutral: number
  negative: number
}

interface SentimentTrend {
  data: number[]
  labels: string[]
  message_counts: number[]
}

interface NegativeSession {
  session_id: string
  sentiment_label: string
  sentiment_score: number | null
  status: string
}

interface SentimentData {
  distribution: SentimentDistribution
  total_analyzed: number
  avg_score: number
  score_change: number
  score_trend: 'up' | 'down'
  trend: SentimentTrend
  negative_sessions: NegativeSession[]
  time_range: string
}

interface SessionMessage {
  id: number
  message: string | null
  sentiment_label: string
  sentiment_score: number | null
  created_at: string
}

interface SessionDetail {
  session_id: string
  overall_sentiment: { label: string | null; score: number | null }
  messages: SessionMessage[]
}

const props = defineProps<{
  timeRange: string
}>()

const isLoading = ref(true)
const error = ref<string | null>(null)
const sentimentData = ref<SentimentData | null>(null)

const selectedSession = ref<SessionDetail | null>(null)
const detailLoading = ref(false)

// Theme-ish colors for the three sentiment classes
const COLOR_POSITIVE = '#16a34a'
const COLOR_NEUTRAL = '#9ca3af'
const COLOR_NEGATIVE = '#ef4444'

const hasDistribution = computed(() => {
  const d = sentimentData.value?.distribution
  return !!d && (d.positive + d.neutral + d.negative) > 0
})

const distributionSeries = computed(() => {
  const d = sentimentData.value?.distribution
  if (!d) return []
  return [d.positive, d.neutral, d.negative]
})

const distributionOptions = computed(() => ({
  chart: { type: 'donut', toolbar: { show: false } },
  labels: ['Positive', 'Neutral', 'Negative'],
  colors: [COLOR_POSITIVE, COLOR_NEUTRAL, COLOR_NEGATIVE],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(0)}%` },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: { show: true, label: 'Total', formatter: () => `${sentimentData.value?.total_analyzed || 0}` }
        }
      }
    }
  }
}))

const trendSeries = computed(() => {
  const t = sentimentData.value?.trend
  if (!t?.data) return []
  return [{
    name: 'Avg Sentiment',
    data: t.data.map((value, index) => ({
      x: new Date(t.labels[index]).getTime(),
      y: value
    }))
  }]
})

const trendOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
  colors: ['#6366f1'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { type: 'datetime' },
  yaxis: {
    min: -1,
    max: 1,
    tickAmount: 4,
    labels: { formatter: (val: number) => val.toFixed(1) }
  },
  annotations: {
    yaxis: [{ y: 0, borderColor: '#9ca3af', strokeDashArray: 4 }]
  },
  tooltip: { x: { format: 'MMM dd, yyyy' } }
}))

const percentOf = (count: number): string => {
  const total = sentimentData.value?.total_analyzed || 0
  if (!total) return '0'
  return ((count / total) * 100).toFixed(0)
}

const scoreLabel = (score: number): string => {
  if (score > 0.1) return 'Positive'
  if (score < -0.1) return 'Negative'
  return 'Neutral'
}

const shortId = (id: string): string => id.slice(0, 8)

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const fetchSentimentData = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await api.get('/analytics/sentiment', {
      params: { time_range: props.timeRange }
    })
    sentimentData.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to fetch sentiment analytics data'
  } finally {
    isLoading.value = false
  }
}

const showSessionDetails = async (sessionId: string) => {
  try {
    detailLoading.value = true
    selectedSession.value = {
      session_id: sessionId,
      overall_sentiment: { label: null, score: null },
      messages: []
    }
    const response = await api.get(`/analytics/session-sentiment/${sessionId}`)
    selectedSession.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to fetch session sentiment'
    selectedSession.value = null
  } finally {
    detailLoading.value = false
  }
}

watch(() => props.timeRange, () => {
  fetchSentimentData()
})

onMounted(() => {
  fetchSentimentData()
})
</script>

<style scoped>
.sentiment-analytics-container {
  padding: var(--space-lg);
}

.metrics-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.metric-card {
  background: var(--background-soft);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.metric-card h3 {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-sm);
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.metric-value.positive-text {
  color: #16a34a;
}

.metric-value.negative-text {
  color: #ef4444;
}

.metric-sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

.change {
  font-size: var(--text-sm);
  color: var(--error-color);
}

.change.positive {
  color: var(--success-color);
}

.trend-up, .trend-down {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 4px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}

.trend-up {
  border-bottom: 4px solid currentColor;
}

.trend-down {
  border-top: 4px solid currentColor;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.chart-container {
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  background: var(--background-soft);
}

.chart-container h3 {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}

.negative-sessions-section {
  background: var(--background-soft);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.negative-sessions-section h3 {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}

.sentiment-table {
  width: 100%;
  border-collapse: collapse;
}

.sentiment-table th,
.sentiment-table td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.sentiment-table th {
  font-weight: 600;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.sentiment-table td {
  font-size: var(--text-md);
}

.session-link {
  font-family: monospace;
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.session-link:hover {
  border-bottom-color: var(--primary-color);
}

.status-text {
  text-transform: capitalize;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.sentiment-badge {
  display: inline-block;
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: capitalize;
}

.sentiment-badge.positive {
  background-color: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.sentiment-badge.neutral {
  background-color: rgba(156, 163, 175, 0.18);
  color: #6b7280;
}

.sentiment-badge.negative {
  background-color: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.view-details-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.view-details-btn:hover {
  background-color: var(--accent-color);
}

/* Modal */
.session-details-modal {
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
  max-width: 700px;
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

.session-overall {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.overall-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.overall-score {
  font-weight: 600;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.message-item {
  background: var(--background-soft);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--border-color);
}

.message-item.positive {
  border-left-color: #16a34a;
}

.message-item.neutral {
  border-left-color: #9ca3af;
}

.message-item.negative {
  border-left-color: #ef4444;
}

.message-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.message-score {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.message-date {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.message-text {
  margin: 0;
  font-size: var(--text-md);
  line-height: 1.5;
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
  height: 250px;
  color: var(--text-muted);
  font-size: var(--text-md);
}

.no-data.small {
  height: 80px;
  font-size: var(--text-sm);
}
</style>
