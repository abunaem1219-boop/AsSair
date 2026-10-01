import React, { useState } from 'react';
import {
  Bell,
  Globe,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCheck,
  Menu,
  X,
  CreditCard,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenLogin }) => {
  const { currentUser, userProfile, role, isAdmin, isSuperAdmin, logout } = useAuth();
  const { language, setLanguage, t, theme, toggleTheme } = useThemeLanguage();
  const { notifications, markNotificationAsRead, settings } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Unread notifications count for current user
  const unreadCount = notifications.filter(
    (n) => !currentUser || !n.readBy?.[currentUser.uid]
  ).length;

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
          Super Admin
        </span>
      );
    }
    if (isAdmin) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          Admin
        </span>
      );
    }
    if (role === 'moderator') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
          Moderator
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/20 text-emerald-100">
        Member
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center font-serif text-emerald-300 text-xl font-black">
                س
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  {settings.orgName || t('appName')}
                </span>
                {currentUser && getRoleBadge()}
              </div>
              <p className="text-[11px] text-emerald-200/80 -mt-1 hidden sm:block">
                {t('appSubTitle')}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher Button (বাংলা | English) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-xs font-semibold text-emerald-100 transition-all border border-emerald-700/50"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 transition-all border border-emerald-700/50"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 transition-all relative border border-emerald-700/50"
                title={t('notifications')}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Bell className="w-4 h-4" /> {t('notifications')}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {unreadCount} {language === 'bn' ? 'নতুন' : 'new'}
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 smooth-scroll">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        {t('noData')}
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => {
                        const isRead = currentUser && n.readBy?.[currentUser.uid];
                        return (
                          <div
                            key={n.id}
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                              !isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setCurrentTab('notifications');
                      }}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 transition-all border border-emerald-700/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.displayName?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] truncate hidden md:block">
                    {userProfile?.displayName || 'User'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {userProfile?.displayName || currentUser.displayName || 'Member'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1.5">{getRoleBadge()}</div>
                    </div>

                    <div className="p-1 text-xs">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setCurrentTab('profile');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                        <span>{t('myProfile')}</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setCurrentTab('admin');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left text-emerald-700 dark:text-emerald-400 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{t('adminPanel')}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setCurrentTab('settings');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-500" />
                        <span>{t('settings')}</span>
                      </button>
                    </div>

                    <div className="p-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-emerald-950 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
