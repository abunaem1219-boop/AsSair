import React from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Wallet,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { NotificationItem } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const { t, formatDate, language } = useThemeLanguage();

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deposit':
      case 'fund':
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      case 'event':
      case 'meeting':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'notice':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'chat':
      case 'feed':
        return <MessageSquare className="w-5 h-5 text-teal-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('notifications')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'bn'
            ? 'জমার নিশ্চিতকরণ, জরুরি নোটিশ এবং কাফেলার কার্যক্রমের বার্তা'
            : 'Activity reminders, deposit acknowledgments, and community notices'}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {language === 'bn' ? 'কোনো নোটিফিকেশন নেই।' : 'No notifications yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isRead = currentUser && n.readBy?.[currentUser.uid];

            return (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  !isRead
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-xs shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>{language === 'bn' ? 'প্রেরক' : 'From'}: {n.createdByName}</span>
                    {!isRead && (
                      <span className="text-emerald-600 font-bold">
                        {language === 'bn' ? 'নতুন বার্তা' : 'Unread'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
