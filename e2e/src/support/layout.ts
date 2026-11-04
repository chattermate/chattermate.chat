import type { Locator } from '@playwright/test'

/**
 * How far anything inside `container` sticks out past its right edge, in pixels
 * (0 when it all fits). Clipped content doesn't scroll the page, so a page-wide
 * overflow check misses it; this measures the box itself.
 */
export async function overflowRight(container: Locator): Promise<number> {
  return container.evaluate((root) => {
    const edge = root.getBoundingClientRect().right
    let widest = edge
    for (const el of Array.from(root.querySelectorAll('*'))) {
      const box = el.getBoundingClientRect()
      if (box.width > 0 && box.height > 0) widest = Math.max(widest, box.right)
    }
    return Math.round(widest - edge)
  })
}

/** Left edges of two elements, to check they line up. */
export async function leftEdges(a: Locator, b: Locator): Promise<[number, number]> {
  const [boxA, boxB] = await Promise.all([a.boundingBox(), b.boundingBox()])
  return [Math.round(boxA!.x), Math.round(boxB!.x)]
}
