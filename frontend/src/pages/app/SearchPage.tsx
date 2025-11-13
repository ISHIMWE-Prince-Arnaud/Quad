import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComponentErrorBoundary } from '@/components/ui/error-boundary'

export default function SearchPage() {
  return (
    <ComponentErrorBoundary componentName="SearchPage">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Search functionality coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </ComponentErrorBoundary>
  )
}
