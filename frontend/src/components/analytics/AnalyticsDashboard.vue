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
  <div class="analytics-container">
    <!-- Analytics Locked Overlay (only shown when enterprise module exists) -->
    <div v-if="hasEnterpriseModule && isAnalyticsLocked" class="analytics-locked-overlay">
      <div class="locked-content">
        <div class="locked-header">
          <div class="locked-icon-wrapper">
            <div class="locked-icon-bg">
              <font-awesome-icon icon="fa-solid fa-chart-line" class="locked-icon" />
            </div>
          </div>
          <h2>Analytics Dashboard</h2>
          <div class="locked-badge">
            <font-awesome-icon icon="fa-solid fa-lock" class="badge-icon" />
            <span>Premium Feature</span>
          </div>
        </div>
        
        <p class="locked-description">
          Unlock powerful analytics and insights to track your team's performance, 
          customer satisfaction, and conversation trends with detailed reports and visualizations.
        </p>
        
        <div class="locked-features">
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <font-awesome-icon icon="fa-solid fa-chart-bar" class="feature-icon" />
            </div>
            <div class="feature-content">
              <span class="feature-title">Real-time Analytics</span>
              <span class="feature-desc">Live conversation metrics and performance tracking</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <font-awesome-icon icon="fa-solid fa-users" class="feature-icon" />
            </div>
            <div class="feature-content">
              <span class="feature-title">Agent Performance</span>
              <span class="feature-desc">Individual and team performance insights</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <font-awesome-icon icon="fa-solid fa-heart" class="feature-icon" />
            </div>
            <div class="feature-content">
              <span class="feature-title">Customer Satisfaction</span>
              <span class="feature-desc">Rating trends and satisfaction metrics</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-wrapper">
              <font-awesome-icon icon="fa-solid fa-file-export" class="feature-icon" />
            </div>
            <div class="feature-content">
              <span class="feature-title">Advanced Reports</span>
              <span class="feature-desc">Detailed insights and export capabilities</span>
            </div>
          </div>
        </div>
        
        <div class="upgrade-section">
          <button class="upgrade-button" @click="handleUpgrade">
            <font-awesome-icon icon="fa-solid fa-crown" class="upgrade-icon" />
            <span>Upgrade to Unlock Analytics</span>
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="arrow-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Analytics Content (when unlocked) -->
    <div v-else>
      <div class="analytics-header">
        <div class="time-range-selector">
          <button 
            v-for="range in ['24h', '7d', '30d', '90d']" 
            :key="range"
            :class="{ active: timeRange === range }"
            @click="handleTimeRangeChange(range)"
          >
            {{ range }}
          </button>
        </div>
      </div>

    <div class="analytics-tabs">
      <div class="tab-buttons">
        <button 
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          Overview
        </button>
        <button 
          :class="{ active: activeTab === 'agent-performance' }"
          @click="activeTab = 'agent-performance'"
        >
          Agent Performance
        </button>
        <button
          :class="{ active: activeTab === 'customers' }"
          @click="activeTab = 'customers'"
        >
          Customers
        </button>
        <button
          :class="{ active: activeTab === 'sentiment' }"
          @click="activeTab = 'sentiment'"
        >
          Sentiment
        </button>
      </div>
    </div>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'">
      <div v-if="error" class="error-state">
        {{ error }}
      </div>

      <div v-else-if="isLoading" class="loading-state">
        Loading analytics data...
      </div>

      <div v-else class="analytics-grid">
        <!-- Overview Cards -->
        <div class="metrics-overview">
          <div class="metric-card">
            <h3>Total Conversations</h3>
            <div class="metric-value">
              {{ analyticsData?.conversations?.total || 0 }}
              <span class="change" :class="{ positive: (analyticsData?.conversations?.change || 0) >= 0 }">
                {{ (analyticsData?.conversations?.change || 0) >= 0 ? '+' : '' }}{{ (analyticsData?.conversations?.change || 0).toFixed(1) }}%
                <i :class="analyticsData?.conversations?.trend === 'up' ? 'trend-up' : 'trend-down'"></i>
              </span>
            </div>
          </div>
          <div class="metric-card">
            <h3>AI Chat Closures</h3>
            <div class="metric-value">
              {{ analyticsData?.aiClosures?.total || 0 }}
              <span class="change" :class="{ positive: (analyticsData?.aiClosures?.change || 0) >= 0 }">
                {{ (analyticsData?.aiClosures?.change || 0) >= 0 ? '+' : '' }}{{ (analyticsData?.aiClosures?.change || 0).toFixed(1) }}%
                <i :class="analyticsData?.aiClosures?.trend === 'up' ? 'trend-up' : 'trend-down'"></i>
              </span>
            </div>
          </div>
          <div class="metric-card">
            <h3>Human Transfers</h3>
            <div class="metric-value">
              {{ analyticsData?.transfers?.total || 0 }}
              <span class="change" :class="{ positive: (analyticsData?.transfers?.change || 0) >= 0 }">
                {{ (analyticsData?.transfers?.change || 0) >= 0 ? '+' : '' }}{{ (analyticsData?.transfers?.change || 0).toFixed(1) }}%
                <i :class="analyticsData?.transfers?.trend === 'up' ? 'trend-up' : 'trend-down'"></i>
              </span>
            </div>
          </div>
          <div class="metric-card">
            <h3>Bot Rating</h3>
            <div class="metric-value">
              {{ (analyticsData?.ratings?.bot_avg || 0).toFixed(1) }}
              <span class="change" :class="{ positive: (analyticsData?.ratings?.bot_change || 0) >= 0 }">
                {{ (analyticsData?.ratings?.bot_change || 0) >= 0 ? '+' : '' }}{{ (analyticsData?.ratings?.bot_change || 0).toFixed(1) }}%
                <i :class="analyticsData?.ratings?.bot_trend === 'up' ? 'trend-up' : 'trend-down'"></i>
              </span>
            </div>
            <div class="rating-count">{{ analyticsData?.ratings?.bot_count || 0 }} ratings</div>
          </div>
          <div class="metric-card">
            <h3>Human Rating</h3>
            <div class="metric-value">
              {{ (analyticsData?.ratings?.human_avg || 0).toFixed(1) }}
              <span class="change" :class="{ positive: (analyticsData?.ratings?.human_change || 0) >= 0 }">
                {{ (analyticsData?.ratings?.human_change || 0) >= 0 ? '+' : '' }}{{ (analyticsData?.ratings?.human_change || 0).toFixed(1) }}%
                <i :class="analyticsData?.ratings?.human_trend === 'up' ? 'trend-up' : 'trend-down'"></i>
              </span>
            </div>
            <div class="rating-count">{{ analyticsData?.ratings?.human_count || 0 }} ratings</div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <div class="chart-container">
            <h3>Conversations Over Time</h3>
            <div v-if="!hasData(analyticsData?.conversations)" class="no-data">
              No conversation data available
            </div>
            <apexchart
              v-else
              type="area"
              height="300"
              :options="getChartOptions('Conversations', '#C9F24E')"
              :series="[{
                name: 'Conversations',
                data: getChartData(analyticsData?.conversations)
              }]"
            />
          </div>
          <div class="chart-container">
            <h3>AI Closures vs Human Transfers</h3>
            <div v-if="!hasData(analyticsData?.aiClosures) && !hasData(analyticsData?.transfers)" class="no-data">
              No closure/transfer data available
            </div>
            <apexchart
              v-else
              type="area"
              height="300"
              :options="getComparisonChartOptions()"
              :series="[
                {
                  name: 'AI Closures',
                  data: getChartData(analyticsData?.aiClosures)
                },
                {
                  name: 'Human Transfers',
                  data: getChartData(analyticsData?.transfers)
                }
              ]"
            />
          </div>
          <div class="chart-container">
            <h3>Rating Comparison</h3>
            <div v-if="!hasData(analyticsData?.ratings)" class="no-data">
              No rating data available
            </div>
            <apexchart
              v-else
              type="line"
              height="300"
              :options="getRatingChartOptions()"
              :series="[
                {
                  name: 'Bot Rating',
                  data: getChartData(analyticsData?.ratings?.bot)
                },
                {
                  name: 'Human Rating',
                  data: getChartData(analyticsData?.ratings?.human)
                }
              ]"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Performance Tab -->
    <div v-if="activeTab === 'agent-performance'">
      <AgentPerformance :time-range="timeRange" @time-range-change="handleTimeRangeChange" />
    </div>

      <!-- Customer Analytics Tab -->
      <div v-if="activeTab === 'customers'">
        <CustomerAnalytics :time-range="timeRange" @time-range-change="handleTimeRangeChange" />
      </div>

      <!-- Sentiment Analytics Tab -->
      <div v-if="activeTab === 'sentiment'">
        <SentimentAnalytics :time-range="timeRange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import api from '@/services/api'
