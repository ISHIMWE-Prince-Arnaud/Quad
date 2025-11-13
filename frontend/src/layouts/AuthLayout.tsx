import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}
