import { Geolocation } from '@capacitor/geolocation'
import { useState } from 'react'
import { Button } from './ui/button'

export default function GeolocationButton() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = async () => {
    try {
      setError(null)
      setLoading(true)
      await Geolocation.requestPermissions()
      const pos = await Geolocation.getCurrentPosition()
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={getLocation} disabled={loading}>
        {loading ? 'Locating…' : 'Get location'}
      </Button>
      {coords && (
        <div>
          Lat: {coords.lat.toFixed(6)}, Lon: {coords.lon.toFixed(6)}
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
