import { useState } from "react";
import { 
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Badge,
  Separator
} from "@friday/components";
import { User, MapPin, Clock, Camera, Image, UserCircle2, CheckCircle, XCircle } from "lucide-react";

export default function ProfileTab() {
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@friday.com",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    profileImage: "",
    twoFactorEnabled: true,
    emailVerified: false,
    lastActive: "2 hours ago"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTimezoneChange = (value: string) => {
    setFormData({ ...formData, timezone: value });
  };

  const handleSave = () => {
    // In a real application, you would make an API call to update the profile
    setUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // For now, we'll just create a local URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData({ ...formData, profileImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const StatusBadge = ({ active }: { active: boolean }) => (
    active ? (
      <Badge className="bg-green-100 text-green-800 font-normal">
        <CheckCircle className="h-3 w-3 text-green-600 mr-1" /> Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 font-normal">
        <XCircle className="h-3 w-3 text-red-600 mr-1" /> Inactive
      </Badge>
    )
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-700">Profile Information</h3>
            <p className="text-xs text-gray-500 mt-1">
              Manage your personal information and how it appears to other users.
            </p>
          </div>
          
          <div 
            className="relative group"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
          >
            <div className={`
              absolute inset-0 rounded-full 
              flex items-center justify-center 
              transition-opacity
              ${isEditing ? 'bg-black/40 opacity-80' : 'opacity-0'} 
              ${isHoveringAvatar && isEditing ? 'opacity-80' : ''} 
              cursor-pointer
            `}>
              {isEditing && (
                <Camera className="h-8 w-8 text-white" />
              )}
            </div>
            <div className={`
              h-32 w-32 rounded-full overflow-hidden
              border-4 ${isEditing ? 'border-gray-300' : 'border-gray-200'}
              bg-gray-100
              shadow-sm transition-all duration-200
              ${isHoveringAvatar && isEditing ? 'border-gray-400' : ''}
            `}>
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage} 
                  alt={formData.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center relative">
                  <UserCircle2 className="h-20 w-20 text-gray-400" />
                  <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    F
                  </div>
                </div>
              )}
            </div>
            {isEditing && (
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            )}
            {isEditing && (
              <label 
                htmlFor="profile-image" 
                className="absolute -bottom-2 right-0 z-10 cursor-pointer"
              >
                <div className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-2 shadow-sm transition-all">
                  <Image className="h-4 w-4" />
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-6">          
          <div className="md:w-1/3 space-y-4">
            <div className="text-center space-y-1">
              <h4 className="font-medium text-sm text-gray-700">{formData.name}</h4>
              <p className="text-xs text-gray-500">{formData.email}</p>
              <p className="text-xs text-gray-500">Last active: {user.lastActive}</p>
            </div>

            <div className="w-full space-y-2 mt-2">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                <span className="text-xs text-gray-600">Two-Factor Auth</span>
                <StatusBadge active={user.twoFactorEnabled} />
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                <span className="text-xs text-gray-600">Email Verified</span>
                <StatusBadge active={user.emailVerified} />
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col items-center space-y-3 w-full mt-2">
                <div className="w-full p-3 rounded-md bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">
                    Upload a high quality image for your profile picture
                  </p>
                  <ul className="text-[11px] text-gray-500 space-y-1 ml-4 list-disc">
                    <li>Square ratio works best</li>
                    <li>Minimum 400x400 pixels</li>
                    <li>Maximum 2MB file size</li>
                    <li>JPG or PNG format</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-gray-600">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                  className={`h-9 text-sm ${isEditing ? 'border-gray-300 bg-gray-50' : ''}`}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-gray-600">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  placeholder="Your email address"
                  className="h-9 text-sm bg-gray-50"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Email address cannot be changed here.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-medium flex items-center gap-1 text-gray-600">
                  <MapPin className="h-3 w-3 text-gray-500" /> Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="City, Country"
                  className={`h-9 text-sm ${isEditing ? 'border-gray-300 bg-gray-50' : ''}`}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="timezone" className="text-xs font-medium flex items-center gap-1 text-gray-600">
                  <Clock className="h-3 w-3 text-gray-500" /> Timezone
                </Label>
                <Select 
                  disabled={!isEditing} 
                  value={formData.timezone} 
                  onValueChange={handleTimezoneChange}
                >
                  <SelectTrigger className={`h-9 text-sm ${isEditing ? 'border-gray-300 bg-gray-50' : ''}`}>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-2" />
      
      <div className="flex justify-end">
        {isEditing ? (
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              size="sm"
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              size="sm"
              className="text-xs h-8"
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => setIsEditing(true)}
            size="sm"
            className="text-xs h-8"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
} 