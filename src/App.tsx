import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';
import { DataProvider, useData } from './context/DataContext';

import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { Sidebar } from './components/common/Sidebar';

import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { FundManagement } from './components/fund/FundManagement';
import { MemberList } from './components/members/MemberList';
import { Feed } from './components/community/Feed';
import { GroupChat } from './components/community/GroupChat';
import { Gallery } from './components/community/Gallery';
import { Events } from './components/community/Events';
import { ReceiptList } from './components/receipts/ReceiptList';
import { ReportsView } from './components/reports/ReportsView';
import { NoticeBoard } from './components/notices/NoticeBoard';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserProfileView } from './components/profile/UserProfileView';
import { SettingsView } from './components/settings/SettingsView';

import { AuthModal } from './components/auth/AuthModal';
import { AddDepositModal } from './components/modals/AddDepositModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddLoanModal } from './components/modals/AddLoanModal';
import { AddInvestmentModal } from './components/modals/AddInvestmentModal';
import { AddMemberModal } from './components/modals/AddMemberModal';
import { CreateNoticeModal } from './components/modals/CreateNoticeModal';

const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading, isAdmin } = useAuth();
  const { loading: dataLoading } = useData();
  const { t, language } = useThemeLanguage();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Global action modals
  const [showAddDeposit, setShowAddDeposit] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateNotice, setShowCreateNotice] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenLogin={() => setShowAuthModal(true)}
      />

      {/* Main Layout Container (Desktop Sidebar + Main Content) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto smooth-scroll max-w-full">
          {currentTab === 'home' && (
            <HomeDashboard
              setCurrentTab={setCurrentTab}
              onOpenAddDeposit={() => setShowAddDeposit(true)}
              onOpenAddExpense={() => setShowAddExpense(true)}
              onOpenCreateNotice={() => setShowCreateNotice(true)}
            />
          )}

          {currentTab === 'fund' && (
            <FundManagement
              onOpenAddDeposit={() => setShowAddDeposit(true)}
              onOpenAddExpense={() => setShowAddExpense(true)}
              onOpenAddLoan={() => setShowAddLoan(true)}
              onOpenAddInvestment={() => setShowAddInvestment(true)}
            />
          )}

          {currentTab === 'members' && (
            <MemberList onOpenAddMember={() => setShowAddMember(true)} />
          )}

          {currentTab === 'feed' && <Feed />}

          {currentTab === 'chat' && <GroupChat />}

          {currentTab === 'gallery' && <Gallery />}

          {currentTab === 'events' && <Events />}

          {currentTab === 'receipts' && <ReceiptList />}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'notices' && (
            <NoticeBoard onOpenCreateNotice={() => setShowCreateNotice(true)} />
          )}

          {currentTab === 'notifications' && <NotificationCenter />}

          {currentTab === 'admin' && isAdmin && (
            <AdminDashboard
              onOpenAddDeposit={() => setShowAddDeposit(true)}
              onOpenAddExpense={() => setShowAddExpense(true)}
              onOpenAddLoan={() => setShowAddLoan(true)}
              onOpenAddInvestment={() => setShowAddInvestment(true)}
              onOpenAddMember={() => setShowAddMember(true)}
              onOpenCreateNotice={() => setShowCreateNotice(true)}
            />
          )}

          {currentTab === 'profile' && <UserProfileView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation (visible on mobile <md) */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenLogin={() => setShowAuthModal(true)}
      />

      {/* Global Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <AddDepositModal
        isOpen={showAddDeposit}
        onClose={() => setShowAddDeposit(false)}
        onSuccess={() => setCurrentTab('fund')}
      />

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />

      <AddLoanModal
        isOpen={showAddLoan}
        onClose={() => setShowAddLoan(false)}
      />

      <AddInvestmentModal
        isOpen={showAddInvestment}
        onClose={() => setShowAddInvestment(false)}
      />

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />

      <CreateNoticeModal
        isOpen={showCreateNotice}
        onClose={() => setShowCreateNotice(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeLanguageProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </ThemeLanguageProvider>
    </AuthProvider>
  );
}
