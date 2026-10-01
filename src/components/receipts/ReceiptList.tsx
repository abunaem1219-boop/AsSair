import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Printer,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Receipt, Deposit } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

export const ReceiptList: React.FC = () => {
  const { receipts, deposits } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const months = Array.from(new Set(receipts.map((r) => r.month).filter(Boolean))).sort().reverse();

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === 'all' || r.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('receipts')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {language === 'bn'
            ? 'সকল জমার ভেরিফায়েড মানি রিসিট ও ভাউচার আর্কাইভ'
            : 'Archive of certified official payment receipts'}
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="all">{t('allMonths')}</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Receipt Cards / Table */}
      {filteredReceipts.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {t('noData')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map((rec) => (
            <div
              key={rec.receiptNumber}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    #{rec.receiptNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {rec.memberName}
                </h3>
                <span className="text-xs text-slate-400 block mb-3">
                  {rec.memberId} • {rec.month}
                </span>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl mb-3">
                  <span className="text-xs text-slate-500 font-medium">{t('amount')}</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(rec.amount)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>
                    {t('paymentDate')}: {formatDate(rec.paymentDate)}
                  </div>
                  <div>
                    {t('paymentMethod')}: {rec.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedReceipt(rec)}
                  className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('viewReceipt')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </div>
  );
};
