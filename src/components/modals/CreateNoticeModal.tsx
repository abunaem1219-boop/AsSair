import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Modal } from '../common/Modal';
import { NoticePriority } from '../../types';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({ isOpen, onClose }) => {
  const { createNotice } = useData();
  const { t, language } = useThemeLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('Normal');
  const [expiryDate, setExpiryDate] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      await createNotice({
        title: title.trim(),
        description: description.trim(),
        priority,
        date: new Date().toISOString().split('T')[0],
        expiryDate: expiryDate || undefined,
        isPinned,
      });
      onClose();
      setTitle('');
      setDescription('');
      setIsPinned(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('createNotice')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {language === 'bn' ? 'বিজ্ঞপ্তির শিরোনাম' : 'Notice Title'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. আগামী শুক্রবার বাদ জুমা বিশেষ সাধারণ সভা"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('priority')}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NoticePriority)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
            >
              <option value="Normal">{t('normal')}</option>
              <option value="Important">{t('important')}</option>
              <option value="Emergency">{t('emergencyPriority')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('expiresOn')} (ঐচ্ছিক)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {language === 'bn' ? 'বিজ্ঞপ্তির বিবরণ' : 'Description'} <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="বিজ্ঞপ্তির বিস্তারিত বক্তব্য..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pinCheck"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="rounded-md text-emerald-600 focus:ring-emerald-500 h-4 w-4"
          />
          <label htmlFor="pinCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {language === 'bn' ? 'হোম পেজে পিন করে রাখুন' : 'Pin to Home Dashboard'}
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
          >
            {submitting ? t('loading') : t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
