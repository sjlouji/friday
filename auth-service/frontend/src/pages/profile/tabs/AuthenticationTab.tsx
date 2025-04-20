import { useState } from "react";
import { 
  Input,
  Label,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription
} from "@friday/components";
import { 
  KeyRound, 
  Lock, 
  AlertTriangle, 
  Plus, 
  Smartphone,
  ShieldCheck,
  Shield,
  Fingerprint,
  Info
} from "lucide-react";

export default function AuthenticationTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  
  // Mock passkeys data
  const [passkeys, setPasskeys] = useState([
    { 
      id: "pk-1", 
      name: "MacBook Pro", 
      lastUsed: "2 days ago", 
      createdAt: "Apr 10, 2023" 
    },
    { 
      id: "pk-2", 
      name: "iPhone 14", 
      lastUsed: "5 hours ago", 
      createdAt: "Mar 15, 2023" 
    }
  ]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    // In a real app, you would call an API to change the password
    setIsChangingPassword(true);
    
    // Simulate API call
    setTimeout(() => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
      // Show success message
    }, 1000);
  };

  const handleRemovePasskey = (id: string) => {
    // In a real app, you would call an API to remove the passkey
    setPasskeys(passkeys.filter(key => key.id !== id));
  };

  const handleAddPasskey = () => {
    // In a real app, this would trigger WebAuthn registration
    if (!newPasskeyName) return;
    
    const newPasskey = {
      id: `pk-${passkeys.length + 1}`,
      name: newPasskeyName,
      lastUsed: "Just now",
      createdAt: new Date().toLocaleDateString()
    };
    
    setPasskeys([...passkeys, newPasskey]);
    setNewPasskeyName("");
    setIsAddingPasskey(false);
  };

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  const passwordMeetsRequirements = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const passwordsMatch = newPassword === confirmPassword;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-700">Authentication</h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage your password, passkeys, and security settings to keep your account secure
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" />
            Change Password
          </CardTitle>
          <CardDescription className="text-sm">
            Your password was last changed on April 15, 2023. We recommend updating your password regularly
            to ensure account security. Strong passwords are essential for preventing unauthorized access.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            {passwordError && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-xs ml-2">Error</AlertTitle>
                <AlertDescription className="text-xs ml-6">
                  {passwordError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="current-password" className="text-xs">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="new-password" className="text-xs">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="confirm-password" className="text-xs">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>

            {newPassword && (
              <div className="p-3 border rounded-md bg-gray-50 mt-2">
                <p className="text-xs font-medium mb-2">Password must:</p>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-1.5">{hasMinLength ? '✓' : '○'}</span>
                    Have at least 8 characters
                  </li>
                  <li className={`flex items-center ${hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-1.5">{hasUppercase ? '✓' : '○'}</span>
                    Include at least one uppercase letter
                  </li>
                  <li className={`flex items-center ${hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-1.5">{hasLowercase ? '✓' : '○'}</span>
                    Include at least one lowercase letter
                  </li>
                  <li className={`flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-1.5">{hasNumber ? '✓' : '○'}</span>
                    Include at least one number
                  </li>
                  <li className={`flex items-center ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-1.5">{hasSpecialChar ? '✓' : '○'}</span>
                    Include at least one special character
                  </li>
                  {confirmPassword && (
                    <li className={`flex items-center ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="mr-1.5">{passwordsMatch ? '✓' : '✗'}</span>
                      Passwords must match
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              disabled={isChangingPassword || !currentPassword || !passwordMeetsRequirements || !passwordsMatch}
              size="sm"
              className="text-xs h-8"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Separator className="my-4" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-gray-500" />
            Passkeys
          </CardTitle>
          <CardDescription className="text-sm">
            Passkeys are a password-less authentication method that uses biometrics or device PIN 
            for secure login. They're phishing-resistant and more secure than traditional passwords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-8 w-8 text-green-600 shrink-0" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Enhanced Security</h4>
                <p className="text-sm text-gray-600">
                  Passkeys provide stronger security than passwords alone and are easier to use. 
                  They use biometrics (like fingerprint or face recognition) or device PIN to verify your identity,
                  eliminating the need to remember complex passwords.
                </p>
                <p className="text-sm text-gray-600">
                  Once set up, you can sign in with just a tap or glance, and your biometric data 
                  never leaves your device.
                </p>
              </div>
            </div>
          </div>
          
          {isAddingPasskey ? (
            <div className="border border-gray-200 p-4 rounded-md space-y-3">
              <h4 className="text-sm font-medium">Add a New Passkey</h4>
              <p className="text-xs text-gray-500">
                Enter a name for this passkey to help you identify the device it's associated with.
              </p>
              <div className="flex flex-col space-y-3">
                <Input
                  value={newPasskeyName}
                  onChange={(e) => setNewPasskeyName(e.target.value)}
                  placeholder="e.g., MacBook Pro, iPhone 14"
                  className="h-9 text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => setIsAddingPasskey(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={handleAddPasskey}
                    disabled={!newPasskeyName}
                  >
                    Register Passkey
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={() => setIsAddingPasskey(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Passkey
              </Button>
            </div>
          )}
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Your Passkeys ({passkeys.length})</h4>
            {passkeys.length > 0 ? (
              passkeys.map((key) => (
                <div 
                  key={key.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{key.name}</h4>
                      <div className="flex gap-4 mt-1">
                        <p className="text-xs text-gray-500">Last used: {key.lastUsed}</p>
                        <p className="text-xs text-gray-500">Created: {key.createdAt}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePasskey(key.id)}
                    className="text-xs h-7 text-gray-500 hover:text-red-600"
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center border border-dashed border-gray-200 rounded-md">
                <p className="text-sm text-gray-500">You haven't set up any passkeys yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Adding a passkey lets you sign in without entering your password
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-4" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-sm">
            Two-factor authentication (2FA) adds an extra layer of security to your account by requiring 
            both your password and a verification code from another device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">
                Two-factor authentication is enabled on your account.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                When signing in, you'll need to provide a verification code from your authenticator app 
                after entering your password. This protects your account even if your password is compromised.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Recovery codes:</span>
                  <span className="text-gray-600 font-medium">4 unused</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Last used:</span>
                  <span className="text-gray-600 font-medium">April 15, 2023</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-8"
          >
            View Recovery Codes
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs h-8"
          >
            Manage 2FA
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 