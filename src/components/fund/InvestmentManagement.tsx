import React, { useState } from 'react';
import {
  Briefcase,
  PlusCircle,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Investment, InvestmentStatus } from '../../types';
import { Modal } from '../common/Modal';

interface InvestmentManagementProps {
  onOpenAddInvestment: () => void;
}

export const InvestmentManagement: React.FC<InvestmentManagementProps> = ({ onOpenAddInvestment }) => {
  const { isAdmin } = useAuth();
  const { investments, investmentReturns, totals, recordInvestmentReturn } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvForReturn, setSelectedInvForReturn] = useState<Investment | null>(null);
  const [returnAmount, setReturnAmount] = useState('');
  const [profitAmount, setProfitAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredInvestments = investments.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.businessOrOrg.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvForReturn) return;
    const retAmt = Number(returnAmount) || 0;
    const profAmt = Number(profitAmount) || 0;
    if (retAmt <= 0 && profAmt <= 0) return;

    try {
      setSubmitting(true);
      await recordInvestmentReturn(selectedInvForReturn.id, retAmt, profAmt, notes);
      setSelectedInvForReturn(null);
      setReturnAmount('');
      setProfitAmount('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('investmentManagement')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'তহবিল বৃদ্ধির লক্ষ্যে হালাল ব্যবসায়িক বিনিয়োগ ও অংশীদারিত্বের হিসাব'
              : 'Halal business partnerships and capital investment portfolio'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddInvestment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addInvestment')}</span>
          </button>
        )}
      </div>

      {/* Summary Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            {t('totalInvestments')}
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {formatCurrency(totals.totalInvestmentPrincipal)}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-900 to-blue-950 text-white shadow-md">
          <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold block mb-1">
            {t('investmentReturn')}
          </span>
          <span className="text-2xl font-black tracking-tight">
            {formatCurrency(totals.totalInvestmentReturns)}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
        />
      </div>

      {/* Investments List */}
      {filteredInvestments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {language === 'bn' ? 'কোনো বিনিয়োগ রেকর্ড পাওয়া যায়নি।' : 'No investment records found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInvestments.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {inv.name}
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3 text-blue-500" />
                      {inv.businessOrOrg} • {formatDate(inv.date)}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {inv.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{inv.purpose}</p>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">{t('amount')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {formatCurrency(inv.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">{t('actualReturn')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatCurrency(inv.actualReturn || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">{t('profit')}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                      {formatCurrency(inv.profit || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {isAdmin && inv.status !== 'Completed' && (
                <button
                  onClick={() => setSelectedInvForReturn(inv)}
                  className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{t('recordReturn')}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Return Modal */}
      {selectedInvForReturn && (
        <Modal
          isOpen={!!selectedInvForReturn}
          onClose={() => setSelectedInvForReturn(null)}
          title={t('recordReturn')}
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 block">{t('businessOrg')}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {selectedInvForReturn.name} ({selectedInvForReturn.businessOrOrg})
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('actualReturn')} (মূলধন ফেরত)
              </label>
              <input
                type="number"
                min="0"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('profit')} (নীট লভ্যাংশ)
              </label>
              <input
                type="number"
                min="0"
                value={profitAmount}
                onChange={(e) => setProfitAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('reference')}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. ১ম ত্রৈমাসিক লভ্যাংশ বিতরণ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedInvForReturn(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                {submitting ? t('loading') : t('confirm')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
