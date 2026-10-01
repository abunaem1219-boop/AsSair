import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Wallet,
  CreditCard,
  HandCoins,
  Briefcase,
  Bell,
  FileText,
  Clock,
  Send,
  PlusCircle,
  TrendingUp,
  History,
  KeyRound,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Role } from '../../types';
import { INITIAL_SUPER_ADMIN_UID } from '../../firebase/config';

interface AdminDashboardProps {
  onOpenAddDeposit: () => void;
  onOpenAddExpense: () => void;
  onOpenAddLoan: () => void;
  onOpenAddInvestment: () => void;
  onOpenAddMember: () => void;
  onOpenCreateNotice: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenAddDeposit,
  onOpenAddExpense,
  onOpenAddLoan,
  onOpenAddInvestment,
  onOpenAddMember,
  onOpenCreateNotice,
}) => {
  const { currentUser, role, isSuperAdmin } = useAuth();
  const {
    totals,
    members,
    deposits,
    expenses,
    loans,
    investments,
    auditLogs,
    settings,
    updateSettings,
    sendNotification,
    updateMember,
  } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'audit' | 'roles' | 'notifications' | 'hajjSetup'>('overview');

  // Notification sender states
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all' | 'role' | 'member'>('all');
  const [notifTargetRole, setNotifTargetRole] = useState<Role>('member');
  const [notifSending, setNotifSending] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Hajj Goal & Contribution Setting form
  const [hajjGoalInput, setHajjGoalInput] = useState(settings.hajjGoalTarget?.toString() || '1500000');
  const [monthlyContributionInput, setMonthlyContributionInput] = useState(settings.defaultMonthlyContribution?.toString() || '1000');
  const [savingSettings, setSavingSettings] = useState(false);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    try {
      setNotifSending(true);
      await sendNotification({
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: 'admin',
        targetType: notifTarget,
        targetRole: notifTarget === 'role' ? notifTargetRole : undefined,
      });
      setNotifTitle('');
      setNotifMessage('');
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 3000);
    } finally {
      setNotifSending(false);
    }
  };

  const handleSaveHajjSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await updateSettings({
        hajjGoalTarget: Number(hajjGoalInput) || 1500000,
        defaultMonthlyContribution: Number(monthlyContributionInput) || 1000,
      });
      alert(language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings updated successfully!');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl shadow-xl border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {t('adminPanel')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-amber-950">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'কেন্দ্রীয় আর্থিক ও সাংগঠনিক পরিচালনা ড্যাশবোর্ড'
                  : 'Central administrative and financial oversight system'}
              </p>
            </div>
          </div>

          {currentUser?.uid === INITIAL_SUPER_ADMIN_UID && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-900/40 border border-amber-500/40 text-[11px] text-amber-300 font-semibold">
              ⭐ Root Super Admin UID Active
            </div>
          )}
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 smooth-scroll">
        {[
          { id: 'overview', label: language === 'bn' ? 'ড্যাশবোর্ড ওভারভিউ' : 'Overview', icon: Sliders },
          { id: 'audit', label: t('auditLogs'), icon: History },
          { id: 'roles', label: t('rolesPermissions'), icon: KeyRound },
          { id: 'notifications', label: language === 'bn' ? 'নোটিফিকেশন প্রেরণ' : 'Broadcasts', icon: Bell },
          { id: 'hajjSetup', label: language === 'bn' ? 'হজ্জ লক্ষ্য ও সেটিংস' : 'Hajj Goal Setup', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeAdminTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & QUICK ACTIONS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Action Buttons Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {language === 'bn' ? 'কুইক অ্যাকশন (Quick Actions)' : 'Quick Actions'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={onOpenAddDeposit}
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>{t('addDeposit')}</span>
              </button>

              <button
                onClick={onOpenAddExpense}
                className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-rose-600" />
                <span>{t('addExpense')}</span>
              </button>

              <button
                onClick={onOpenAddLoan}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>{t('addLoan')}</span>
              </button>

              <button
                onClick={onOpenAddInvestment}
                className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>{t('addInvestment')}</span>
              </button>

              <button
                onClick={onOpenAddMember}
                className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span>{language === 'bn' ? 'সদস্য যুক্ত' : 'Add Member'}</span>
              </button>

              <button
                onClick={onOpenCreateNotice}
                className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-800 dark:text-purple-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>{t('createNotice')}</span>
              </button>
            </div>
          </div>

          {/* Key Admin Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">{t('members')}</span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {members.length} {language === 'bn' ? 'জন' : ''}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">{t('cashBalance')}</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totals.currentCashBalance)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">{t('totalLoansOutstanding')}</span>
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(totals.totalOutstandingLoan)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">{t('totalInvestments')}</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(totals.totalInvestmentPrincipal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('auditLogs')}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'সকল প্রশাসনিক পরিবর্তন ও এন্ট্রির অপরিবর্তনীয় রেকর্ড'
                  : 'Immutable audit trail of administrator transactions and actions'}
              </p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              {language === 'bn' ? 'এখনো কোনো অডিট রেকর্ড নেই।' : 'No audit entries yet.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto smooth-scroll">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>Admin: {log.performedByName}</span>
                    <span>•</span>
                    <span className="capitalize">{log.performedByRole}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ROLES & PERMISSIONS */}
      {activeAdminTab === 'roles' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('rolesPermissions')}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'সুপার অ্যাডমিন ও অ্যাডমিনদের দায়িত্ব বণ্টন'
                : 'Role assignment and access control'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                <tr>
                  <th className="py-3 px-3">{t('member')}</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-3">
                      <span className="font-bold block">{m.name}</span>
                      <span className="text-slate-400 text-[11px]">{m.memberId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-bold text-xs bg-slate-100 dark:bg-slate-800">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isSuperAdmin && m.uid !== INITIAL_SUPER_ADMIN_UID ? (
                        <select
                          value={m.role}
                          onChange={(e) => updateMember(m.id, { role: e.target.value as Role })}
                          className="px-2 py-1 rounded-lg border text-xs bg-white dark:bg-slate-800"
                        >
                          <option value="member">Member</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="superAdmin">Super Admin</option>
                        </select>
                      ) : (
                        <span className="text-slate-400 text-xs">Permanent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST NOTIFICATIONS */}
      {activeAdminTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs max-w-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            {language === 'bn' ? 'সদস্যদের উদ্দেশ্যে নোটিফিকেশন প্রেরণ' : 'Send In-App Notification'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {language === 'bn'
              ? 'সকল সদস্য বা নির্দিষ্ট রোলভিত্তিক সদস্যদের ইন-অ্যাপ নোটিফিকেশন পাঠান'
              : 'Broadcast alerts directly to member notification center'}
          </p>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'শিরোনাম' : 'Title'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. চলতি মাসের চাঁদা জমার তাগিদ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'বার্তা' : 'Message'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="বিস্তারিত বার্তা..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'প্রাপক' : 'Target Audience'}
              </label>
              <select
                value={notifTarget}
                onChange={(e) => setNotifTarget(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="all">{language === 'bn' ? 'সকল সদস্য (Everyone)' : 'Everyone'}</option>
                <option value="role">{language === 'bn' ? 'নির্দিষ্ট রোল (By Role)' : 'By Role'}</option>
              </select>
            </div>

            {notifSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!' : 'Notification sent successfully!'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={notifSending}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{notifSending ? t('loading') : language === 'bn' ? 'নোটিফিকেশন পাঠান' : 'Send Notification'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: HAJJ SETUP */}
      {activeAdminTab === 'hajjSetup' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs max-w-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            {language === 'bn' ? 'হজ্জ কাফেলা ফান্ড লক্ষ্য নির্ধারণ' : 'Hajj Fund Target Setting'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {language === 'bn'
              ? 'কাফেলা সদস্যদের সম্মিলিত হজ্জ ফান্ড লক্ষ্য ও মাসিক চাঁদা কনফিগারেশন'
              : 'Configure group target and default monthly contribution amount'}
          </p>

          <form onSubmit={handleSaveHajjSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('hajjGoal')} {t('target')} (৳)
              </label>
              <input
                type="number"
                required
                value={hajjGoalInput}
                onChange={(e) => setHajjGoalInput(e.target.value)}
                placeholder="e.g. 1500000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'মাসিক নির্ধারিত চাঁদা (৳)' : 'Default Monthly Contribution (৳)'}
              </label>
              <input
                type="number"
                required
                value={monthlyContributionInput}
                onChange={(e) => setMonthlyContributionInput(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              <span>{savingSettings ? t('loading') : t('save')}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
