import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Shield,
  KeyRound,
  LogOut,
  Edit2,
  Check,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { useData } from '../../context/DataContext';
import { uploadMediaToCloudinary } from '../../services/cloudinary';

export const UserProfileView: React.FC = () => {
  const { currentUser, userProfile, logout, updateUserProfileData, updateUserPassword } = useAuth();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();
  const { settings } = useData();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
        <p className="text-sm font-semibold">{t('mustLogin')}</p>
      </div>
    );
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfileData({
      displayName: displayName.trim(),
      phone: phone.trim(),
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    try {
      await updateUserPassword(newPassword);
      setPasswordStatus('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
      setNewPassword('');
    } catch (err: any) {
      setPasswordStatus(`ত্রুটি: ${err.message || 'Error updating password'}`);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const res = await uploadMediaToCloudinary(
        file,
        settings.cloudinaryCloudName,
        settings.cloudinaryUploadPreset
      );
      await updateUserProfileData({ photoURL: res.url });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with Upload trigger */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-emerald-700 text-white flex items-center justify-center font-bold text-3xl overflow-hidden shadow-md">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userProfile?.displayName?.charAt(0) || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md transition-transform group-hover:scale-110">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {userProfile?.displayName || 'Member'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit mx-auto sm:mx-0">
                {userProfile?.role}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono font-medium">
              ID: {userProfile?.memberId || 'AS-001'}
            </p>

            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser.email}</span>
              </span>
              {userProfile?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{userProfile.phone}</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title={t('edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Total Deposited Mini Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-800 border border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                {t('myTotalDeposit')}
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {formatCurrency(userProfile?.totalDeposit || 0)}
              </span>
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(userProfile?.joinDate || '')}</span>
          </span>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
            {language === 'bn' ? 'ব্যক্তিগত তথ্য পরিবর্তন' : 'Edit Profile Information'}
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
          {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {language === 'bn' ? 'নতুন ও সুরক্ষিত পাসওয়ার্ড সেট করুন' : 'Update your Firebase Auth account password'}
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {passwordStatus && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {passwordStatus}
            </p>
          )}

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold shadow-xs hover:bg-slate-900 transition-colors"
          >
            {language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('logout')}</span>
      </button>
    </div>
  );
};
