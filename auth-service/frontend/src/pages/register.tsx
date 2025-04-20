import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@friday/components'
import { Input } from '@friday/components'
import { Label } from '@friday/components'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@friday/components'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@friday/components'
import { Alert, AlertDescription, AlertTitle } from '@friday/components'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [registered, setRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registeringPasskey, setRegisteringPasskey] = useState(false)
  const { register, registerPasskey, isLoading, supportsPasskeys } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }
    
    try {
      await register(name, email, password)
      setRegistered(true)
      setRegisteredEmail(email)
      toast({
        title: "Registration successful",
        description: supportsPasskeys 
          ? "Your account has been created. Would you like to set up a passkey?"
          : "Welcome to Friday! Your account has been created.",
      })
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was a problem creating your account.",
        variant: "destructive",
      })
      console.error('Registration failed:', error)
    }
  }

  const handlePasskeySetup = async () => {
    setRegisteringPasskey(true)
    try {
      await registerPasskey(registeredEmail)
      toast({
        title: "Passkey registered",
        description: "You can now use your passkey to sign in.",
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast({
        title: "Passkey registration failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setRegisteringPasskey(false)
    }
  }

  const skipPasskeySetup = () => {
    navigate('/dashboard', { replace: true })
  }

  if (registered && supportsPasskeys) {
    return (
      <div className="container flex min-h-0 w-screen flex-col items-center justify-center py-6">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Set up Passkey</h1>
            <p className="text-sm text-muted-foreground">
              Passkeys provide a more secure and convenient way to sign in
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add a Passkey</CardTitle>
              <CardDescription>
                Use biometrics or device PIN to sign in without a password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fingerprint"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"/></svg>
                <AlertTitle>Passkeys are more secure</AlertTitle>
                <AlertDescription>
                  Passkeys can't be reused, stolen, or phished, making them more secure than passwords.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                You'll be asked to use your device's authentication (Face ID, Touch ID, Windows Hello, etc.) 
                to create a passkey for <strong>{registeredEmail}</strong>.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                onClick={handlePasskeySetup}
                className="w-full"
                disabled={registeringPasskey}
              >
                {registeringPasskey ? "Setting up..." : "Set up passkey"}
              </Button>
              <Button
                variant="outline"
                onClick={skipPasskeySetup}
                className="w-full"
                disabled={registeringPasskey}
              >
                Skip for now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex min-h-0 w-screen flex-col items-center justify-center py-6">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to create your account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create a Friday account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Friday"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || password !== confirmPassword}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}