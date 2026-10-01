import React, { useState } from 'react';
import {
  HandCoins,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Loan, LoanStatus } from '../../types';
import { Modal } from '../common/Modal';

interface LoanManagementProps {
  onOpenAddLoan: () => void;
}

export const LoanManagement: React.FC<LoanManagementProps> = ({ onOpenAddLoan }) => {
  const { isAdmin } = useAuth();
  const { loans, loanRepayments, totals, recordLoanRepayment } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState<Loan | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentMethod, setRepaymentMethod] = useState<'Cash' | 'Bank' | 'Mobile Banking'>('Cash');
  const [repaymentNote, setRepaymentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredLoans = loans.filter((l) =>
    l.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForRepayment) return;
    const amount = Number(repaymentAmount);
    if (!amount || amount <= 0) return;

    try {
      setSubmitting(true);
      await recordLoanRepayment(
        selectedLoanForRepayment.id,
        amount,
        repaymentMethod,
        repaymentNote
      );
      setSelectedLoanForRepayment(null);
      setRepaymentAmount('');
      setRepaymentNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case 'Fully Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {t('fullyPaid')}
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            {t('partiallyPaid')}
          </span>
        );
      case 'Overdue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 animate-pulse">
            {t('overdue')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            {t('active')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('loanManagement')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সদস্যদের পারস্পরিক সহযোগিতায় করযে হাসানা (বিনা সুদে ঋণ) পরিচালনা'
              : 'Interest-free mutual benevolent loan facility (Qard Hasan)'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddLoan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addLoan')}</span>
          </button>
        )}
      </div>

      {/* Summary Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            {language === 'bn' ? 'মোট ঋণ প্রদান' : 'Total Loans Given'}
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {formatCurrency(totals.totalLoansGiven)}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            {t('loanRepaid')}
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(totals.totalLoanRepayments)}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-900 to-amber-950 text-white shadow-md">
          <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block mb-1">
            {t('totalLoansOutstanding')}
          </span>
          <span className="text-2xl font-black tracking-tight">
            {formatCurrency(totals.totalOutstandingLoan)}
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
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-hidden"
        />
      </div>

      {/* Loans Grid / List */}
      {filteredLoans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {language === 'bn' ? 'কোনো ঋণের হিসাব পাওয়া যায়নি।' : 'No loan records found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLoans.map((loan) => {
            const percentPaid = Math.min(100, Math.round(((loan.paidAmount || 0) / loan.amount) * 100));
            return (
              <div
                key={loan.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {loan.borrowerName}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {formatDate(loan.date)} • {loan.purpose}
                      </span>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>

                  {/* Amounts breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">{t('loanAmount')}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {formatCurrency(loan.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">{t('paidAmount')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                        {formatCurrency(loan.paidAmount || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">{t('remainingAmount')}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                        {formatCurrency(loan.remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-3">
                    <span>{percentPaid}% {t('paid')}</span>
                    <span>{t('dueDate')}: {formatDate(loan.dueDate)}</span>
                  </div>
                </div>

                {isAdmin && loan.remainingAmount > 0 && (
                  <button
                    onClick={() => setSelectedLoanForRepayment(loan)}
                    className="w-full py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{t('recordRepayment')}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Record Repayment Modal */}
      {selectedLoanForRepayment && (
        <Modal
          isOpen={!!selectedLoanForRepayment}
          onClose={() => setSelectedLoanForRepayment(null)}
          title={t('recordRepayment')}
        >
          <form onSubmit={handleRepaymentSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 block">{t('borrower')}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {selectedLoanForRepayment.borrowerName}
              </span>
              <span className="text-xs text-rose-500 font-semibold block mt-1">
                {t('remainingAmount')}: {formatCurrency(selectedLoanForRepayment.remainingAmount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('amount')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedLoanForRepayment.remainingAmount}
                value={repaymentAmount}
                onChange={(e) => setRepaymentAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={repaymentMethod}
                onChange={(e) => setRepaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
              >
                <option value="Cash">{t('cash')}</option>
                <option value="Bank">{t('bank')}</option>
                <option value="Mobile Banking">{t('mobileBanking')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('reference')}
              </label>
              <input
                type="text"
                value={repaymentNote}
                onChange={(e) => setRepaymentNote(e.target.value)}
                placeholder="e.g. ১ম কিস্তি পরিশোধ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLoanForRepayment(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
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
