import React, { useState } from 'react';
import {
  Home,
  Wallet,
  Users,
  MessageSquare,
  MessageCircle,
  MoreHorizontal,
  Image,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  User,
  Settings,
  ShieldCheck,
  History,
  X,
} from 'lucide-react';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenLogin,
}) => {
  const { t } = useThemeLanguage();
  const { currentUser, isAdmin } = useAuth();
  const { notifications } = useData();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const unreadNotifications = notifications.filter(
    (n) => !currentUser || !n.readBy?.[currentUser.uid]
  ).length;

  const navItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'fund', label: t('fund'), icon: Wallet },
    { id: 'members', label: t('members'), icon: Users },
    { id: 'feed', label: t('feed'), icon: MessageSquare },
    { id: 'chat', label: t('chat'), icon: MessageCircle },
  ];

  const moreItems = [
    { id: 'gallery', label: t('gallery'), icon: Image },
    { id: 'events', label: t('events'), icon: Calendar },
    { id: 'receipts', label: t('receipts'), icon: FileText },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'notices', label: t('notices'), icon: Bell },
    { id: 'profile', label: t('myProfile'), icon: User },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  if (isAdmin) {
    moreItems.unshift({
      id: 'admin',
      label: t('adminPanel'),
      icon: ShieldCheck,
    });
  }

  const handleSelectTab = (id: string) => {
    setShowMoreMenu(false);
    setCurrentTab(id);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Fixed at bottom on <md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-2xl">
        <div className="grid grid-cols-6 h-16 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? 'bg-emerald-100/80 dark:bg-emerald-950/60' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 truncate max-w-[50px]">{item.label}</span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              showMoreMenu || ['gallery', 'events', 'receipts', 'reports', 'notices', 'profile', 'settings', 'admin'].includes(currentTab)
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <div className="p-1 rounded-xl">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{t('more')}</span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet Modal */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl p-6 z-10 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {t('more')}
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl mb-1.5 ${
                        item.id === 'admin'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
