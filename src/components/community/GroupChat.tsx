import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image,
  Smile,
  Reply,
  X,
  Pin,
  Trash2,
  Edit2,
  Check,
  CheckCheck,
  User,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { ChatMessage } from '../../types';
import { uploadMediaToCloudinary } from '../../services/cloudinary';

export const GroupChat: React.FC = () => {
  const { currentUser, userProfile, isAdmin, isModerator } = useAuth();
  const { messages, sendMessage, editMessage, deleteMessage, reactToMessage, settings } = useData();
  const { t, formatCurrency, formatDate, language } = useThemeLanguage();

  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const replyData = replyingTo
      ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.senderName }
      : undefined;

    const textToSend = inputText.trim();
    setInputText('');
    setReplyingTo(null);

    await sendMessage(textToSend, undefined, undefined, replyData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setUploading(true);
      const res = await uploadMediaToCloudinary(
        file,
        settings.cloudinaryCloudName,
        settings.cloudinaryUploadPreset
      );
      await sendMessage(
        file.name,
        res.url,
        res.type,
        replyingTo
          ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.senderName }
          : undefined
      );
      setReplyingTo(null);
    } catch (err) {
      console.error('File upload error in chat:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEditSubmit = async (msgId: string) => {
    if (!editInputText.trim()) return;
    await editMessage(msgId, editInputText.trim());
    setEditingMsgId(null);
    setEditInputText('');
  };

  const emojis = ['👍', '❤️', '🤲', '✨', '👏', '🕌'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[750px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
      {/* Chat Room Top Bar */}
      <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center font-serif text-emerald-200 text-xl font-bold">
            س
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
              {t('groupChatTitle')}
            </h2>
            <p className="text-[11px] text-emerald-200/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('online')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 smooth-scroll bg-slate-50/50 dark:bg-slate-950/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2">
              🤲
            </div>
            <p className="text-xs max-w-xs">{t('noMessages')}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUid === currentUser?.uid;
            const canManage = isMe || isModerator || isAdmin;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                {/* Sender info */}
                {!isMe && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 mb-0.5">
                    {msg.senderName}
                  </span>
                )}

                {/* Message Bubble Container */}
                <div className="relative max-w-[85%] sm:max-w-md">
                  {/* Reply Reference Preview */}
                  {msg.replyTo && (
                    <div
                      className={`text-xs p-2 rounded-t-xl border-l-4 mb-0.5 ${
                        isMe
                          ? 'bg-emerald-800/80 text-emerald-100 border-emerald-300'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-emerald-600'
                      }`}
                    >
                      <span className="font-bold text-[10px] block opacity-80">
                        {msg.replyTo.senderName}
                      </span>
                      <p className="truncate line-clamp-1">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs relative ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-none'
                    } ${msg.isDeleted ? 'italic opacity-60' : ''}`}
                  >
                    {/* Media image/video if attached */}
                    {msg.mediaUrl && !msg.isDeleted && (
                      <div className="mb-2 rounded-xl overflow-hidden max-h-60 bg-black/10">
                        {msg.mediaType === 'video' ? (
                          <video src={msg.mediaUrl} controls className="w-full max-h-60 object-cover" />
                        ) : (
                          <img
                            src={msg.mediaUrl}
                            alt="Chat attachment"
                            className="w-full max-h-60 object-cover cursor-pointer hover:opacity-95"
                            onClick={() => window.open(msg.mediaUrl, '_blank')}
                          />
                        )}
                      </div>
                    )}

                    {/* Inline edit input vs text */}
                    {editingMsgId === msg.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editInputText}
                          onChange={(e) => setEditInputText(e.target.value)}
                          className="w-full px-2 py-1 bg-white/20 text-white rounded-md text-xs outline-hidden"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingMsgId(null)}
                            className="text-[10px] px-2 py-0.5 rounded bg-black/20"
                          >
                            {t('cancel')}
                          </button>
                          <button
                            onClick={() => handleEditSubmit(msg.id)}
                            className="text-[10px] px-2 py-0.5 rounded bg-white text-emerald-900 font-bold"
                          >
                            {t('save')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    )}

                    {/* Timestamp & edited indicator */}
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isMe ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.isEdited && <span>({t('edited')})</span>}
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Reaction Badges on Bubble */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 ml-1">
                      {Object.values(msg.reactions).map((emoji, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded-full text-xs shadow-xs border border-slate-200 dark:border-slate-700"
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Overlay on hover/tap */}
                  {!msg.isDeleted && (
                    <div
                      className={`absolute top-0 ${
                        isMe ? '-left-20' : '-right-20'
                      } hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-md z-10`}
                    >
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="text-slate-500 hover:text-emerald-600 p-1"
                        title={t('reply')}
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reactToMessage(msg.id, '❤️')}
                        className="text-xs hover:scale-125 transition-transform"
                        title="React"
                      >
                        ❤️
                      </button>
                      <button
                        onClick={() => reactToMessage(msg.id, '👍')}
                        className="text-xs hover:scale-125 transition-transform"
                        title="React"
                      >
                        👍
                      </button>
                      {isMe && (
                        <button
                          onClick={() => {
                            setEditingMsgId(msg.id);
                            setEditInputText(msg.text);
                          }}
                          className="text-slate-500 hover:text-blue-600 p-1"
                          title={t('edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canManage && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Replying-to Preview Bar */}
      {replyingTo && (
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-100 dark:border-emerald-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bold text-emerald-800 dark:text-emerald-300">
              {replyingTo.senderName}:
            </span>
            <span className="truncate text-slate-600 dark:text-slate-400">{replyingTo.text}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Bar Trigger */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-400 hover:text-amber-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-slate-400 hover:text-emerald-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          title={t('uploadPhoto')}
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={uploading ? 'মিডিয়া আপলোড হচ্ছে...' : t('typeMessage')}
          disabled={uploading || !currentUser}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || uploading || !currentUser}
          className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
