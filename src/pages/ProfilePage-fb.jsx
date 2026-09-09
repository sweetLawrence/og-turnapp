import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { User, Lock, Loader2, Facebook, Twitter, Instagram, Globe, Save } from 'lucide-react';
import api from '../services/apiClient';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    facebook: '',
    twitter: '',
    instagram: '',
    website: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const user = response.data.data.user;
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          facebook: user.social_links?.facebook || '',
          twitter: user.social_links?.twitter || '',
          instagram: user.social_links?.instagram || '',
          website: user.social_links?.website || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      const response = await api.put('/auth/profile', profileForm);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        // Update localStorage user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...response.data.data.user
        }));
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      const response = await api.put('/auth/password', passwordForm);
      
      if (response.data.success) {
        toast.success('Password updated successfully');
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Profile Settings</h1>
          <p className="text-zinc-400 text-sm">Manage your account information and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === 'profile' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className={`h-4 w-4 ${activeTab === 'profile' ? 'text-primary' : ''}`} />
            Profile Information
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === 'password' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Lock className={`h-4 w-4 ${activeTab === 'password' ? 'text-primary' : ''}`} />
            Password & Security
            {activeTab === 'password' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            )}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 space-y-6">
              
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.name ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name[0]}</p>}
                  </div>
                  
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary resize-none ${
                    errors.bio ? 'border-red-500' : 'border-zinc-800'
                  }`}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && <p className="text-xs text-red-400">{errors.bio[0]}</p>}
                  <p className="text-xs text-zinc-500 ml-auto">{profileForm.bio.length}/500</p>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Facebook className="h-3 w-3" /> Facebook
                    </label>
                    <input
                      type="url"
                      value={profileForm.facebook}
                      onChange={(e) => setProfileForm({ ...profileForm, facebook: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.facebook ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://facebook.com/yourpage"
                    />
                    {errors.facebook && <p className="text-xs text-red-400 mt-1">{errors.facebook[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Twitter className="h-3 w-3" /> Twitter
                    </label>
                    <input
                      type="url"
                      value={profileForm.twitter}
                      onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.twitter ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://twitter.com/yourhandle"
                    />
                    {errors.twitter && <p className="text-xs text-red-400 mt-1">{errors.twitter[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Instagram className="h-3 w-3" /> Instagram
                    </label>
                    <input
                      type="url"
                      value={profileForm.instagram}
                      onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.instagram ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://instagram.com/yourhandle"
                    />
                    {errors.instagram && <p className="text-xs text-red-400 mt-1">{errors.instagram[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Globe className="h-3 w-3" /> Website
                    </label>
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.website ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://yourwebsite.com"
                    />
                    {errors.website && <p className="text-xs text-red-400 mt-1">{errors.website[0]}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Ensure your account is using a long, random password to stay secure.
                </p>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.current_password ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="Enter current password"
                    />
                    {errors.current_password && <p className="text-xs text-red-400 mt-1">{errors.current_password[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.password ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="Enter new password (min 8 characters)"
                    />
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.password_confirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;