import AgentPerformance from './AgentPerformance.vue'
import CustomerAnalytics from './CustomerAnalytics.vue'
import SentimentAnalytics from './SentimentAnalytics.vue'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

interface AnalyticsMetric {
  data: number[]
  labels: string[]
  total?: number
  active?: number
  change: number
  trend: 'up' | 'down'
}

interface RatingMetrics {
  bot: AnalyticsMetric
  human: AnalyticsMetric
  bot_avg: number
  human_avg: number
  bot_count: number
  human_count: number
  bot_change: number
  human_change: number
  bot_trend: 'up' | 'down'
  human_trend: 'up' | 'down'
}

interface AnalyticsData {
  conversations: AnalyticsMetric
  aiClosures: AnalyticsMetric
  transfers: AnalyticsMetric
  ratings: RatingMetrics
}

const timeRange = ref('7d')
const activeTab = ref('overview')
const isLoading = ref(true)
const error = ref<string | null>(null)
const analyticsData = ref<AnalyticsData | null>(null)

// Subscription and analytics feature checking
const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())

// Check if analytics feature is available
const hasAnalyticsFeature = computed(() => {
  return subscriptionStorage.hasFeature('analytics')
})

// Check if analytics is locked (only if enterprise module exists)
const isAnalyticsLocked = computed(() => {
  // Only lock if enterprise module exists
  if (!hasEnterpriseModule) {
    return false
  }
  return !hasAnalyticsFeature.value || !isSubscriptionActive.value
})

