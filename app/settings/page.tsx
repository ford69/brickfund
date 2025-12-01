'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Bell, 
  Settings, 
  User,
  Shield,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Save,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    timezone: 'GMT+0',
    currency: 'GHS',
    theme: 'light',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    investmentUpdates: true,
    projectUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    
    // Privacy Settings
    profileVisibility: 'private',
    showInvestments: false,
    showPortfolio: false,
    dataSharing: false,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordChangeRequired: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Show success message
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-700" />
              <span className="ml-2 text-2xl font-bold text-gray-900">BrickFund</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost">Browse Projects</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" title="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon" title="Profile">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Settings Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GMT+0">GMT+0 (London)</SelectItem>
                        <SelectItem value="GMT+1">GMT+1 (Paris)</SelectItem>
                        <SelectItem value="GMT-5">GMT-5 (New York)</SelectItem>
                        <SelectItem value="GMT+8">GMT+8 (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="currency">Display Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">Ghana Cedi (GHS)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Theme</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={() => handleSettingChange('theme', 'light')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        settings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => handleSettingChange('theme', 'dark')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        settings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Investment Updates</h5>
                          <p className="text-sm text-gray-600">Updates about your investments</p>
                        </div>
                        <Switch
                          checked={settings.investmentUpdates}
                          onCheckedChange={(checked) => handleSettingChange('investmentUpdates', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Project Updates</h5>
                          <p className="text-sm text-gray-600">Updates about projects you're invested in</p>
                        </div>
                        <Switch
                          checked={settings.projectUpdates}
                          onCheckedChange={(checked) => handleSettingChange('projectUpdates', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Marketing Emails</h5>
                          <p className="text-sm text-gray-600">Promotional emails and offers</p>
                        </div>
                        <Switch
                          checked={settings.marketingEmails}
                          onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Security Alerts</h5>
                          <p className="text-sm text-gray-600">Important security notifications</p>
                        </div>
                        <Switch
                          checked={settings.securityAlerts}
                          onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange('profileVisibility', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Investments</h4>
                        <p className="text-sm text-gray-600">Allow others to see your investments</p>
                      </div>
                      <Switch
                        checked={settings.showInvestments}
                        onCheckedChange={(checked) => handleSettingChange('showInvestments', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Portfolio</h4>
                        <p className="text-sm text-gray-600">Allow others to see your portfolio performance</p>
                      </div>
                      <Switch
                        checked={settings.showPortfolio}
                        onCheckedChange={(checked) => handleSettingChange('showPortfolio', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data Sharing</h4>
                        <p className="text-sm text-gray-600">Share anonymized data for platform improvement</p>
                      </div>
                      <Switch
                        checked={settings.dataSharing}
                        onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      checked={settings.loginAlerts}
                      onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />
                </div>

                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button onClick={handleSaveSettings} disabled={isLoading} className="px-8">
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}