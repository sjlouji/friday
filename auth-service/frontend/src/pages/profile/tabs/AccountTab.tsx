import { useState } from "react";
import { 
  Input,
  Label,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@friday/components";
import { 
  Mail, 
  UserCheck, 
  Trash2, 
  AlertTriangle,
  Languages, 
  Download
} from "lucide-react";

export default function AccountTab() {
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [transferOwnershipOpen, setTransferOwnershipOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  
  const [transferEmail, setTransferEmail] = useState("");
  const [transferPassword, setTransferPassword] = useState("");
  
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [notificationSettings, setNotificationSettings] = useState({
    emailUpdates: true,
    securityAlerts: true
  });

  const [preferenceSettings, setPreferenceSettings] = useState({
    language: "en",
    dateFormat: "MM/DD/YYYY"
  });

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, make an API call to update the email
    console.log("Changing email to:", newEmail);
    // Reset form
    setNewEmail("");
    setConfirmNewEmail("");
    setCurrentPassword("");
    setEmailChangeOpen(false);
  };

  const handleOwnershipTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, make an API call to transfer ownership
    console.log("Transferring ownership to:", transferEmail);
    // Reset form
    setTransferEmail("");
    setTransferPassword("");
    setTransferOwnershipOpen(false);
  };

  const handleAccountDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, make an API call to delete the account
    console.log("Deleting account");
    // Reset form
    setDeleteConfirmation("");
    setDeletePassword("");
    setDeleteAccountOpen(false);
  };

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };

  const handleLanguageChange = (value: string) => {
    setPreferenceSettings({
      ...preferenceSettings,
      language: value
    });
  };

  const handleDateFormatChange = (value: string) => {
    setPreferenceSettings({
      ...preferenceSettings,
      dateFormat: value
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-700">Account Settings</h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences, language settings, and data
        </p>
      </div>

      {/* Email Change Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Email Address
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Update your email address. A verification link will be sent to the new address.
              Your account security is important - changing your email requires verification.
            </p>
          </div>
          {!emailChangeOpen && (
            <Button 
              onClick={() => setEmailChangeOpen(true)}
              size="sm"
              className="text-xs h-8"
            >
              Change Email
            </Button>
          )}
        </div>

        {emailChangeOpen ? (
          <div className="bg-gray-50 rounded-md p-4 mt-2 border border-gray-200">
            <form onSubmit={handleEmailChange} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-email" className="text-xs font-medium">New Email Address</Label>
                <Input
                  id="new-email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  type="email"
                  placeholder="Enter new email address"
                  required
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="confirm-email" className="text-xs font-medium">Confirm New Email Address</Label>
                <Input
                  id="confirm-email"
                  value={confirmNewEmail}
                  onChange={(e) => setConfirmNewEmail(e.target.value)}
                  type="email"
                  placeholder="Confirm new email address"
                  required
                  className="h-9 text-sm"
                />
                {newEmail && confirmNewEmail && newEmail !== confirmNewEmail && (
                  <p className="text-xs text-red-500 mt-1">Email addresses do not match</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="current-password" className="text-xs font-medium">Current Password</Label>
                <Input
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type="password"
                  placeholder="Enter your current password"
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEmailChangeOpen(false)}
                  size="sm"
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!newEmail || !confirmNewEmail || !currentPassword || newEmail !== confirmNewEmail}
                  size="sm"
                  className="text-xs h-8"
                >
                  Update Email
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
            Your current email is <span className="font-medium text-gray-700">admin@friday.com</span>
          </p>
        )}
      </div>

      <Separator />

      {/* Email Notifications */}
      <div>
        <h3 className="text-base font-medium mb-3">Email Notifications</h3>
        <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Account Updates</h4>
              <p className="text-sm text-gray-500">
                Receive important emails about your account activity, security alerts, and system updates.
                These emails ensure you stay informed about critical changes to your account.
              </p>
            </div>
            <Switch 
              checked={notificationSettings.emailUpdates} 
              onCheckedChange={() => toggleNotification('emailUpdates')}
              className="scale-75"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Security Alerts</h4>
              <p className="text-sm text-gray-500">
                Get notified immediately about suspicious account activity, login attempts from new 
                locations, and potential security threats. This helps protect your account from unauthorized access.
              </p>
            </div>
            <Switch 
              checked={notificationSettings.securityAlerts} 
              onCheckedChange={() => toggleNotification('securityAlerts')}
              className="scale-75"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Preferences */}
      <div>
        <h3 className="text-base font-medium mb-3 flex items-center gap-2">
          <Languages className="h-4 w-4 text-gray-500" />
          Regional Preferences
        </h3>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Customize how dates, times, and language appear across the platform. These settings affect all parts of your account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="language" className="text-xs">Display Language</Label>
              <p className="text-xs text-gray-500 mb-1.5">
                Choose the language for the user interface. This affects all text in menus, buttons, and notifications.
              </p>
              <Select 
                value={preferenceSettings.language} 
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date-format" className="text-xs">Date Format</Label>
              <p className="text-xs text-gray-500 mb-1.5">
                Set your preferred date format. This will be used for displaying dates throughout the application.
              </p>
              <Select 
                value={preferenceSettings.dateFormat} 
                onValueChange={handleDateFormatChange}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Europe)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Data Export */}
      <div>
        <h3 className="text-base font-medium mb-3 flex items-center gap-2">
          <Download className="h-4 w-4 text-gray-500" />
          Data & Privacy
        </h3>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Download a complete copy of your personal data from Friday
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your export will include your profile information, account settings, logs of your account activity, 
            and all personal data we store. This may take a few minutes to generate.
          </p>
          <Button variant="outline" size="sm" className="text-xs h-8">
            Request Data Export
          </Button>
        </div>
      </div>

      <Separator />

      {/* Ownership Transfer Section */}
      <div>
        <h3 className="text-base font-medium mb-3 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-gray-500" />
          Account Transfer
        </h3>
        <div className="flex flex-col space-y-3">
          <p className="text-sm text-gray-500">
            Transfer ownership of your account to another user. This action gives full administrative
            control to the new owner and removes your admin privileges. This is useful for transferring
            business accounts between team members.
          </p>
          
          {transferOwnershipOpen ? (
            <div className="bg-gray-50 rounded-md p-4 mt-2 border border-gray-200">
              <form onSubmit={handleOwnershipTransfer} className="space-y-3">
                <Alert variant="warning" className="py-2 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <AlertTitle className="text-xs font-medium">Warning</AlertTitle>
                  <AlertDescription className="text-xs">
                    Transferring ownership will remove your administrative rights and cannot be undone. 
                    The new owner will have full control over this account.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-1.5">
                  <Label htmlFor="transfer-email" className="text-xs font-medium">New Owner's Email</Label>
                  <Input
                    id="transfer-email"
                    value={transferEmail}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    type="email"
                    placeholder="Enter new owner's email"
                    required
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="transfer-password" className="text-xs font-medium">Confirm with Your Password</Label>
                  <Input
                    id="transfer-password"
                    value={transferPassword}
                    onChange={(e) => setTransferPassword(e.target.value)}
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="h-9 text-sm"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setTransferOwnershipOpen(false)}
                    size="sm"
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="destructive"
                    disabled={!transferEmail || !transferPassword}
                    size="sm"
                    className="text-xs h-8"
                  >
                    Transfer Ownership
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setTransferOwnershipOpen(true)}
              size="sm"
              className="text-xs h-8 w-fit"
            >
              Transfer Account Ownership
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Delete Account Section */}
      <div>
        <h3 className="text-base font-medium mb-3 flex items-center gap-2 text-red-600">
          <Trash2 className="h-4 w-4 text-red-600" />
          Danger Zone
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm font-medium text-red-600 mb-2">Delete your account permanently</p>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. All of your data, including profile information,
            account settings, and activity history will be permanently erased from our systems. This action cannot
            be undone, so please be certain.
          </p>
          
          {deleteAccountOpen ? (
            <form onSubmit={handleAccountDeletion} className="space-y-4 bg-white p-4 rounded-md border border-red-200">
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <AlertTitle className="text-xs font-medium">Warning: This action is irreversible</AlertTitle>
                <AlertDescription className="text-xs">
                  Deleting your account will permanently remove all your data, settings, and 
                  access to all associated services. This action cannot be undone.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-1.5">
                <Label htmlFor="delete-confirmation" className="text-xs font-medium">
                  Type "DELETE" to confirm
                </Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="delete-password" className="text-xs font-medium">Confirm with Your Password</Label>
                <Input
                  id="delete-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDeleteAccountOpen(false)}
                  size="sm"
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="destructive"
                  disabled={deleteConfirmation !== "DELETE" || !deletePassword}
                  size="sm"
                  className="text-xs h-8"
                >
                  Permanently Delete Account
                </Button>
              </div>
            </form>
          ) : (
            <Button 
              variant="destructive"
              onClick={() => setDeleteAccountOpen(true)}
              size="sm"
              className="text-xs h-8"
            >
              Delete Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 