import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  HandCoins,
  Briefcase,
  Target,
  PlusCircle,
  FileText,
  AlertTriangle,
  Pin,
  Calendar,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Notice, Deposit } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

interface HomeDashboardProps {
  setCurrentTab: (tab: string) => void;
  onOpenAddDeposit: () => void;
  onOpenAddExpense: () => void;
  onOpenCreateNotice: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setCurrentTab,
  onOpenAddDeposit,
  onOpenAddExpense,
  onOpenCreateNotice,
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { totals, notices, deposits, expenses, settings, deleteNotice, togglePinNotice } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [selectedDepositForReceipt, setSelectedDepositForReceipt] = useState<Deposit | null>(null);

  // Group monthly deposits and expenses for dynamic chart
  const monthlyData = React.useMemo(() => {
    const monthsMap: Record<string, { month: string; deposit: number; expense: number }> = {};
    const now = new Date();
    // Pre-populate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsMap[key] = { month: key, deposit: 0, expense: 0 };
    }

    deposits.forEach((dep) => {
      if (!dep.voided && dep.month && monthsMap[dep.month]) {
        monthsMap[dep.month].deposit += Number(dep.amount || 0);
      }
    });

    expenses.forEach((exp) => {
      if (!exp.voided && exp.date) {
        const monthKey = exp.date.substring(0, 7);
        if (monthsMap[monthKey]) {
          monthsMap[monthKey].expense += Number(exp.amount || 0);
        }
      }
    });

    return Object.values(monthsMap);
  }, [deposits, expenses]);

  // Max value for scaling SVG chart
  const maxChartVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.deposit, m.expense)),
    10000
  );

  // Active notices (not expired or no expiry date)
  const activeNotices = notices.filter((n) => {
    if (!n.expiryDate) return true;
    return new Date(n.expiryDate).getTime() >= new Date().setHours(0, 0, 0, 0);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-700/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{settings.orgTagline || t('appSubTitle')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'bn' ? 'আসসালামু আলাইকুম,' : 'Assalamu Alaikum,'}{' '}
              <span className="text-emerald-300">
                {userProfile?.displayName || currentUser?.displayName || (language === 'bn' ? 'সম্মানিত সদস্য' : 'Brother')}
              </span>
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Personal Quick Status if logged in */}
          {currentUser && (
            <div className="bg-emerald-950/70 border border-emerald-700/60 p-4 rounded-2xl shrink-0 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center text-emerald-200">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-300 uppercase tracking-wider block font-semibold">
                  {t('myTotalDeposit')}
                </span>
                <span className="text-xl font-bold tracking-tight text-white">
                  {formatCurrency(userProfile?.totalDeposit || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hajj Goal Progress Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t('hajjGoal')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'কাফেলা সদস্যদের সম্মিলিত পবিত্র হজ্জযাত্রার জন্য বিশেষ সঞ্চয় লক্ষ্যমাত্রা'
                  : 'Long-term goal for organizational group Hajj journey'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totals.hajjProgressPercent}%
            </span>
            <span className="text-xs text-slate-400 block font-medium">
              {t('progress')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${totals.hajjProgressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block">{t('cashBalance')}:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {formatCurrency(totals.currentCashBalance)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">{t('target')}:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {formatCurrency(settings.hajjGoalTarget || 1500000)}
            </span>
          </div>
        </div>
      </div>

      {/* Main 6 Financial Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {/* 1. Total Fund */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('totalFund')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totals.totalNetFund)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
            {language === 'bn' ? 'নগদ + ঋণ + বিনিয়োগ' : 'Cash + Loans + Investments'}
          </span>
        </div>

        {/* 2. Current Cash Balance */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {t('cashBalance')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
            {formatCurrency(totals.currentCashBalance)}
          </p>
          <span className="text-[11px] text-emerald-600/90 dark:text-emerald-400 font-medium mt-1 block">
            {language === 'bn' ? 'হাতে নগদ স্থিতি' : 'Available Liquid Balance'}
          </span>
        </div>

        {/* 3. Total Deposits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('totalDeposits')}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totals.totalDeposited)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {deposits.filter((d) => !d.voided).length} {language === 'bn' ? 'টি জমা রসিদ' : 'valid deposits'}
          </span>
        </div>

        {/* 4. Total Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('totalExpenses')}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totals.totalExpenses)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {expenses.filter((e) => !e.voided).length} {language === 'bn' ? 'টি ভাউচার' : 'vouchers'}
          </span>
        </div>

        {/* 5. Total Loans Outstanding */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('totalLoansOutstanding')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totals.totalOutstandingLoan)}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 block">
            {language === 'bn' ? 'করযে হাসানা' : 'Outstanding Qard'}
          </span>
        </div>

        {/* 6. Total Investments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('totalInvestments')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totals.totalInvestmentPrincipal)}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 block">
            {language === 'bn' ? `মুনাফা: ${formatCurrency(totals.totalInvestmentReturns)}` : `Returns: ${formatCurrency(totals.totalInvestmentReturns)}`}
          </span>
        </div>
      </div>

      {/* Quick Action Shortcuts for Admin/Members */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {isAdmin && (
          <>
            <button
              onClick={onOpenAddDeposit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addDeposit')}</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addExpense')}</span>
            </button>
            <button
              onClick={onOpenCreateNotice}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>{t('createNotice')}</span>
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentTab('fund')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all ml-auto"
        >
          <span>{t('viewDetails')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Notice Board Section (Important / Emergency on Home) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {t('noticeBoard')}
            </h3>
          </div>
          <button
            onClick={() => setCurrentTab('notices')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t('viewDetails')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeNotices.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {t('noNotices')}
          </div>
        ) : (
          <div className="space-y-3">
            {activeNotices.slice(0, 3).map((notice) => {
              const isEmergency = notice.priority === 'Emergency';
              const isImportant = notice.priority === 'Important';
              return (
                <div
                  key={notice.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEmergency
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                      : isImportant
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {notice.isPinned && (
                          <span className="p-1 rounded-md bg-emerald-600 text-white text-[10px]">
                            <Pin className="w-3 h-3" />
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isEmergency
                              ? 'bg-rose-600 text-white animate-pulse'
                              : isImportant
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {notice.priority === 'Emergency'
                            ? t('emergencyPriority')
                            : notice.priority === 'Important'
                            ? t('important')
                            : t('normal')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(notice.date)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {notice.description}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePinNotice(notice.id, !notice.isPinned)}
                          className={`p-1.5 rounded-lg text-xs ${
                            notice.isPinned
                              ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={notice.isPinned ? t('unpinNotice') : t('pinNotice')}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fund Growth Dynamic Chart & Monthly Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {t('fundGrowthChart')}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? 'বিগত মাসসমূহের জমা ও খরচের তুলনামূলক গ্রাফ' : 'Deposit vs Expense comparison across months'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
              {t('monthlyDeposits')}
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" />
              {t('monthlyExpenses')}
            </span>
          </div>
        </div>

        {/* Dynamic Responsive SVG Bar Chart */}
        <div className="h-56 w-full flex items-end gap-2 sm:gap-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 px-2">
          {monthlyData.map((item, idx) => {
            const depositHeight = Math.max(8, Math.round((item.deposit / maxChartVal) * 160));
            const expenseHeight = Math.max(8, Math.round((item.expense / maxChartVal) * 160));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
                <div className="flex items-end gap-1 sm:gap-2 w-full justify-center">
                  {/* Deposit Bar */}
                  <div
                    className="w-3.5 sm:w-8 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-md transition-all duration-500 relative group-hover:brightness-110"
                    style={{ height: `${depositHeight}px` }}
                    title={`${t('monthlyDeposits')}: ${formatCurrency(item.deposit)}`}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-md pointer-events-none whitespace-nowrap z-20">
                      {formatCurrency(item.deposit)}
                    </div>
                  </div>

                  {/* Expense Bar */}
                  <div
                    className="w-3.5 sm:w-8 bg-gradient-to-t from-rose-700 to-rose-400 rounded-t-md transition-all duration-500 relative group-hover:brightness-110"
                    style={{ height: `${expenseHeight}px` }}
                    title={`${t('monthlyExpenses')}: ${formatCurrency(item.expense)}`}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-md pointer-events-none whitespace-nowrap z-20">
                      {formatCurrency(item.expense)}
                    </div>
                  </div>
                </div>

                {/* Month label */}
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {language === 'bn' ? 'সাম্প্রতিক জমার তালিকা' : 'Recent Deposits'}
          </h3>
          <button
            onClick={() => setCurrentTab('fund')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('viewDetails')}
          </button>
        </div>

        {deposits.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {t('noDeposits')}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {deposits.slice(0, 5).map((dep) => (
              <div
                key={dep.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {dep.memberName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {dep.memberName}{' '}
                      <span className="text-xs font-normal text-slate-400">({dep.month})</span>
                    </h4>
                    <span className="text-xs text-slate-400">
                      {formatDate(dep.paymentDate)} • {dep.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <span
                      className={`text-sm font-black ${
                        dep.voided ? 'line-through text-slate-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatCurrency(dep.amount)}
                    </span>
                    {dep.voided && (
                      <span className="text-[10px] text-rose-500 font-bold block">Voided</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedDepositForReceipt(dep)}
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-medium"
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

      {/* Official Receipt Modal preview */}
      <ReceiptModal
        isOpen={!!selectedDepositForReceipt}
        onClose={() => setSelectedDepositForReceipt(null)}
        deposit={selectedDepositForReceipt}
      />
    </div>
  );
};