// Upgrade modal state
const showUpgradeModal = ref(false)

// Modal functions
const closeUpgradeModal = () => {
  showUpgradeModal.value = false
}

const handleUpgrade = () => {
  // Only redirect to subscription page if enterprise module exists
  if (hasEnterpriseModule) {
    window.location.href = '/settings/subscription'
  }
}

const hasData = (metric: AnalyticsMetric | RatingMetrics | undefined): boolean => {
  if (!metric) return false
  if ('bot' in metric) {
    // Handle RatingMetrics
    return !!metric.bot?.data?.length && !!metric.bot?.labels?.length &&
           !!metric.human?.data?.length && !!metric.human?.labels?.length
  }
  // Handle AnalyticsMetric
  return !!metric?.data?.length && !!metric?.labels?.length
}

const getChartData = (metric: AnalyticsMetric | undefined) => {
  if (!metric?.data || !metric?.labels) return []
  return metric.data.map((value, index) => ({
    x: new Date(metric.labels[index]).getTime(),
    y: value
  }))
}

const getChartOptions = (name: string, color: string) => ({
  chart: {
    type: 'area',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    }
  },
  colors: [color],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.2,
      stops: [0, 90, 100]
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  grid: {
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MMM \'yy',
        day: 'dd MMM',
        hour: 'HH:mm'
      }
    },
    tooltip: {
      enabled: false
    }
  },
  yaxis: {
    labels: {
      formatter: (value: number) => Math.round(value)
    }
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy HH:mm'
    }
  },
  markers: {
    size: 4,
    strokeWidth: 2,
    hover: {
      size: 6
    }
  }
})

const getRatingChartOptions = () => ({
  ...getChartOptions('Ratings', '#10B981'),
  colors: ['#C9F24E', '#5FE3D6'],
  stroke: {
    curve: 'smooth',
    width: 3
  },
  markers: {
    size: 4,
    strokeWidth: 2,
    hover: {
      size: 6
    }
  },
  yaxis: {
    min: 0,
    max: 5,
    tickAmount: 5,
    labels: {
      formatter: (value: number) => value.toFixed(1)
    }
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'right'
  }
})

const getComparisonChartOptions = () => ({
  ...getChartOptions('Closures & Transfers', '#10B981'),
  colors: ['#5FE3D6', '#C9F24E'],
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.2,
      stops: [0, 90, 100]
    }
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'right'
  }
})

const fetchAnalytics = async () => {
  // Don't fetch if analytics is locked
  if (isAnalyticsLocked.value) {
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null
    const response = await api.get('/analytics', {
      params: { time_range: timeRange.value }
    })
    analyticsData.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to fetch analytics data'
  } finally {
    isLoading.value = false
  }
}

