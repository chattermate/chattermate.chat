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

export interface PasswordStrength {
  score: number
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export const validatePassword = (password: string): PasswordStrength => {
  const strength = {
    score: 0,
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password),
  }

  strength.score = [
    strength.hasMinLength,
    strength.hasUpperCase,
    strength.hasLowerCase,
    strength.hasNumber,
    strength.hasSpecialChar,
  ].filter(Boolean).length

  return strength
}

/**
 * The bar the API enforces (app/core/security.py: validate_password_strength):
 * 8 characters plus at least three of the four character classes. Since the
 * length check is one of the five criteria the meter counts, "length met and
 * score >= 4" is exactly that rule. Keep the two in step.
 */
export const meetsPasswordPolicy = (strength: PasswordStrength): boolean =>
  strength.hasMinLength && strength.score >= 4

export const validateDomain = (domain: string): boolean => {
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s\-']+$/.test(name)
}

export const validateOrgName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s\-'&.]+$/.test(name)
}

/** A path on this dashboard, never another site: "//host" and "/\host" are
 * protocol-relative to browsers, so they don't count. */
export const isInternalPath = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
