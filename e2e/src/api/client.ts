import type { APIRequestContext, APIResponse } from '@playwright/test'
import { env } from '../env'

type Body = Record<string, unknown> | unknown[]

interface CallOptions {
  data?: Body
  form?: Record<string, string>
  params?: Record<string, string | number | boolean>
  /** 0 to read a redirect's Location instead of following it. */
  maxRedirects?: number
  /** A multipart/form-data body — files as { name, mimeType, buffer }. */
  multipart?: Record<string, string | { name: string; mimeType: string; buffer: Buffer }>
  /** Extra request headers, e.g. an Origin for a CORS check. */
  headers?: Record<string, string>
}

/**
 * Thin JSON client for the backend API, used to SEED data — specs assert through
 * the UI. Domain modules (agents.ts, widgets.ts, …) build on this, so a route or
 * payload change is one edit there and nowhere else.
 */
export class ApiClient {
  readonly request: APIRequestContext
  private token?: string
  private readonly renew?: () => Promise<string>

  /** `renew` fetches a fresh token when the current one is refused (it lives 30 minutes). */
  constructor(request: APIRequestContext, token?: string, renew?: () => Promise<string>) {
    this.request = request
    this.token = token
    this.renew = renew
  }

  withToken(token: string, renew?: () => Promise<string>): ApiClient {
    return new ApiClient(this.request, token, renew)
  }

  get<T>(path: string, options: CallOptions = {}) { return this.call<T>('GET', path, options) }
  post<T>(path: string, options: CallOptions = {}) { return this.call<T>('POST', path, options) }
  put<T>(path: string, options: CallOptions = {}) { return this.call<T>('PUT', path, options) }
  patch<T>(path: string, options: CallOptions = {}) { return this.call<T>('PATCH', path, options) }
  delete<T>(path: string, options: CallOptions = {}) { return this.call<T>('DELETE', path, options) }

  /** Like call(), but hands back the raw response instead of throwing on a non-2xx. */
  async raw(method: string, path: string, options: CallOptions = {}): Promise<APIResponse> {
    const response = await this.send(method, path, options)
    // A long-lived worker outlasts its token; sign in again once and retry.
    if (response.status() === 401 && this.renew) {
      this.token = await this.renew()
      return this.send(method, path, options)
    }
    return response
  }

  private async send(method: string, path: string, options: CallOptions): Promise<APIResponse> {
    try {
      return await this.fetch(method, path, options)
    } catch (error) {
      // The server may close an idle keep-alive connection just as it is reused.
      // Only a read is safe to send twice.
      if (method !== 'GET' || !String(error).includes('ECONNRESET')) throw error
      return this.fetch(method, path, options)
    }
  }

  private fetch(method: string, path: string, options: CallOptions): Promise<APIResponse> {
    return this.request.fetch(`${env.apiUrl}${path}`, {
      method,
      data: options.data,
      form: options.form,
      multipart: options.multipart,
      params: options.params,
      maxRedirects: options.maxRedirects,
      headers: { ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...options.headers },
      failOnStatusCode: false,
    })
  }

  private async call<T>(method: string, path: string, options: CallOptions): Promise<T> {
    const response = await this.raw(method, path, options)
    if (!response.ok()) {
      // The status and body in the message are what make a seeding failure debuggable.
      throw new Error(`${method} ${path} → ${response.status()}: ${(await response.text()).slice(0, 500)}`)
    }
    const text = await response.text()
    return (text ? JSON.parse(text) : undefined) as T
  }
}
