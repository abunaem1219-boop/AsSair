import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Filter,
  FileSpreadsheet,
  Wallet,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export const ReportsView: React.FC = () => {
  const { deposits, expenses, loans, investments, members, totals, settings } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [reportType, setReportType] = useState<
    'balanceSheet' | 'monthly' | 'yearly' | 'members' | 'expenses' | 'loans'
  >('balanceSheet');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Export to CSV helper
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'members') {
      csvContent += 'Member ID,Member Name,Role,Total Deposit,Status\n';
      members.forEach((m) => {
        const total = deposits
          .filter((d) => !d.voided && (d.memberId === m.memberId || d.memberId === m.id))
          .reduce((sum, d) => sum + Number(d.amount || 0), 0);
        csvContent += `"${m.memberId}","${m.name}","${m.role}","${total}","${m.status}"\n`;
      });
    } else if (reportType === 'expenses') {
      csvContent += 'Date,Purpose,Category,Paid To,Amount,Payment Method\n';
      expenses.forEach((e) => {
        if (!e.voided) {
          csvContent += `"${e.date}","${e.purpose}","${e.category}","${e.paidTo}","${e.amount}","${e.paymentMethod}"\n`;
        }
      });
    } else {
      csvContent += 'Receipt No,Member ID,Member Name,Month,Date,Amount,Method\n';
      deposits.forEach((d) => {
        if (!d.voided) {
          csvContent += `"${d.receiptNumber}","${d.memberId}","${d.memberName}","${d.month}","${d.paymentDate}","${d.amount}","${d.paymentMethod}"\n`;
        }
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `as_sair_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('reportsCenter')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'আস-সাইর তহবিলের স্বচ্ছ আর্থিক হিসাব বিবরণী ও নিরীক্ষা প্রতিবেদন'
              : 'Certified financial statements, ledgers, and audit reports'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('exportCSV')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print')}</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 smooth-scroll no-print">
        {[
          { id: 'balanceSheet', label: language === 'bn' ? 'ব্যালান্স শিট সারাংশ' : 'Balance Sheet' },
          { id: 'members', label: t('memberDepositMatrix') },
          { id: 'expenses', label: t('expenseReport') },
          { id: 'monthly', label: t('monthlyReport') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              reportType === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Document Header */}
        <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
          <h2 className="text-2xl font-black text-emerald-800 dark:text-emerald-400">
            {settings.orgName || 'আস-সাইর'}
          </h2>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
            {settings.orgTagline || 'Financial Management & Welfare Association'}
          </p>
          <div className="mt-3 inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
            {reportType === 'balanceSheet' && (language === 'bn' ? 'কেন্দ্রীয় ব্যালান্স শিট সারাংশ' : 'Central Balance Sheet Summary')}
            {reportType === 'members' && t('memberDepositMatrix')}
            {reportType === 'expenses' && t('expenseReport')}
            {reportType === 'monthly' && t('monthlyReport')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {t('printedOn')}: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* 1. BALANCE SHEET SUMMARY VIEW */}
        {reportType === 'balanceSheet' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assets / Inflows */}
              <div className="border border-emerald-200 dark:border-emerald-900 rounded-2xl p-5 bg-emerald-50/30 dark:bg-emerald-950/20">
                <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-4 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                  {language === 'bn' ? 'তহবিল ও সম্পদ (Assets)' : 'Assets & Fund Inflow'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('totalDeposits')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totals.totalDeposited)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('loanRepaid')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totals.totalLoanRepayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('investmentReturn')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totals.totalInvestmentReturns)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-emerald-700 dark:text-emerald-400">
                    <span>{t('cashBalance')}</span>
                    <span>{formatCurrency(totals.currentCashBalance)}</span>
                  </div>
                </div>
              </div>

              {/* Outstanding Receivables / Investments */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50 dark:bg-slate-800/40">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                  {language === 'bn' ? 'বকেয়া ও বিনিয়োগ (Receivables)' : 'Receivables & Investments'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('totalLoansOutstanding')}</span>
                    <span className="font-bold text-amber-600">{formatCurrency(totals.totalOutstandingLoan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('totalInvestments')}</span>
                    <span className="font-bold text-blue-600">{formatCurrency(totals.totalInvestmentPrincipal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('totalExpenses')}</span>
                    <span className="font-bold text-rose-600">{formatCurrency(totals.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900 dark:text-slate-100">
                    <span>{t('totalFund')} (Net Worth)</span>
                    <span>{formatCurrency(totals.totalNetFund)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hajj Progress Milestone */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-sm">
                  {t('hajjGoal')}: {totals.hajjProgressPercent}% {t('progress')}
                </span>
                <span className="text-slate-500">
                  {formatCurrency(totals.currentCashBalance)} / {formatCurrency(settings.hajjGoalTarget || 1500000)}
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        )}

        {/* 2. MEMBERS DEPOSIT MATRIX */}
        {reportType === 'members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b">
                <tr>
                  <th className="py-3 px-3">{t('memberId')}</th>
                  <th className="py-3 px-3">{t('fullName')}</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-right">{t('myTotalDeposit')}</th>
                  <th className="py-3 px-3 text-center">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => {
                  const total = deposits
                    .filter((d) => !d.voided && (d.memberId === m.memberId || d.memberId === m.id))
                    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
                  return (
                    <tr key={m.id}>
                      <td className="py-3 px-3 font-mono font-medium">{m.memberId}</td>
                      <td className="py-3 px-3 font-bold">{m.name}</td>
                      <td className="py-3 px-3 capitalize">{m.role}</td>
                      <td className="py-3 px-3 text-right font-black text-emerald-600">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. EXPENSES REPORT */}
        {reportType === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b">
                <tr>
                  <th className="py-3 px-3">{t('paymentDate')}</th>
                  <th className="py-3 px-3">{t('purpose')}</th>
                  <th className="py-3 px-3">{t('expenseCategory')}</th>
                  <th className="py-3 px-3">{t('paidTo')}</th>
                  <th className="py-3 px-3 text-right">{t('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses
                  .filter((e) => !e.voided)
                  .map((e) => (
                    <tr key={e.id}>
                      <td className="py-3 px-3">{formatDate(e.date)}</td>
                      <td className="py-3 px-3 font-bold">{e.purpose}</td>
                      <td className="py-3 px-3">{e.category}</td>
                      <td className="py-3 px-3">{e.paidTo}</td>
                      <td className="py-3 px-3 text-right font-black text-rose-600">
                        {formatCurrency(e.amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Area for Certified Reports */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-center text-xs text-slate-500">
          <div className="w-40 border-t border-slate-400 pt-2">
            <span>{language === 'bn' ? 'তহবিল পরিচালক' : 'Fund Administrator'}</span>
          </div>
          <div className="w-40 border-t border-slate-400 pt-2">
            <span>{language === 'bn' ? 'সভাপতি / আমীর' : 'Super Administrator'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
