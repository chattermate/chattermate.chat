import { describe, it, expect } from 'vitest'
import { READY_PAGES, learnedSoFar, pagesLearnedSoFar, readyToTry } from '@/composables/useLearningWatch'

describe('progress while a site is learned page by page', () => {
  it.each([
    [undefined, 'learning…'],
    [0, 'learning…'],
    [1, '1 page so far'],
    [12, '12 pages so far'],
  ])('a site with %s pages stored reads "%s"', (pages, label) => {
    expect(learnedSoFar({ pages_learned: pages })).toBe(label)
  })

  it('adds up the pages of every site still being read', () => {
    expect(pagesLearnedSoFar([{ pages_learned: 4 }, {}, { pages_learned: 3 }])).toBe(7)
    expect(pagesLearnedSoFar([])).toBe(0)
  })
})

describe('when the agent is worth trying', () => {
  it.each([
    // nothing learned, whatever else is true
    [{ hasKnowledge: false, stillLearning: false, pagesSoFar: 0 }, false],
    [{ hasKnowledge: false, stillLearning: true, pagesSoFar: 0 }, false],
    // everything read, something learned (a one-page site, pasted text)
    [{ hasKnowledge: true, stillLearning: false, pagesSoFar: 0 }, true],
    // still reading: only once the first few pages are in
    [{ hasKnowledge: true, stillLearning: true, pagesSoFar: READY_PAGES - 1 }, false],
    [{ hasKnowledge: true, stillLearning: true, pagesSoFar: READY_PAGES }, true],
  ])('%o → %s', (state, ready) => {
    expect(readyToTry(state)).toBe(ready)
  })
})
