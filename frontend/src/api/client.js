const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '请求失败' }))
    throw new Error(error.detail || '请求失败')
  }

  return response.json()
}

export const api = {
  getCourts: () => request('/courts'),
  getMembers: () => request('/members'),
  getTimeSlots: (date) => request(`/time-slots${date ? `?date=${date}` : ''}`),
  updateTimeSlot: (slotId, payload) =>
    request(`/time-slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getBookings: () => request('/bookings'),
  createBooking: (payload) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  settleBooking: (bookingId) =>
    request(`/bookings/${bookingId}/settle`, {
      method: 'POST',
    }),
  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    }),
  getPricingRules: () => request('/pricing-rules'),
  createPricingRule: (payload) =>
    request('/pricing-rules', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePricingRule: (ruleId, payload) =>
    request(`/pricing-rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deletePricingRule: (ruleId) =>
    request(`/pricing-rules/${ruleId}`, {
      method: 'DELETE',
    }),
  getHolidays: () => request('/holidays'),
  addHoliday: (date) =>
    request('/holidays', {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),
  removeHoliday: (date) =>
    request(`/holidays/${date}`, {
      method: 'DELETE',
    }),
}
