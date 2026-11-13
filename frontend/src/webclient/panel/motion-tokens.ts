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

/**
 * Motion for the redesigned widget (ui 2). Every chat style has a personality;
 * each personality is a handful of CSS custom properties that widget-motion.css
 * reads, so the stylesheet holds one set of animations for every theme.
 */

export type MotionPersonality = 'base' | 'spring' | 'blur' | 'stepped' | 'gentle'

interface MotionTokens {
    /** Timing function for things entering. */
    ease: string
    /** Multiplier on every duration. */
    durationScale: number
    /** How far, in px, a message or card rises as it enters. */
    enterY: number
    /** Scale a message or card grows from as it enters. */
    enterScale: number
}

const MOTION: Record<MotionPersonality, MotionTokens> = {
    base: { ease: 'var(--cm-ease-out)', durationScale: 1, enterY: 8, enterScale: 1 },
    spring: { ease: 'var(--cm-ease-spring)', durationScale: 1, enterY: 10, enterScale: 0.96 },
    gentle: { ease: 'var(--cm-ease-out)', durationScale: 1.25, enterY: 4, enterScale: 1 },
    // Terminal: no travel, opacity in four steps like a redrawn screen.
    stepped: { ease: 'steps(4, end)', durationScale: 1, enterY: 0, enterScale: 1 },
    blur: { ease: 'var(--cm-ease-out)', durationScale: 1, enterY: 8, enterScale: 0.98 },
}

/** Easings and durations shared by every personality. */
const SHARED_MOTION_VARS: Record<string, string> = {
    '--cm-ease-out': 'cubic-bezier(.16,1,.3,1)',
    '--cm-ease-spring': 'cubic-bezier(.34,1.56,.64,1)',
    '--cm-ease-in': 'cubic-bezier(.4,0,1,1)',
    '--cm-dur-1': '90ms',
    '--cm-dur-2': '180ms',
    '--cm-dur-3': '320ms',
    '--cm-dur-4': '460ms',
}

/** The --cm-* motion properties for one personality. */
export function motionCssVars(personality: MotionPersonality): Record<string, string> {
    const motion = MOTION[personality] || MOTION.base
    return {
        ...SHARED_MOTION_VARS,
        '--cm-ease-enter': motion.ease,
        '--cm-dur-scale': String(motion.durationScale),
        '--cm-enter-y': `${motion.enterY}px`,
        '--cm-enter-scale': String(motion.enterScale),
    }
}
