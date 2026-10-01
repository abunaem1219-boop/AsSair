import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  HandCoins,
  Briefcase,
  User,
  Eye,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Deposit, PaymentMethod } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface FundManagementProps {
  onOpenAddDeposit: () => void;
  onOpenAddExpense: () => void;
  onOpenAddLoan: () => void;
  onOpenAddInvestment: () => void;
}

export const FundManagement: React.FC<FundManagementProps> = ({
  onOpenAddDeposit,
  onOpenAddExpense,
  onOpenAddLoan,
  onOpenAddInvestment,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { deposits, totals, members, voidDeposit } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'deposits' | 'personal'>('deposits');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDepositForReceipt, setSelectedDepositForReceipt] = useState<Deposit | null>(null);
  const [depositToVoid, setDepositToVoid] = useState<Deposit | null>(null);

  // Filter months from deposits
  const availableMonths = Array.from(new Set(deposits.map((d) => d.month).filter(Boolean))).sort().reverse();

  // Filtered deposits
  const filteredDeposits = deposits.filter((dep) => {
    const matchesSearch =
      dep.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === 'all' || dep.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  // User's personal deposits
  const userMemberId = userProfile?.memberId;
  const personalDeposits = deposits.filter(
    (d) =>
      !d.voided &&
      (d.createdByUid === currentUser?.uid ||
        (userMemberId && d.memberId === userMemberId) ||
        (userProfile?.displayName && d.memberName.toLowerCase() === userProfile.displayName.toLowerCase()))
  );

  const personalTotal = personalDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const currentYear = new Date().getFullYear().toString();
  const personalThisYear = personalDeposits
    .filter((d) => d.month?.startsWith(currentYear))
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const hasPaidCurrentMonth = personalDeposits.some((d) => d.month === currentMonthKey);

  const handleVoidConfirm = async (reason?: string) => {
    if (depositToVoid) {
      await voidDeposit(depositToVoid.id, reason || 'Voided by Admin');
      setDepositToVoid(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('fund')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'আস-সাইর কেন্দ্রীয় তহবিলের পরিপূর্ণ জমা, খরচ, ঋণ ও বিনিয়োগের হিসাব'
              : 'Complete financial management and ledger calculations'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddDeposit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addDeposit')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-tab navigation (All Deposits vs My Personal Savings) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('deposits')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'deposits'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('depositList')}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {deposits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('personal')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'personal'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t('mySavings')}</span>
        </button>
      </div>

      {/* VIEW 1: ALL DEPOSITS */}
      {activeSubTab === 'deposits' && (
        <div className="space-y-4">
          {/* Search & Month Filter */}
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
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deposits Card List / Responsive Table */}
          {filteredDeposits.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              {t('noDeposits')}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">{t('receiptNo')}</th>
                      <th className="py-3.5 px-4">{t('member')}</th>
                      <th className="py-3.5 px-4">{t('month')}</th>
                      <th className="py-3.5 px-4">{t('paymentDate')}</th>
                      <th className="py-3.5 px-4">{t('paymentMethod')}</th>
                      <th className="py-3.5 px-4 text-right">{t('amount')}</th>
                      <th className="py-3.5 px-4 text-center">{t('receipts')}</th>
                      {isAdmin && <th className="py-3.5 px-4 text-center">{t('voidDeposit')}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDeposits.map((dep) => (
                      <tr
                        key={dep.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          dep.voided ? 'opacity-50 bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-xs text-slate-600 dark:text-slate-300">
                          {dep.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">
                            {dep.memberName}
                          </span>
                          <span className="text-[11px] text-slate-400">{dep.memberId}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {dep.month}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(dep.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {dep.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                          <span className={dep.voided ? 'line-through text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {formatCurrency(dep.amount)}
                          </span>
                          {dep.voided && (
                            <span className="block text-[10px] text-rose-500 font-bold">
                              Voided ({dep.voidReason})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedDepositForReceipt(dep)}
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                            title={t('viewReceipt')}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t('viewReceipt')}</span>
                          </button>
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center">
                            {!dep.voided && (
                              <button
                                onClick={() => setDepositToVoid(dep)}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title={t('voidDeposit')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MEMBER PERSONAL FUND */}
      {activeSubTab === 'personal' && (
        <div className="space-y-6">
          {/* Personal Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md">
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold block mb-1">
                {t('myTotalDeposit')}
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {formatCurrency(personalTotal)}
              </span>
              <span className="text-xs text-emerald-200/80 block mt-1">
                {personalDeposits.length} {t('totalPaymentsCount')}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                {t('thisYearDeposit')} ({currentYear})
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {formatCurrency(personalThisYear)}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                {t('currentMonthStatus')} ({currentMonthKey})
              </span>
              <div className="flex items-center gap-2 mt-2">
                {hasPaidCurrentMonth ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t('paid')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {t('due')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Transaction History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              {t('paymentHistory')}
            </h3>

            {personalDeposits.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                {t('noDeposits')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {personalDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {dep.month}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {t('paid')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {formatDate(dep.paymentDate)} • {dep.paymentMethod} • #{dep.receiptNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(dep.amount)}
                      </span>
                      <button
                        onClick={() => setSelectedDepositForReceipt(dep)}
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold"
                        title={t('viewReceipt')}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedDepositForReceipt}
        onClose={() => setSelectedDepositForReceipt(null)}
        deposit={selectedDepositForReceipt}
      />

      {/* Void Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!depositToVoid}
        onClose={() => setDepositToVoid(null)}
        onConfirm={handleVoidConfirm}
        title={t('voidDeposit')}
        message={
          depositToVoid
            ? `${depositToVoid.memberName}-এর ৳${depositToVoid.amount} (${depositToVoid.month}) জমার রসিদটি বাতিল করতে চান?`
            : ''
        }
        confirmLabel={t('voidDeposit')}
        isDangerous={true}
        requireReason={true}
      />
    </div>
  );
};
