<!--
ChatterMate - Analytics Dashboard Component
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
  <div class="analytics-container">
    <div class="analytics-header">
      <h1>Analytics Dashboard</h1>
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
              :options="getChartOptions('Conversations', '#f34611')"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import api from '@/services/api'
import AgentPerformance from './AgentPerformance.vue'
import CustomerAnalytics from './CustomerAnalytics.vue'

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
  colors: ['#f34611', '#10B981'],
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
  colors: ['#10B981', '#f34611'],
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.analytics-tabs {
  margin-bottom: var(--space-xl);
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-lg);
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
  background: var(--primary-color);
}

.time-range-selector {
  display: flex;
  gap: var(--space-xs);
  background: var(--background-soft);
  padding: var(--space-xs);
  border-radius: var(--radius-full);
}

.time-range-selector button {
  padding: var(--space-xs) var(--space-sm);
  border: none;
  background: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--text-color);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.time-range-selector button.active {
  background: var(--primary-color);
  color: white;
}

.metrics-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.change {
  font-size: var(--text-sm);
  color: var(--error-color);
}

.change.positive {
  color: var(--success-color);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-xl);
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
</style> 