import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
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
  const { signOut, user } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await signOut()
      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Signed out successfully',
          description: 'You have been logged out.',
        })
      }
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