const handleTimeRangeChange = (range: string) => {
  timeRange.value = range
  fetchAnalytics()
}

fetchAnalytics()
</script>

<style scoped>
.analytics-container {
  padding: var(--space-lg);
}

.analytics-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: var(--space-md);
}

.analytics-tabs {
  margin-bottom: var(--space-xl);
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid var(--o08);
  margin-bottom: var(--space-lg);
}

.tab-buttons button {
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--muted);
  transition: all var(--transition-fast);
  position: relative;
  font-family: var(--font-sans);
}

.tab-buttons button.active {
  color: var(--accent-ink);
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

.time-range-selector {
  display: flex;
  gap: 4px;
  background: var(--o06);
  border: 1px solid var(--o10);
  padding: 4px;
  border-radius: var(--radius-full);
}

.time-range-selector button {
  padding: 5px 12px;
  border: none;
  background: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--muted);
  font-size: 12.5px;
  font-family: var(--font-mono);
  transition: all var(--transition-fast);
}

.time-range-selector button.active {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-weight: 600;
}

.metrics-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.metric-card {
  background: var(--surface);
  padding: var(--space-lg);
  border-radius: 18px;
  border: 1px solid var(--o08);
}

.metric-card h3 {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--faint);
  margin-bottom: var(--space-sm);
}

.metric-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  color: var(--text);
}

.change {
  font-size: var(--text-sm);
  color: var(--c-coral);
}

.change.positive {
  color: var(--c-teal);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-xl);
}

.chart-container {
  padding: var(--space-lg);
  border-radius: 18px;
  border: 1px solid var(--o08);
  background: var(--surface);
}

.chart-container h3 {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--faint);
  margin-bottom: var(--space-md);
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
  font-size: var(--text-sm);
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

.rating-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

/* Analytics Locked Overlay Styles */
.analytics-locked-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  margin: var(--space-lg) 0;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.analytics-locked-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(201, 242, 78, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(95, 227, 214, 0.04) 0%, transparent 50%);
  pointer-events: none;
}

.locked-content {
  text-align: center;
  max-width: 800px;
  padding: var(--space-2xl) var(--space-lg);
  position: relative;
  z-index: 1;
}

.locked-header {
  margin-bottom: var(--space-xl);
}

.locked-icon-wrapper {
  margin-bottom: var(--space-md);
}

.locked-icon-bg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--accent-solid);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--space-sm);
}

.locked-icon {
  font-size: 1.5rem;
  color: var(--on-accent-solid);
}

.locked-content h2 {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.locked-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.badge-icon {
  font-size: 0.75rem;
}

.locked-description {
  font-size: var(--text-lg);
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-xl);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.locked-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--background-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  text-align: left;
  transition: all var(--transition-normal);
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-color-hover);
}

.feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--success-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.feature-icon {
  font-size: 1rem;
  color: white;
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.feature-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.feature-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.4;
}

.upgrade-section {
  text-align: center;
}

.upgrade-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-lg) var(--space-xl);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.upgrade-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.upgrade-button:hover::before {
  left: 100%;
}

.upgrade-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.upgrade-icon {
  font-size: 1rem;
  color: #ffd700;
}

.arrow-icon {
  font-size: 0.875rem;
  transition: transform var(--transition-normal);
}

.upgrade-button:hover .arrow-icon {
  transform: translateX(4px);
}

/* Responsive adjustments for locked overlay */
@media (max-width: 1024px) {
  .locked-features {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
}

@media (max-width: 768px) {
  .analytics-locked-overlay {
    min-height: 50vh;
    margin: var(--space-md) 0;
  }
  
  .locked-content {
    padding: var(--space-xl) var(--space-md);
  }
  
  .locked-content h2 {
    font-size: var(--text-2xl);
  }
  
  .locked-description {
    font-size: var(--text-base);
    margin-bottom: var(--space-lg);
  }
  
  .locked-features {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }
  
  .feature-item {
    padding: var(--space-md);
  }
  
  .feature-icon-wrapper {
    width: 32px;
    height: 32px;
  }
  
  .feature-icon {
    font-size: 0.875rem;
  }
  
  .upgrade-button {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    font-size: var(--text-sm);
  }
  
  .locked-icon-bg {
    width: 48px;
    height: 48px;
  }
  
  .locked-icon {
    font-size: 1.25rem;
  }
  
  .locked-header {
    margin-bottom: var(--space-lg);
  }
}
</style> 