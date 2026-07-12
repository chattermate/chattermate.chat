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

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FaqGenerationProgress from '../../../components/faq/FaqGenerationProgress.vue'
import type { FaqGenerationJob, FaqJobStage } from '../../../types/faq'

const job = (stage: FaqJobStage): FaqGenerationJob => ({
  id: 1,
  job_type: 'generate_all',
  status: 'processing',
  stage,
  progress_percentage: 40,
  faqs_created: 0,
  source_url: null,
  error: null,
})

const stepStates = (stage: FaqJobStage) => {
  const wrapper = mount(FaqGenerationProgress, { props: { job: job(stage) } })
  return wrapper.findAll('.step').map((step) => {
    if (step.classes().includes('done')) return 'done'
    if (step.classes().includes('active')) return 'active'
    return 'todo'
  })
}

describe('FaqGenerationProgress', () => {
  it('renders four steps with the expected labels', () => {
    const wrapper = mount(FaqGenerationProgress, { props: { job: job('analyzing_sources') } })
    const labels = wrapper.findAll('.step__label').map((el) => el.text())
    expect(labels).toEqual([
      'Analyzing your sources',
      'Extracting questions from your content',
      'Drafting grounded answers',
      'Grouping by topic',
    ])
  })

  it('marks earlier stages done, the current stage active, later stages todo', () => {
    expect(stepStates('drafting')).toEqual(['done', 'done', 'active', 'todo'])
  })

  it('starts with the first stage active', () => {
    expect(stepStates('analyzing_sources')).toEqual(['active', 'todo', 'todo', 'todo'])
    expect(stepStates('not_started')).toEqual(['active', 'todo', 'todo', 'todo'])
  })

  it('marks everything done when completed', () => {
    expect(stepStates('completed')).toEqual(['done', 'done', 'done', 'done'])
  })

  it('shows pulsing dots only on the active step', () => {
    const wrapper = mount(FaqGenerationProgress, { props: { job: job('drafting') } })
    const steps = wrapper.findAll('.step')
    expect(steps[2].find('.step__pulse').exists()).toBe(true)
    expect(steps[0].find('.step__pulse').exists()).toBe(false)
    expect(steps[3].find('.step__pulse').exists()).toBe(false)
  })
})
