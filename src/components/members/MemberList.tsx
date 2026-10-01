import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  UserCheck,
  UserX,
  Shield,
  Wallet,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  History,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Member, Role } from '../../types';
import { Modal } from '../common/Modal';
import { INITIAL_SUPER_ADMIN_UID } from '../../firebase/config';

interface MemberListProps {
  onOpenAddMember: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({ onOpenAddMember }) => {
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();
  const { members, deposits, updateMember } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (isAdmin && m.phone?.includes(searchTerm))
  );

  const handleStatusToggle = async (member: Member) => {
    if (!isAdmin) return;
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    await updateMember(member.id, { status: newStatus });
  };

  const handleRoleChange = async (member: Member, newRole: Role) => {
    // Only superAdmin can change roles, and cannot downgrade initial Super Admin
    if (!isSuperAdmin) return;
    if (member.uid === INITIAL_SUPER_ADMIN_UID) return;
    await updateMember(member.id, { role: newRole });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setSubmitting(true);
      await updateMember(editingMember.id, {
        name: editingMember.name,
        phone: editingMember.phone,
        email: editingMember.email,
        memberId: editingMember.memberId,
        notes: editingMember.notes,
      });
      setEditingMember(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t('members')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              {members.length} {language === 'bn' ? 'জন' : 'members'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'আস-সাইর কল্যাণ সমিতির সকল সম্মানিত সদস্যের পরিচিতি ও সঞ্চয় খতিয়ান'
              : 'Directory and profiles of all 30 organization members'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন সদস্য যুক্ত করুন' : 'Add Member'}</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={language === 'bn' ? 'সদস্যের নাম বা আইডি দিয়ে খুঁজুন...' : 'Search members by name or ID...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
        />
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {language === 'bn' ? 'কোনো সদস্য পাওয়া যায়নি।' : 'No members found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const memberDeposits = deposits.filter(
              (d) => !d.voided && (d.memberId === member.memberId || d.memberId === member.id)
            );
            const totalDeposit = memberDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

            return (
              <div
                key={member.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  member.status === 'inactive'
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-xs">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
                          {member.name}
                        </h3>
                        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                          {member.memberId}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.role === 'superAdmin'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : member.role === 'admin'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : member.role === 'moderator'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {member.role}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          member.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Savings Stat Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('totalDeposits')}
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalDeposit)}
                    </span>
                  </div>

                  {/* Join Date & Phone if admin */}
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(member.joinDate)}</span>
                    </div>
                    {isAdmin && member.phone && (
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedMemberForHistory(member)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{t('viewDetails')}</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setEditingMember(member)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                      title={t('edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {isSuperAdmin && member.uid !== INITIAL_SUPER_ADMIN_UID && (
                    <button
                      onClick={() => handleStatusToggle(member)}
                      className={`p-1.5 rounded-xl ${
                        member.status === 'active'
                          ? 'text-rose-500 hover:bg-rose-50'
                          : 'text-emerald-500 hover:bg-emerald-50'
                      }`}
                      title={member.status === 'active' ? 'Disable Member' : 'Activate Member'}
                    >
                      {member.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Financial History & Profile Modal */}
      {selectedMemberForHistory && (
        <Modal
          isOpen={!!selectedMemberForHistory}
          onClose={() => setSelectedMemberForHistory(null)}
          title={`${selectedMemberForHistory.name} - ${selectedMemberForHistory.memberId}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-semibold block">
                  {t('totalDeposits')}
                </span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                  {formatCurrency(
                    deposits
                      .filter(
                        (d) =>
                          !d.voided &&
                          (d.memberId === selectedMemberForHistory.memberId ||
                            d.memberId === selectedMemberForHistory.id)
                      )
                      .reduce((sum, d) => sum + Number(d.amount || 0), 0)
                  )}
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-xl text-xs">
                {selectedMemberForHistory.role}
              </span>
            </div>

            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 pt-2">
              {t('paymentHistory')}
            </h4>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 smooth-scroll">
              {deposits
                .filter(
                  (d) =>
                    !d.voided &&
                    (d.memberId === selectedMemberForHistory.memberId ||
                      d.memberId === selectedMemberForHistory.id)
                )
                .map((dep) => (
                  <div key={dep.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {dep.month}
                      </span>
                      <span className="text-slate-400">
                        {formatDate(dep.paymentDate)} • {dep.paymentMethod} • #{dep.receiptNumber}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">
                      {formatCurrency(dep.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <Modal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          title={`${t('edit')} - ${editingMember.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('memberId')}
              </label>
              <input
                type="text"
                required
                value={editingMember.memberId}
                onChange={(e) => setEditingMember({ ...editingMember, memberId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('phone')}
              </label>
              <input
                type="tel"
                value={editingMember.phone || ''}
                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            {isSuperAdmin && editingMember.uid !== INITIAL_SUPER_ADMIN_UID && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('rolesPermissions')}
                </label>
                <select
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as Role })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                {submitting ? t('loading') : t('save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
