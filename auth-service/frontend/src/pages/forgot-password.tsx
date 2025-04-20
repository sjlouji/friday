import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@friday/components'
import { Input } from '@friday/components'
import { Label } from '@friday/components'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@friday/components'
import { useToast } from '@friday/components'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitted(true)
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password."
      })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "There was a problem sending the password reset email. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex min-h-0 w-screen flex-col items-center justify-center py-6">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground">
            admin@friday.com address and we'll send you a link to reset your password
          </p>
        </div>

        <Card>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  We'll email you instructions to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@friday.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending email...' : 'Send reset instructions'}
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Email Sent</CardTitle>
                <CardDescription>
                  Check your inbox for the password reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-4">
                <p className="mb-4">We've sent password reset instructions to:</p>
                <p className="font-medium">{email}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  If you don't see the email, check your spam folder
                </p>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmitted(false)}
                >
                  Try another email
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  )
} 