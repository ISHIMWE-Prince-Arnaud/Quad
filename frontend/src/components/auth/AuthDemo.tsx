import { useState } from 'react'
import { useTokenManager, useAuthenticatedRequest } from '@/lib/tokens'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthDemo() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { getAuthToken } = useTokenManager()
  const { makeAuthenticatedRequest } = useAuthenticatedRequest()

  const handleGetToken = async () => {
    setLoading(true)
    try {
      const authToken = await getAuthToken()
      setToken(authToken)
    } catch (error) {
      console.error('Error getting token:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestRequest = async () => {
    setLoading(true)
    try {
      const response = await makeAuthenticatedRequest('/api/test')
      console.log('Test request response:', response)
    } catch (error) {
      console.error('Test request error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Authentication Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleGetToken}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Get Auth Token'}
          </Button>
          <Button 
            onClick={handleTestRequest}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Test API Request'}
          </Button>
        </div>
        
        {token && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Token (first 50 chars):</strong>
            </p>
            <code className="text-xs break-all">
              {token.substring(0, 50)}...
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
