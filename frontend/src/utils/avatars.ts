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
 * True when `path` is already an absolute URL (e.g. a signed S3/CDN link) and
 * should be used as-is instead of being prefixed with the API base URL.
 *
 * We test for an absolute http(s) scheme rather than matching a host substring
 * such as "amazonaws.com": substring host checks are unreliable — the host can
 * appear anywhere in an attacker-influenced string — and are flagged by static
 * analysis (CodeQL js/incomplete-url-substring-sanitization).
 */
export const isAbsoluteUrl = (path?: string | null): boolean =>
  !!path && (/^https?:\/\//i.test(path) || path.startsWith('data:'))
