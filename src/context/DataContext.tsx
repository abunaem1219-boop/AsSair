import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { rtdb, INITIAL_SUPER_ADMIN_UID } from '../firebase/config';
import { useAuth } from './AuthContext';
import { sanitizeForRTDB } from '../utils/firebaseUtils';
import {
  Member,
  Deposit,
  Expense,
  Loan,
  LoanRepayment,
  Investment,
  InvestmentReturn,
  Receipt,
  Notice,
  NotificationItem,
  ChatMessage,
  Post,
  PostComment,
  GalleryItem,
  OrgEvent,
  AuditLog,
  OrgSettings,
  Role,
} from '../types';

interface FinancialTotals {
  totalDeposited: number;
  totalExpenses: number;
  totalLoansGiven: number;
  totalLoanRepayments: number;
  totalOutstandingLoan: number;
  totalInvestmentPrincipal: number;
  totalInvestmentReturns: number;
  currentCashBalance: number;
  totalNetFund: number;
  hajjProgressPercent: number;
}

interface DataContextType {
  members: Member[];
  deposits: Deposit[];
  expenses: Expense[];
  loans: Loan[];
  loanRepayments: LoanRepayment[];
  investments: Investment[];
  investmentReturns: InvestmentReturn[];
  receipts: Receipt[];
  notices: Notice[];
  notifications: NotificationItem[];
  messages: ChatMessage[];
  posts: Post[];
  comments: Record<string, PostComment[]>;
  gallery: GalleryItem[];
  events: OrgEvent[];
  auditLogs: AuditLog[];
  settings: OrgSettings;
  totals: FinancialTotals;
  loading: boolean;

  // Actions
  addDeposit: (depositData: Omit<Deposit, 'id' | 'receiptNumber' | 'createdAt' | 'createdByUid' | 'createdByName'>) => Promise<string>;
  voidDeposit: (depositId: string, reason: string) => Promise<void>;
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>) => Promise<string>;
  voidExpense: (expenseId: string, reason: string) => Promise<void>;
  addLoan: (loanData: Omit<Loan, 'id' | 'createdAt' | 'createdByUid' | 'createdByName' | 'paidAmount' | 'remainingAmount'>) => Promise<string>;
  recordLoanRepayment: (loanId: string, amount: number, paymentMethod: any, note?: string) => Promise<void>;
  addInvestment: (invData: Omit<Investment, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>) => Promise<string>;
  recordInvestmentReturn: (invId: string, returnAmount: number, profitAmount: number, note?: string) => Promise<void>;
  addMember: (memberData: Omit<Member, 'id' | 'totalDeposit' | 'createdAt'>) => Promise<string>;
  updateMember: (id: string, memberData: Partial<Member>) => Promise<void>;
  createNotice: (noticeData: Omit<Notice, 'id' | 'createdAt' | 'authorUid' | 'authorName'>) => Promise<string>;
  togglePinNotice: (noticeId: string, isPinned: boolean) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
  sendMessage: (text: string, mediaUrl?: string, mediaType?: 'image' | 'video', replyTo?: any) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  createPost: (text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => Promise<string>;
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'createdAt' | 'uploaderUid' | 'uploaderName'>) => Promise<string>;
  deleteGalleryItem: (id: string) => Promise<void>;
  createEvent: (eventData: Omit<OrgEvent, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>) => Promise<string>;
  respondToEvent: (eventId: string, status: 'Going' | 'Maybe' | 'Not Going') => Promise<void>;
  sendNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'createdByName'>) => Promise<string>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<OrgSettings>) => Promise<void>;
  logAudit: (action: string, details: string, previousValue?: string, newValue?: string) => Promise<void>;
}

