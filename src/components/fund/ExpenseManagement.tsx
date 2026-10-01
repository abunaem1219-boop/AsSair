import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Calendar,
  AlertTriangle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Expense, ExpenseCategory } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface ExpenseManagementProps {
  onOpenAddExpense: () => void;
}

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({ onOpenAddExpense }) => {
  const { isAdmin } = useAuth();
  const { expenses, voidExpense } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expenseToVoid, setExpenseToVoid] = useState<Expense | null>(null);

  const categories: ExpenseCategory[] = [
    'Meeting',
    'Food',
    'Transport',
    'Office',
    'Emergency',
    'Investment',
    'Other',
  ];

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.paidTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalExpenseAmount = expenses
    .filter((e) => !e.voided)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const handleVoidConfirm = async (reason?: string) => {
    if (expenseToVoid) {
      await voidExpense(expenseToVoid.id, reason || 'Voided by Admin');
      setExpenseToVoid(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('expenseManagement')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সাংগঠনিক মাসিক খরচ, আপ্যায়ন, দাপ্তরিক ও জরুরি সহায়তার খতিয়ান'
              : 'Organizational operational and meeting expenses ledger'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addExpense')}</span>
          </button>
        )}
      </div>

      {/* Summary Highlight */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-rose-300 font-semibold block mb-1">
            {t('totalExpenses')}
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight">
            {formatCurrency(totalExpenseAmount)}
          </span>
        </div>
        <div className="p-3 bg-rose-950/60 rounded-2xl border border-rose-700/50">
          <CreditCard className="w-6 h-6 text-rose-300" />
        </div>
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
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-hidden"
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {t('noExpenses')}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">{t('purpose')}</th>
                  <th className="py-3.5 px-4">{t('expenseCategory')}</th>
                  <th className="py-3.5 px-4">{t('paymentDate')}</th>
                  <th className="py-3.5 px-4">{t('paidTo')}</th>
                  <th className="py-3.5 px-4 text-right">{t('amount')}</th>
                  {isAdmin && <th className="py-3.5 px-4 text-center">{t('voidDeposit')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      exp.voided ? 'opacity-50 bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-100 block">
                        {exp.purpose}
                      </span>
                      {exp.description && (
                        <span className="text-xs text-slate-400 line-clamp-1">{exp.description}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {exp.paidTo}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                      <span className={exp.voided ? 'line-through text-slate-400' : ''}>
                        {formatCurrency(exp.amount)}
                      </span>
                      {exp.voided && (
                        <span className="block text-[10px] text-slate-400 font-bold">
                          Voided ({exp.voidReason})
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        {!exp.voided && (
                          <button
                            onClick={() => setExpenseToVoid(exp)}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!expenseToVoid}
        onClose={() => setExpenseToVoid(null)}
        onConfirm={handleVoidConfirm}
        title="খরচ বাতিল করুন (Void Expense)"
        message={
          expenseToVoid
            ? `"${expenseToVoid.purpose}" বাবদ ৳${expenseToVoid.amount} খরচের এন্ট্রিটি বাতিল করতে চান?`
            : ''
        }
        confirmLabel={t('confirm')}
        isDangerous={true}
        requireReason={true}
      />
    </div>
  );
};
