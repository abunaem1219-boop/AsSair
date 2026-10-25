import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Moon,
  Sun,
  Shield,
  Cloud,
  Building,
  Phone,
  Mail,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { useThemeLanguage, StatusBarSpacing } from '../../context/ThemeLanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { INITIAL_SUPER_ADMIN_UID } from '../../firebase/config';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, t, theme, toggleTheme, statusBarSpacing, setStatusBarSpacing } = useThemeLanguage();
  const { isAdmin } = useAuth();
  const { settings, updateSettings } = useData();

  // Settings form states
  const [orgName, setOrgName] = useState(settings.orgName || 'আস-সাইর');
  const [orgTagline, setOrgTagline] = useState(settings.orgTagline || '');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(
    settings.cloudinaryCloudName || localStorage.getItem('as_sair_cloud_name') || 'as-sair-org'
  );
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(
    settings.cloudinaryUploadPreset || localStorage.getItem('as_sair_upload_preset') || 'as_sair_unsigned'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('as_sair_cloud_name', cloudinaryCloudName);
    localStorage.setItem('as_sair_upload_preset', cloudinaryUploadPreset);

    if (isAdmin) {
      await updateSettings({
        orgName,
        orgTagline,
        contactPhone,
        contactEmail,
        cloudinaryCloudName,
        cloudinaryUploadPreset,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('settings')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'bn'
            ? 'অ্যাপ্লিকেশন পছন্দসমূহ, ভাষা, থিম এবং ক্লাউড কনফিগারেশন'
            : 'Preferences, language, theme, and media integration setup'}
        </p>
      </div>

      {/* General Preferences (Theme & Language) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'সাধারণ পছন্দসমূহ' : 'General Preferences'}
        </h3>

        {/* Language switch */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-sm block text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'ভাষা নির্বাচন' : 'Language'}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'bn' ? 'বাংলা অথবা English' : 'Bengali or English'}
              </span>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'bn'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme switch */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <span className="font-bold text-sm block text-slate-800 dark:text-slate-200">
                {language === 'bn' ? 'অ্যাপ থিম' : 'Theme'}
              </span>
              <span className="text-xs text-slate-400">
                {theme === 'dark' ? 'ডার্ক মোড সক্রিয়' : 'লাইট মোড সক্রিয়'}
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Mobile Header / Status Bar Spacing */}
        <div className="py-2 space-y-2">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-sm block text-slate-800 dark:text-slate-200">
                {t('mobileHeaderSettings')}
              </span>
              <span className="text-xs text-slate-400">
                {t('mobileHeaderSettingsDesc')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { id: 'default', label: t('statusBarNormal') },
              { id: 'tall', label: t('statusBarTall') },
              { id: 'compact', label: t('statusBarCompact') },
              { id: 'none', label: t('statusBarNone') },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatusBarSpacing(option.id as StatusBarSpacing)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all border ${
                  statusBarSpacing === option.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cloudinary Media API & Organization Configuration (Admin Only - শুধুমাত্র অ্যাডমিনদের জন্য) */}
      {isAdmin ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{language === 'bn' ? 'ক্লাউডিনারি মিডিয়া আপলোড এপিআই' : 'Cloudinary Media Upload API'}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {language === 'bn' ? 'শুধুমাত্র অ্যাডমিন' : 'Admin Only'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn'
                    ? 'ফটো, ভিডিও ও রসিদ আপলোডের জন্য ক্লাউডিনারি আনসাইনড প্রিসেট কনফিগারেশন'
                    : 'Unsigned client-side preset for photos, notices, receipts, and media'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Cloudinary Cloud Name
                </label>
                <input
                  type="text"
                  value={cloudinaryCloudName}
                  onChange={(e) => setCloudinaryCloudName(e.target.value)}
                  placeholder="e.g. as-sair-org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Upload Preset (Unsigned)
                </label>
                <input
                  type="text"
                  value={cloudinaryUploadPreset}
                  onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                  placeholder="e.g. as_sair_unsigned"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Organization Logo & Identity */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {language === 'bn' ? 'সংগঠনের অফিসিয়াল মূল লোগো' : 'Official Main Logo'}
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="w-14 h-14 rounded-xl bg-white p-1 shadow-xs border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={settings.orgLogoUrl || '/logo.jpg'}
                      alt="As-Sair Logo"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      AS-SAIR FOUNDATION
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                      {language === 'bn' ? 'লোগো সফলভাবে সক্রিয় রয়েছে (/logo.jpg)' : 'Official logo active (/logo.jpg)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'bn' ? 'সংগঠনের নাম' : 'Organization Name'}
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'bn' ? 'ট্যাগলাইন / সাবটাইটেল' : 'Tagline / Subtitle'}
                  </label>
                  <input
                    type="text"
                    value={orgTagline}
                    onChange={(e) => setOrgTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'bn' ? 'যোগাযোগের মোবাইল' : 'Contact Phone'}
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Contact Email'}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!'}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'ক্লাউড স্টোরেজ ও মিডিয়া সেটিংস' : 'Cloud Storage & Media Settings'}</span>
          </div>
          <p>
            {language === 'bn'
              ? 'ক্লাউডিনারি এপিআই ও সেন্ট্রাল সিস্টেম কনফিগারেশন শুধুমাত্র অনুমোদিত অ্যাডমিনদের দ্বারা নিয়ন্ত্রিত হয়।'
              : 'Cloudinary API and central system configurations are strictly managed by authorized administrators.'}
          </p>
        </div>
      )}

      {/* System & Firebase Connection Information */}
      <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
        <span className="font-bold text-slate-700 dark:text-slate-300 block">
          Firebase Realtime Database & Auth Connected
        </span>
        <p>Project: as-sair | Database: as-sair-default-rtdb.firebaseio.com</p>
        <p className="font-mono text-[11px] pt-1">
          Super Admin Root: {INITIAL_SUPER_ADMIN_UID}
        </p>
      </div>
    </div>
  );
};
