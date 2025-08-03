import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useToast } from '@/hooks/use-toast'
import { LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function SignOutButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  showIcon = true,
  children = 'Sign Out'
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signOut, user } = useAdminAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsLoading(true)
    
    try {
      await signOut()
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out of the admin panel.',
      })
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  )
}