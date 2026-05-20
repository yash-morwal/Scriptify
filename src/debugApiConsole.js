import axios from 'axios'

const enabled =
  import.meta.env.DEV ||
  import.meta.env.VITE_DEBUG_API_CONSOLE === 'true'

const redactHeaders = (headers = {}) => {
  const safeHeaders = { ...headers }
  for (const key of Object.keys(safeHeaders)) {
    if (/authorization|apikey|token|key|secret/i.test(key)) {
      safeHeaders[key] = '[redacted]'
    }
  }
  return safeHeaders
}

const readPayload = (payload) => {
  if (typeof payload !== 'string') return payload
  try {
    return JSON.parse(payload)
  } catch {
    return payload
  }
}

if (enabled && !window.__flencerApiConsoleInstalled) {
  window.__flencerApiConsoleInstalled = true

  axios.interceptors.request.use((config) => {
    console.groupCollapsed(`API Request: ${config.method?.toUpperCase() || 'GET'} ${config.url}`)
    console.log({
      method: config.method,
      url: config.url,
      params: config.params,
      data: readPayload(config.data),
      headers: redactHeaders(config.headers),
    })
    console.groupEnd()
    return config
  })

  axios.interceptors.response.use(
    (response) => {
      console.groupCollapsed(`API Response: ${response.status} ${response.config?.url}`)
      console.log({
        status: response.status,
        url: response.config?.url,
        request: {
          method: response.config?.method,
          data: readPayload(response.config?.data),
        },
        data: response.data,
      })
      console.groupEnd()
      return response
    },
    (error) => {
      console.groupCollapsed(`API Error: ${error.response?.status || 'network'} ${error.config?.url || ''}`)
      console.log({
        status: error.response?.status,
        url: error.config?.url,
        request: {
          method: error.config?.method,
          data: readPayload(error.config?.data),
        },
        response: error.response?.data,
        message: error.message,
      })
      console.groupEnd()
      return Promise.reject(error)
    },
  )
}
