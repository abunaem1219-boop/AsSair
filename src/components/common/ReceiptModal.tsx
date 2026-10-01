import React, { useRef } from 'react';
import { Printer, Download, Share2, ShieldCheck, CheckCircle2, Building, Calendar, CreditCard, User, Hash } from 'lucide-react';
import { Modal } from './Modal';
import { Deposit, Receipt } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { useData } from '../../context/DataContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit?: Deposit | null;
  receipt?: Receipt | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  deposit,
  receipt,
}) => {
  const { t, formatCurrency, formatDate } = useThemeLanguage();
  const { settings } = useData();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!deposit && !receipt) return null;

  const receiptNumber = receipt?.receiptNumber || deposit?.receiptNumber || 'REC-2026-0001';
  const memberName = receipt?.memberName || deposit?.memberName || 'Member';
  const memberId = receipt?.memberId || deposit?.memberId || 'AS-001';
  const month = receipt?.month || deposit?.month || '2026-10';
  const amount = receipt?.amount || deposit?.amount || 0;
  const paymentDate = receipt?.paymentDate || deposit?.paymentDate || '';
  const paymentMethod = receipt?.paymentMethod || deposit?.paymentMethod || 'Cash';
  const recordedBy = receipt?.recordedBy || deposit?.createdByName || 'Administrator';
  const reference = receipt?.reference || deposit?.reference;
  const voided = deposit?.voided;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `As Sair Receipt - ${receiptNumber}`,
          text: `Payment Receipt for ${memberName} (${month}): ${formatCurrency(amount)}. Receipt #${receiptNumber}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      navigator.clipboard.writeText(
        `As Sair Fund Receipt #${receiptNumber}\nMember: ${memberName} (${memberId})\nMonth: ${month}\nAmount: ${formatCurrency(amount)}\nDate: ${paymentDate}`
      );
      alert('রসিদের তথ্য ক্লিপবোর্ডে কপি করা হয়েছে! (Copied to clipboard)');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('officialReceipt')} maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Printable Voucher Paper */}
        <div
          ref={receiptRef}
          className="relative bg-white dark:bg-slate-900 border-2 border-emerald-600/30 rounded-2xl p-6 sm:p-8 shadow-inner overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 dark:opacity-10 select-none">
            <div className="border-8 border-emerald-700 rounded-full p-12 text-center rotate-[-25deg]">
              <span className="text-4xl font-extrabold uppercase tracking-widest block">AS SAIR</span>
              <span className="text-xl font-bold tracking-widest block">PAID & CERTIFIED</span>
            </div>
          </div>

          {voided && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] z-20 pointer-events-none">
              <span className="text-5xl font-black text-rose-500/80 border-4 border-rose-500/80 px-6 py-2 rounded-xl uppercase tracking-widest shadow-lg">
                VOIDED / বাতিল
              </span>
            </div>
          )}

          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-slate-200 dark:border-slate-800 pb-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md mb-2">
              س
            </div>
            <h2 className="text-2xl font-black tracking-tight text-emerald-800 dark:text-emerald-400">
              {settings.orgName || 'আস-সাইর (AS SAIR)'}
            </h2>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              {settings.orgTagline || 'Fund Management & Community Platform'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('officialReceipt')}</span>
            </div>
          </div>

          {/* Receipt Meta & Amount Highlight */}
          <div className="my-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900 rounded-xl p-4 text-center">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider block">
              {t('totalDeposits')} ({month})
            </span>
            <span className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-200 tracking-tight mt-1 block">
              {formatCurrency(amount)}
            </span>
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('certifiedText')}</span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                <Hash className="w-3.5 h-3.5 text-emerald-600" /> {t('receiptNo')}
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                {receiptNumber}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                <User className="w-3.5 h-3.5 text-emerald-600" /> {t('member')}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {memberName} <span className="text-xs text-slate-400 font-normal">({memberId})</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {t('month')}
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {month}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {t('paymentDate')}
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(paymentDate)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> {t('paymentMethod')}
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {paymentMethod}
              </span>
            </div>

            {reference && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('reference')}</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs">{reference}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('addedBy')}</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">{recordedBy}</span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="flex justify-center items-end h-8 gap-0.5 opacity-60">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3].map((w, idx) => (
                <div key={idx} className="bg-slate-800 dark:bg-slate-200 h-full" style={{ width: `${w * 2}px` }} />
              ))}
            </div>
            <p className="font-mono text-[10px] tracking-widest text-slate-400 mt-1 uppercase">
              {receiptNumber}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {t('close')}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('share')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print')} / {t('download')}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
