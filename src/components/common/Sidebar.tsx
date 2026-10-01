import React from 'react';
import {
  Home,
  Wallet,
  Users,
  MessageSquare,
  MessageCircle,
  Image,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  User,
  Settings,
  ShieldCheck,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { t } = useThemeLanguage();
  const { isAdmin } = useAuth();
  const { totals, settings } = useData();

  const mainLinks = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'fund', label: t('fund'), icon: Wallet },
    { id: 'members', label: t('members'), icon: Users },
    { id: 'feed', label: t('feed'), icon: MessageSquare },
    { id: 'chat', label: t('chat'), icon: MessageCircle },
    { id: 'receipts', label: t('receipts'), icon: FileText },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'notices', label: t('notices'), icon: Bell },
    { id: 'gallery', label: t('gallery'), icon: Image },
    { id: 'events', label: t('events'), icon: Calendar },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0">
      {/* Quick Fund Mini-widget */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-600/20 rounded-full blur-xl" />
        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block mb-1">
          {t('hajjGoal')}
        </span>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xl font-extrabold tracking-tight">
            {totals.hajjProgressPercent}%
          </span>
          <span className="text-xs text-emerald-200/80">
            {t('target')}: ৳{new Intl.NumberFormat('en-IN').format(settings.hajjGoalTarget || 1500000)}
          </span>
        </div>
        <div className="w-full bg-emerald-950/80 rounded-full h-2 overflow-hidden border border-emerald-700/50">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${totals.hajjProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Nav List */}
      <nav className="space-y-1 flex-1 overflow-y-auto smooth-scroll">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {t('home')}
        </p>

        {mainLinks.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Administration Section */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="px-3 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              {t('adminPanel')}
            </p>
            <button
              onClick={() => setCurrentTab('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                currentTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-md font-semibold'
                  : 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('adminPanel')}</span>
            </button>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCurrentTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              currentTab === 'profile'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('myProfile')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
              currentTab === 'settings'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('settings')}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
