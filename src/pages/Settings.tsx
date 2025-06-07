import { useState } from 'react';
import { User, CreditCard, Lock, Bell, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    role: ''
  });
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    alert('Profile updated!');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <nav className="flex flex-col">
              <button
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'profile' 
                    ? 'bg-primary/5 border-l-2 border-primary text-primary' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
              <button
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'billing' 
                    ? 'bg-primary/5 border-l-2 border-primary text-primary' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('billing')}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Billing
              </button>
              <button
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'security' 
                    ? 'bg-primary/5 border-l-2 border-primary text-primary' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Lock className="h-5 w-5 mr-2" />
                Security
              </button>
              <button
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'notifications' 
                    ? 'bg-primary/5 border-l-2 border-primary text-primary' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </button>
              <button
                className="flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-2xl">
                        {profileData.name.charAt(0) || profileData.email.charAt(0) || 'U'}
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          Change avatar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                      
                      <Input
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                      
                      <Input
                        label="Company (Optional)"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        placeholder="Enter your company name"
                      />
                      
                      <Input
                        label="Role (Optional)"
                        value={profileData.role}
                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        placeholder="Enter your job title"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'billing' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Current Plan</h3>
                      <p className="text-sm text-gray-600">Free Trial (5 days remaining)</p>
                    </div>
                    <Button>
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Payment Methods</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-3">No payment methods added yet</p>
                      <Button variant="outline">
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Billing History</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-gray-600">No billing history available</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Change Password</h3>
                    <form>
                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          placeholder="Enter current password"
                        />
                        
                        <Input
                          label="New Password"
                          type="password"
                          placeholder="Enter new password"
                        />
                        
                        <Input
                          label="Confirm New Password"
                          type="password"
                          placeholder="Confirm new password"
                        />
                        
                        <div className="flex justify-end">
                          <Button>
                            Update Password
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Two-Factor Authentication</h3>
                    <p className="text-gray-600 mb-3">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Email Notifications</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Blueprint Processing</p>
                          <p className="text-sm text-gray-600">Get notified when your blueprint is ready for analysis</p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input type="checkbox" id="toggle-1" className="sr-only" checked />
                          <label htmlFor="toggle-1" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                            <span className="block h-6 w-6 rounded-full bg-white shadow transform translate-x-4"></span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Team Activity</p>
                          <p className="text-sm text-gray-600">Get notified about team comments and shares</p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input type="checkbox" id="toggle-2" className="sr-only" checked />
                          <label htmlFor="toggle-2" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                            <span className="block h-6 w-6 rounded-full bg-white shadow transform translate-x-4"></span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing</p>
                          <p className="text-sm text-gray-600">Receive product updates and promotional offers</p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input type="checkbox" id="toggle-3" className="sr-only" />
                          <label htmlFor="toggle-3" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                            <span className="block h-6 w-6 rounded-full bg-white shadow"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;