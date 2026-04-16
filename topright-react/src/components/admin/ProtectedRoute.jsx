import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession, onAuthStateChange } from '../../services/authService'

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    getSession().then(setSession)
    const unsubscribe = onAuthStateChange(setSession)
    return unsubscribe
  }, [])

  if (session === undefined) return null
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}
