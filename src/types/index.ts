export type Role = 'superAdmin' | 'admin' | 'moderator' | 'member';

export type PermissionCapability =
  | 'viewFinancialData'
  | 'manageDeposits'
  | 'manageExpenses'
  | 'manageLoans'
  | 'manageInvestments'
  | 'manageMembers'
  | 'manageNotices'
  | 'sendNotifications'
  | 'moderateChat'
  | 'moderateFeed'
  | 'manageGallery'
  | 'manageEvents'
  | 'viewReports'
  | 'manageRoles'
  | 'viewAuditLogs'
  | 'manageSettings';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  memberId?: string;
  phone?: string;
  role: Role;
  photoURL?: string;
  joinDate: string;
  isActive: boolean;
  totalDeposit?: number;
  bio?: string;
  status?: 'active' | 'inactive';
  language?: 'bn' | 'en';
  createdAt?: number;
  updatedAt?: number;
}

export interface Member {
  id: string;
  uid?: string;
  memberId: string; // e.g. "AS-001"
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  role: Role;
  status: 'active' | 'inactive';
  totalDeposit: number;
  photoUrl?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export type PaymentMethod = 'Cash' | 'Bank' | 'Mobile Banking' | 'Other';

export interface Deposit {
  id: string;
  receiptNumber: string; // format: "AS-2026-000001"
  memberId: string;
  memberName: string;
  month: string; // format YYYY-MM
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  receiptImageUrl?: string;
  createdByUid: string;
  createdByName: string;
  createdAt: number;
  updatedAt?: number;
  status?: 'completed' | 'void';
  voided?: boolean;
  voidedBy?: string;
  voidedAt?: number;
  voidReason?: string;
}

export interface Receipt {
  receiptNumber: string; // format: "AS-2026-000001"
  depositId: string;
  memberName: string;
  memberId: string;
  month: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  recordedBy: string;
  createdAt: number;
  notes?: string;
}

export type ExpenseCategory =
  | 'Meeting'
  | 'Food'
  | 'Transport'
  | 'Office'
  | 'Emergency'
  | 'Investment'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  purpose: string;
  description?: string;
  paidTo: string;
  paymentMethod: PaymentMethod;
  attachmentUrl?: string;
  createdByUid: string;
  createdByName: string;
  createdAt: number;
  updatedAt?: number;
  status?: 'completed' | 'void';
  voided?: boolean;
  voidedBy?: string;
  voidedAt?: number;
  voidReason?: string;
}

export type LoanStatus = 'Active' | 'Partially Paid' | 'Fully Paid' | 'Overdue' | 'Cancelled';

export interface Loan {
  id: string;
  borrowerMemberId?: string;
  borrowerName: string;
  borrowerPhone?: string;
  amount: number;
  date: string;
  purpose: string;
  installmentAmount?: number;
  dueDate: string;
  note?: string;
  status: LoanStatus;
  paidAmount: number;
  remainingAmount: number;
  createdByUid: string;
  createdByName: string;
  createdAt: number;
  updatedAt?: number;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  borrowerName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  note?: string;
  createdByUid: string;
  createdByName: string;
  createdAt: number;
}

export type InvestmentStatus = 'Active' | 'Completed' | 'Returned' | 'Cancelled';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  date: string;
  purpose: string;
  businessOrOrg: string;
  expectedReturn?: number;
  actualReturn?: number;
  profit?: number;
  status: InvestmentStatus;
  notes?: string;
  attachmentUrl?: string;
  createdByUid: string;
  createdByName: string;
  createdAt: number;
  updatedAt?: number;
}

export interface InvestmentReturn {
  id: string;
  investmentId: string;
  investmentName: string;
  returnAmount: number;
  profitAmount: number;
  date: string;
  notes?: string;
  createdByUid: string;
  createdAt: number;
}

export type NoticePriority = 'Normal' | 'Important' | 'Emergency';

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: NoticePriority;
  authorName: string;
  authorUid: string;
  expiryDate?: string;
  imageUrl?: string;
  isPinned: boolean;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'fund' | 'deposit' | 'notice' | 'meeting' | 'event' | 'chat' | 'feed' | 'admin';
  targetType: 'all' | 'role' | 'member';
  targetRole?: Role;
  targetMemberId?: string;
  readBy?: Record<string, boolean>;
  createdAt: number;
  createdByName: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: Role;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Record<string, string>; // uid -> emoji
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: number;
}

export interface Post {
  id: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: Role;
  likes?: Record<string, boolean>; // uid -> true
  commentsCount?: number;
  isPinned?: boolean;
  createdAt: number;
}

export interface PostComment {
  id: string;
  postId: string;
  text: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: number;
}

export type GalleryAlbum = 'Meeting' | 'Tour' | 'Event' | 'Memories' | 'Religious' | 'Other';

export interface GalleryItem {
  id: string;
  title: string;
  album: GalleryAlbum;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  description?: string;
  uploaderUid: string;
  uploaderName: string;
  createdAt: number;
}

export type RSVPStatus = 'Going' | 'Maybe' | 'Not Going';

export interface OrgEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coverImageUrl?: string;
  createdByUid: string;
  createdByName: string;
  attendees?: Record<string, RSVPStatus>; // uid -> RSVPStatus
  createdAt: number;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  actorUid?: string;
  actorName?: string;
  actorRole?: Role;
  performedByUid?: string;
  performedByName?: string;
  performedByRole?: Role;
  previousValue?: string;
  newValue?: string;
  targetType?: string;
  targetId?: string;
  before?: string;
  after?: string;
  reason?: string;
  timestamp: number;
}

export interface OrgSettings {
  orgName: string;
  orgTagline?: string;
  orgLogoUrl?: string;
  hajjGoalTarget: number;
  defaultMonthlyContribution: number;
  orgDescription?: string;
  contactPhone?: string;
  contactEmail?: string;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
  currencySymbol: string;
  permissions?: Partial<Record<Role, Partial<Record<PermissionCapability, boolean>>>>;
}
