import React, { useState } from 'react';
import {
  Bell,
  Pin,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Calendar,
  User,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Notice, NoticePriority } from '../../types';
import { Modal } from '../common/Modal';

interface NoticeBoardProps {
  onOpenCreateNotice: () => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ onOpenCreateNotice }) => {
  const { isAdmin } = useAuth();
  const { notices, togglePinNotice, deleteNotice } = useData();
  const { t, formatDate, language } = useThemeLanguage();

  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredNotices = notices.filter((n) =>
    priorityFilter === 'all' ? true : n.priority === priorityFilter
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('noticeBoard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'আস-সাইর সংগঠনের জরুরি ঘোষণা, সিদ্ধান্ত ও সাধারণ বিজ্ঞপ্তি'
              : 'Official organizational announcements and urgent alerts'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreateNotice}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('createNotice')}</span>
          </button>
        )}
      </div>

      {/* Priority Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 smooth-scroll">
        {[
          { id: 'all', label: language === 'bn' ? 'সকল বিজ্ঞপ্তি' : 'All' },
          { id: 'Emergency', label: t('emergencyPriority') },
          { id: 'Important', label: t('important') },
          { id: 'Normal', label: t('normal') },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setPriorityFilter(f.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              priorityFilter === f.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {t('noNotices')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((n) => {
            const isEmergency = n.priority === 'Emergency';
            const isImportant = n.priority === 'Important';

            return (
              <div
                key={n.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isEmergency
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                    : isImportant
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {n.isPinned && (
                        <span className="p-1 rounded-md bg-emerald-600 text-white text-[10px]">
                          <Pin className="w-3 h-3" />
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isEmergency
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isImportant
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {n.priority}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(n.date)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h3>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinNotice(n.id, !n.isPinned)}
                        className={`p-2 rounded-xl text-xs font-semibold ${
                          n.isPinned
                            ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={n.isPinned ? t('unpinNotice') : t('pinNotice')}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNotice(n.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-4">
                  {n.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{n.authorName}</span>
                  </span>
                  {n.expiryDate && (
                    <span>
                      {t('expiresOn')}: {formatDate(n.expiryDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
