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

import type { AxiosError } from 'axios'
import api from './api'
import { userService } from './user'
import type { User } from '../types/user'
interface ErrorResponse {
  detail: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export const authService = {
  async login(email: string, password: string) {
    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      // Get shop_id from URL query params if it exists
      const urlParams = new URLSearchParams(window.location.search)
      const shopId = urlParams.get('shop_id')
      
      // Build the URL with query params if shop_id exists
      let url = '/users/login'
      if (shopId) {
        url += `?shop_id=${encodeURIComponent(shopId)}`
      }

      const response = await api.post<LoginResponse>(url, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      userService.setCurrentUser(response.data.user)
      return response.data.user
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.detail || 'Login failed')
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/users/logout')
      userService.clearCurrentUser()
      localStorage.removeItem('agents')
      localStorage.removeItem('current_subscription')
      localStorage.removeItem('exploreView_customization')
      localStorage.removeItem('exploreView_selectedColor')
      localStorage.removeItem('exploreView_url')
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.detail || 'Logout failed')
    }
  },
}