const defaultSettings: OrgSettings = {
  orgName: 'আস-সাইর',
  orgTagline: 'তহবিল ব্যবস্থাপনা ও কল্যাণ সমিতি',
  hajjGoalTarget: 1500000, // ৳15,00,000 for Hajj group travel goal
  defaultMonthlyContribution: 1000,
  orgDescription: 'আস-সাইর একটি প্রাইভেট সংগঠন। এখানে প্রতি মাসে সদস্যরা নির্দিষ্ট সঞ্চয় জমা করেন এবং দীর্ঘমেয়াদে হজ্জের সফর ও সামাজিক কল্যাণ লক্ষ্য হিসেবে নির্ধারিত।',
  contactPhone: '+880 1700-000000',
  contactEmail: 'info@as-sair.org',
  currencySymbol: '৳',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, role, isAdmin } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanRepayments, setLoanRepayments] = useState<LoanRepayment[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentReturns, setInvestmentReturns] = useState<InvestmentReturn[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<OrgSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Helper to convert Firebase Object of Objects to typed Array
  const toArray = <T,>(data: any): T[] => {
    if (!data) return [];
    return Object.keys(data).map((key) => ({
      ...data[key],
      id: key,
    }));
  };

  // Real-time Listeners for all collections
  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    // Settings
    unsubscribes.push(
      onValue(ref(rtdb, 'settings'), (snapshot) => {
        if (snapshot.exists()) {
          setSettings({ ...defaultSettings, ...snapshot.val() });
        } else {
          // Initialize default settings if empty
          set(ref(rtdb, 'settings'), defaultSettings);
        }
      }, (err) => console.error('Settings listener error:', err))
    );

    // Members
    unsubscribes.push(
      onValue(ref(rtdb, 'members'), (snapshot) => {
        setMembers(toArray<Member>(snapshot.val()));
      }, (err) => console.error('Members listener error:', err))
    );

    // Deposits
    unsubscribes.push(
      onValue(ref(rtdb, 'deposits'), (snapshot) => {
        setDeposits(toArray<Deposit>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Deposits listener error:', err))
    );

    // Expenses
    unsubscribes.push(
      onValue(ref(rtdb, 'expenses'), (snapshot) => {
        setExpenses(toArray<Expense>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Expenses listener error:', err))
    );

    // Loans
    unsubscribes.push(
      onValue(ref(rtdb, 'loans'), (snapshot) => {
        setLoans(toArray<Loan>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Loans listener error:', err))
    );

    // Loan Repayments
    unsubscribes.push(
      onValue(ref(rtdb, 'loanRepayments'), (snapshot) => {
        setLoanRepayments(toArray<LoanRepayment>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('LoanRepayments listener error:', err))
    );

    // Investments
    unsubscribes.push(
      onValue(ref(rtdb, 'investments'), (snapshot) => {
        setInvestments(toArray<Investment>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Investments listener error:', err))
    );

    // Investment Returns
    unsubscribes.push(
      onValue(ref(rtdb, 'investmentReturns'), (snapshot) => {
        setInvestmentReturns(toArray<InvestmentReturn>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('InvestmentReturns listener error:', err))
    );

    // Receipts
    unsubscribes.push(
      onValue(ref(rtdb, 'receipts'), (snapshot) => {
        setReceipts(toArray<Receipt>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Receipts listener error:', err))
    );

    // Notices
    unsubscribes.push(
      onValue(ref(rtdb, 'notices'), (snapshot) => {
        setNotices(toArray<Notice>(snapshot.val()).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.createdAt - a.createdAt;
        }));
      }, (err) => console.error('Notices listener error:', err))
    );

    // Notifications
    unsubscribes.push(
      onValue(ref(rtdb, 'notifications'), (snapshot) => {
        setNotifications(toArray<NotificationItem>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Notifications listener error:', err))
    );

    // Messages
    unsubscribes.push(
      onValue(ref(rtdb, 'messages'), (snapshot) => {
        setMessages(toArray<ChatMessage>(snapshot.val()).sort((a, b) => a.createdAt - b.createdAt));
      }, (err) => console.error('Messages listener error:', err))
    );

    // Posts
    unsubscribes.push(
      onValue(ref(rtdb, 'posts'), (snapshot) => {
        setPosts(toArray<Post>(snapshot.val()).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.createdAt - a.createdAt;
        }));
      }, (err) => console.error('Posts listener error:', err))
    );

    // Comments
    unsubscribes.push(
      onValue(ref(rtdb, 'comments'), (snapshot) => {
        const raw = snapshot.val();
        if (!raw) {
          setComments({});
          return;
        }
        const grouped: Record<string, PostComment[]> = {};
        Object.keys(raw).forEach((id) => {
          const item = { ...raw[id], id } as PostComment;
          if (!grouped[item.postId]) grouped[item.postId] = [];
          grouped[item.postId].push(item);
        });
        setComments(grouped);
      }, (err) => console.error('Comments listener error:', err))
    );

    // Gallery
    unsubscribes.push(
      onValue(ref(rtdb, 'gallery'), (snapshot) => {
        setGallery(toArray<GalleryItem>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Gallery listener error:', err))
    );

    // Events
    unsubscribes.push(
      onValue(ref(rtdb, 'events'), (snapshot) => {
        setEvents(toArray<OrgEvent>(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Events listener error:', err))
    );

    // Audit Logs
    unsubscribes.push(
      onValue(ref(rtdb, 'auditLogs'), (snapshot) => {
        setAuditLogs(toArray<AuditLog>(snapshot.val()).sort((a, b) => b.timestamp - a.timestamp));
      }, (err) => console.error('AuditLogs listener error:', err))
    );

    setLoading(false);

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Precise Financial Totals Calculation
  // Current Balance = Total Deposits + Loan Repayments + Investment Returns - Expenses - Loans Given - Investment Principal
  const totals = useMemo<FinancialTotals>(() => {
    // Only non-voided deposits
    const validDeposits = deposits.filter((d) => !d.voided);
    const totalDeposited = validDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // Only non-voided expenses
    const validExpenses = expenses.filter((e) => !e.voided);
    const totalExpenses = validExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Loans given (Active, Partially Paid, Fully Paid, Overdue)
    const validLoans = loans.filter((l) => l.status !== 'Cancelled');
    const totalLoansGiven = validLoans.reduce((sum, l) => sum + Number(l.amount || 0), 0);

    // Loan repayments collected
    const totalLoanRepayments = loanRepayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // Outstanding loans = Loans Given - Repayments
    const totalOutstandingLoan = Math.max(0, totalLoansGiven - totalLoanRepayments);

    // Investments principal
    const validInvestments = investments.filter((i) => i.status !== 'Cancelled');
    const totalInvestmentPrincipal = validInvestments.reduce((sum, i) => sum + Number(i.amount || 0), 0);

    // Investment returns & profits received
    const totalInvestmentReturns = investmentReturns.reduce((sum, r) => sum + Number(r.returnAmount || 0), 0);

    // Liquid Cash Balance formula from requirement 10:
    const currentCashBalance =
      totalDeposited +
      totalLoanRepayments +
      totalInvestmentReturns -
      totalExpenses -
      totalLoansGiven -
      totalInvestmentPrincipal;

    // Total Net Organizational Fund (Cash + Outstanding Loans + Active Investments)
    const totalNetFund = currentCashBalance + totalOutstandingLoan + totalInvestmentPrincipal;

    // Hajj progress
    const target = settings.hajjGoalTarget || 1500000;
    const hajjProgressPercent = Math.min(100, Math.round((Math.max(0, currentCashBalance) / target) * 100));

    return {
      totalDeposited,
      totalExpenses,
      totalLoansGiven,
      totalLoanRepayments,
      totalOutstandingLoan,
      totalInvestmentPrincipal,
      totalInvestmentReturns,
      currentCashBalance,
      totalNetFund,
      hajjProgressPercent,
    };
  }, [deposits, expenses, loans, loanRepayments, investments, investmentReturns, settings.hajjGoalTarget]);

  // Audit Logger Helper
  const logAudit = async (action: string, details: string, previousValue?: string, newValue?: string) => {
    try {
      const auditRef = push(ref(rtdb, 'auditLogs'));
      const logEntry: AuditLog = {
        id: auditRef.key as string,
        action,
        details,
        previousValue,
        newValue,
        performedByUid: currentUser?.uid || 'system',
        performedByName: userProfile?.displayName || 'Admin',
        performedByRole: role,
        timestamp: Date.now(),
      };
      await set(auditRef, sanitizeForRTDB(logEntry));
    } catch (err) {
      console.warn('Audit log write error:', err);
    }
  };

  // Add Deposit
  const addDeposit = async (
    depositData: Omit<Deposit, 'id' | 'receiptNumber' | 'createdAt' | 'createdByUid' | 'createdByName'>
  ) => {
    const depRef = push(ref(rtdb, 'deposits'));
    const id = depRef.key as string;
    const now = Date.now();
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(deposits.length + 1).padStart(4, '0')}`;

    const newDeposit: Deposit = {
      ...depositData,
      id,
      receiptNumber,
      createdAt: now,
      createdByUid: currentUser?.uid || '',
      createdByName: userProfile?.displayName || 'Admin',
    };

    await set(depRef, sanitizeForRTDB(newDeposit));

    // Save corresponding official receipt
    const receiptRef = push(ref(rtdb, 'receipts'));
    const receiptData: Receipt = {
      receiptNumber,
      depositId: id,
      memberName: depositData.memberName,
      memberId: depositData.memberId,
      month: depositData.month,
      amount: depositData.amount,
      paymentDate: depositData.paymentDate,
      paymentMethod: depositData.paymentMethod,
      reference: depositData.reference,
      recordedBy: userProfile?.displayName || 'Admin',
      createdAt: now,
    };
    await set(receiptRef, sanitizeForRTDB(receiptData));

    // Update member's total deposit count & sync
    const member = members.find((m) => m.memberId === depositData.memberId || m.id === depositData.memberId);
    if (member) {
      const newTotal = (member.totalDeposit || 0) + depositData.amount;
      await update(ref(rtdb, `members/${member.id}`), { totalDeposit: newTotal });
      // If member has linked user account, update user record too
      if (member.uid) {
        await update(ref(rtdb, `users/${member.uid}`), { totalDeposit: newTotal });
      }
    }

    await logAudit(
      'Added Deposit',
      `Recorded ৳${depositData.amount} for ${depositData.memberName} (${depositData.month})`,
      undefined,
      `৳${depositData.amount}`
    );

    return id;
  };

  // Void Deposit
  const voidDeposit = async (depositId: string, reason: string) => {
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit) return;

    await update(ref(rtdb, `deposits/${depositId}`), {
      voided: true,
      voidReason: reason,
      updatedAt: Date.now(),
    });

    // Deduct from member total
    const member = members.find((m) => m.memberId === deposit.memberId || m.id === deposit.memberId);
    if (member) {
      const newTotal = Math.max(0, (member.totalDeposit || 0) - deposit.amount);
      await update(ref(rtdb, `members/${member.id}`), { totalDeposit: newTotal });
      if (member.uid) {
        await update(ref(rtdb, `users/${member.uid}`), { totalDeposit: newTotal });
      }
    }

    await logAudit(
      'Voided Deposit',
      `Voided deposit of ৳${deposit.amount} for ${deposit.memberName}. Reason: ${reason}`,
      `৳${deposit.amount}`,
      'Voided'
    );
  };

  // Add Expense
  const addExpense = async (
    expenseData: Omit<Expense, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>
  ) => {
    const expRef = push(ref(rtdb, 'expenses'));
    const id = expRef.key as string;
    const newExpense: Expense = {
      ...expenseData,
      id,
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || '',
      createdByName: userProfile?.displayName || 'Admin',
    };
    await set(expRef, sanitizeForRTDB(newExpense));

    await logAudit(
      'Added Expense',
      `Added expense ৳${expenseData.amount} for "${expenseData.purpose}" (${expenseData.category})`,
      undefined,
      `৳${expenseData.amount}`
    );

    return id;
  };

  // Void Expense
  const voidExpense = async (expenseId: string, reason: string) => {
    const exp = expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    await update(ref(rtdb, `expenses/${expenseId}`), sanitizeForRTDB({
      voided: true,
      voidReason: reason,
    }));

    await logAudit(
      'Voided Expense',
      `Voided expense ৳${exp.amount} (${exp.purpose}). Reason: ${reason}`,
      `৳${exp.amount}`,
      'Voided'
    );
  };

  // Add Loan
  const addLoan = async (
    loanData: Omit<Loan, 'id' | 'createdAt' | 'createdByUid' | 'createdByName' | 'paidAmount' | 'remainingAmount'>
  ) => {
    const loanRef = push(ref(rtdb, 'loans'));
    const id = loanRef.key as string;
    const newLoan: Loan = {
      ...loanData,
      id,
      paidAmount: 0,
      remainingAmount: loanData.amount,
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || '',
      createdByName: userProfile?.displayName || 'Admin',
    };
    await set(loanRef, sanitizeForRTDB(newLoan));

    await logAudit(
      'Created Loan',
      `Issued loan ৳${loanData.amount} to ${loanData.borrowerName} for ${loanData.purpose}`,
      undefined,
      `৳${loanData.amount}`
    );

    return id;
  };

  // Record Loan Repayment
  const recordLoanRepayment = async (loanId: string, amount: number, paymentMethod: any, note?: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const repRef = push(ref(rtdb, 'loanRepayments'));
    const id = repRef.key as string;
    const now = Date.now();
    const receiptNumber = `LREP-${new Date().getFullYear()}-${String(loanRepayments.length + 1).padStart(4, '0')}`;

    const repayment: LoanRepayment = {
      id,
      loanId,
      borrowerName: loan.borrowerName,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      receiptNumber,
      note,
      createdByUid: currentUser?.uid || '',
      createdByName: userProfile?.displayName || 'Admin',
      createdAt: now,
    };
    await set(repRef, sanitizeForRTDB(repayment));

    // Update loan balance & status
    const newPaid = (loan.paidAmount || 0) + amount;
    const newRemaining = Math.max(0, loan.amount - newPaid);
    const newStatus = newRemaining === 0 ? 'Fully Paid' : 'Partially Paid';

    await update(ref(rtdb, `loans/${loanId}`), sanitizeForRTDB({
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      status: newStatus,
      updatedAt: now,
    }));

    await logAudit(
      'Recorded Loan Repayment',
      `Received ৳${amount} from ${loan.borrowerName} for Loan ID ${loanId}`,
      `Remaining: ৳${loan.remainingAmount}`,
      `Remaining: ৳${newRemaining}`
    );
  };

  // Add Investment
  const addInvestment = async (
    invData: Omit<Investment, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>
  ) => {
    const invRef = push(ref(rtdb, 'investments'));
    const id = invRef.key as string;
    const newInv: Investment = {
      ...invData,
      id,
      actualReturn: 0,
      profit: 0,
      createdAt: Date.now(),
      createdByUid: currentUser?.uid || '',
      createdByName: userProfile?.displayName || 'Admin',
    };
    await set(invRef, sanitizeForRTDB(newInv));

    await logAudit(
      'Added Investment',
      `Invested ৳${invData.amount} in "${invData.name}" (${invData.businessOrOrg})`,
      undefined,
      `৳${invData.amount}`
    );

    return id;
  };

  // Record Investment Return
  const recordInvestmentReturn = async (invId: string, returnAmount: number, profitAmount: number, notes?: string) => {
    const inv = investments.find((i) => i.id === invId);
    if (!inv) return;

    const retRef = push(ref(rtdb, 'investmentReturns'));
    const id = retRef.key as string;
    const newReturn: InvestmentReturn = {
      id,
      investmentId: invId,
      investmentName: inv.name,
      returnAmount,
      profitAmount,
      date: new Date().toISOString().split('T')[0],
      notes,
      createdByUid: currentUser?.uid || '',
      createdAt: Date.now(),
    };
    await set(retRef, sanitizeForRTDB(newReturn));

    // Update investment status and profit totals
    const currentActual = (inv.actualReturn || 0) + returnAmount;
    const currentProfit = (inv.profit || 0) + profitAmount;
    const isCompleted = currentActual >= inv.amount;

    await update(ref(rtdb, `investments/${invId}`), sanitizeForRTDB({
      actualReturn: currentActual,
      profit: currentProfit,
      status: isCompleted ? 'Completed' : 'Active',
      updatedAt: Date.now(),
    }));

    await logAudit(
      'Recorded Investment Return',
      `Received ৳${returnAmount} (Profit: ৳${profitAmount}) from "${inv.name}"`,
      undefined,
      `Total returned: ৳${currentActual}`
    );
  };

  // Add Member
  const addMember = async (memberData: Omit<Member, 'id' | 'totalDeposit' | 'createdAt'>) => {
    const memRef = push(ref(rtdb, 'members'));
    const id = memRef.key as string;
    const newMember: Member = {
      ...memberData,
      id,
      totalDeposit: 0,
      createdAt: Date.now(),
    };
    await set(memRef, sanitizeForRTDB(newMember));

    await logAudit('Added Member', `Registered member ${memberData.name} (${memberData.memberId})`);
    return id;
  };

  // Update Member
  const updateMember = async (id: string, memberData: Partial<Member>) => {
    const memRef = ref(rtdb, `members/${id}`);
    await update(memRef, sanitizeForRTDB({ ...memberData, updatedAt: Date.now() }));

    await logAudit('Updated Member', `Updated details for member ID ${id}`);
  };

  // Notices
  const createNotice = async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'authorUid' | 'authorName'>) => {
    const noticeRef = push(ref(rtdb, 'notices'));
    const id = noticeRef.key as string;
    const newNotice: Notice = {
      ...noticeData,
      id,
      authorUid: currentUser?.uid || '',
      authorName: userProfile?.displayName || 'Admin',
      createdAt: Date.now(),
    };
    await set(noticeRef, sanitizeForRTDB(newNotice));
    await logAudit('Created Notice', `Notice: "${noticeData.title}" [${noticeData.priority}]`);
    return id;
  };

  const togglePinNotice = async (noticeId: string, isPinned: boolean) => {
    await update(ref(rtdb, `notices/${noticeId}`), { isPinned });
  };

  const deleteNotice = async (noticeId: string) => {
    await remove(ref(rtdb, `notices/${noticeId}`));
    await logAudit('Deleted Notice', `Deleted notice ID: ${noticeId}`);
  };

  // Chat Messages
  const sendMessage = async (text: string, mediaUrl?: string, mediaType?: 'image' | 'video', replyTo?: any) => {
    if (!currentUser) return;
    const msgRef = push(ref(rtdb, 'messages'));
    const avatar = userProfile?.photoURL || currentUser.photoURL;
    const newMsg: Record<string, any> = {
      id: msgRef.key as string,
      text: text.trim(),
      senderUid: currentUser.uid,
      senderName: userProfile?.displayName || currentUser.displayName || 'Member',
      senderRole: role || 'member',
      createdAt: Date.now(),
    };
    if (avatar) {
      newMsg.senderAvatar = avatar;
    }
    if (mediaUrl) {
      newMsg.mediaUrl = mediaUrl;
    }
    if (mediaType) {
      newMsg.mediaType = mediaType;
    }
    if (replyTo && replyTo.id) {
      newMsg.replyTo = {
        id: replyTo.id,
        text: replyTo.text || '',
        senderName: replyTo.senderName || '',
      };
    }
    await set(msgRef, sanitizeForRTDB(newMsg));
  };

  const editMessage = async (messageId: string, newText: string) => {
    await update(ref(rtdb, `messages/${messageId}`), sanitizeForRTDB({
      text: newText,
      isEdited: true,
    }));
  };

  const deleteMessage = async (messageId: string) => {
    // Soft delete to maintain conversation continuity
    await update(ref(rtdb, `messages/${messageId}`), sanitizeForRTDB({
      isDeleted: true,
      text: 'This message was removed',
    }));
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    await set(ref(rtdb, `messages/${messageId}/reactions/${currentUser.uid}`), emoji);
  };

  // Posts & Feed
  const createPost = async (text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    if (!currentUser) return '';
    const postRef = push(ref(rtdb, 'posts'));
    const id = postRef.key as string;
    const avatar = userProfile?.photoURL || currentUser.photoURL;
    const newPost: Record<string, any> = {
      id,
      text,
      authorUid: currentUser.uid,
      authorName: userProfile?.displayName || currentUser.displayName || 'Brother',
      authorRole: role || 'member',
      likes: {},
      commentsCount: 0,
      createdAt: Date.now(),
    };
    if (avatar) {
      newPost.authorAvatar = avatar;
    }
    if (mediaUrl) {
      newPost.mediaUrl = mediaUrl;
    }
    if (mediaType) {
      newPost.mediaType = mediaType;
    }
    await set(postRef, sanitizeForRTDB(newPost));
    return id;
  };

  const toggleLikePost = async (postId: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    const isLiked = post?.likes?.[currentUser.uid];
    const likeRef = ref(rtdb, `posts/${postId}/likes/${currentUser.uid}`);
    if (isLiked) {
      await remove(likeRef);
    } else {
      await set(likeRef, true);
    }
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const cRef = push(ref(rtdb, 'comments'));
    const avatar = userProfile?.photoURL || currentUser.photoURL;
    const comment: Record<string, any> = {
      id: cRef.key as string,
      postId,
      text,
      authorUid: currentUser.uid,
      authorName: userProfile?.displayName || currentUser.displayName || 'Brother',
      createdAt: Date.now(),
    };
    if (avatar) {
      comment.authorAvatar = avatar;
    }
    await set(cRef, sanitizeForRTDB(comment));

    // Increment count
    const post = posts.find((p) => p.id === postId);
    const count = (post?.commentsCount || 0) + 1;
    await update(ref(rtdb, `posts/${postId}`), { commentsCount: count });
  };

  const deletePost = async (postId: string) => {
    await remove(ref(rtdb, `posts/${postId}`));
    await logAudit('Deleted Post', `Removed post ID: ${postId}`);
  };

  // Gallery
  const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'createdAt' | 'uploaderUid' | 'uploaderName'>) => {
    const gRef = push(ref(rtdb, 'gallery'));
    const id = gRef.key as string;
    const newItem: GalleryItem = {
      ...item,
      id,
      uploaderUid: currentUser?.uid || '',
      uploaderName: userProfile?.displayName || 'Member',
      createdAt: Date.now(),
    };
    await set(gRef, sanitizeForRTDB(newItem));
    return id;
  };

  const deleteGalleryItem = async (id: string) => {
    await remove(ref(rtdb, `gallery/${id}`));
  };

  // Events
  const createEvent = async (eventData: Omit<OrgEvent, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>) => {
    const eRef = push(ref(rtdb, 'events'));
    const id = eRef.key as string;
    const newEvent: OrgEvent = {
      ...eventData,
      id,
      createdByUid: currentUser?.uid || '',
      createdByName: userProfile?.displayName || 'Admin',
      createdAt: Date.now(),
    };
    await set(eRef, sanitizeForRTDB(newEvent));
    await logAudit('Created Event', `Created event: ${eventData.title}`);
    return id;
  };

  const respondToEvent = async (eventId: string, status: 'Going' | 'Maybe' | 'Not Going') => {
    if (!currentUser) return;
    await set(ref(rtdb, `events/${eventId}/attendees/${currentUser.uid}`), status);
  };

  // Notifications
  const sendNotification = async (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'createdByName'>) => {
    const nRef = push(ref(rtdb, 'notifications'));
    const id = nRef.key as string;
    const newNotification: NotificationItem = {
      ...notification,
      id,
      createdByName: userProfile?.displayName || 'Admin',
      createdAt: Date.now(),
    };
    await set(nRef, sanitizeForRTDB(newNotification));
    return id;
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!currentUser) return;
    await set(ref(rtdb, `notifications/${notificationId}/readBy/${currentUser.uid}`), true);
  };

  // Settings
  const updateSettings = async (newSettings: Partial<OrgSettings>) => {
    await update(ref(rtdb, 'settings'), sanitizeForRTDB(newSettings));
    setSettings((prev) => ({ ...prev, ...newSettings }));
    await logAudit('Updated Settings', `Updated organization settings`);
  };

  return (
    <DataContext.Provider
      value={{
        members,
        deposits,
        expenses,
        loans,
        loanRepayments,
        investments,
        investmentReturns,
        receipts,
        notices,
        notifications,
        messages,
        posts,
        comments,
        gallery,
        events,
        auditLogs,
        settings,
        totals,
        loading,
        addDeposit,
        voidDeposit,
        addExpense,
        voidExpense,
        addLoan,
        recordLoanRepayment,
        addInvestment,
        recordInvestmentReturn,
        addMember,
        updateMember,
        createNotice,
        togglePinNotice,
        deleteNotice,
        sendMessage,
        editMessage,
        deleteMessage,
        reactToMessage,
        createPost,
        toggleLikePost,
        addComment,
        deletePost,
        addGalleryItem,
        deleteGalleryItem,
        createEvent,
        respondToEvent,
        sendNotification,
        markNotificationAsRead,
        updateSettings,
        logAudit,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
