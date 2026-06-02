import { useEffect, useState } from 'react'

export function useStockUpdates(productId) {
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const url = productId
      ? `${baseUrl}/sse/stock/${productId}`
      : `${baseUrl}/sse/stock`

    const es = new EventSource(url)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setStock(data)
        setLoading(false)
      } catch {}
    }
    es.onerror = () => setLoading(false)

    return () => es.close()
  }, [productId])

  return { stock, loading }
}
