import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Image as ImageIcon,
  Send,
  MoreVertical,
  Pin,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Post } from '../../types';
import { uploadMediaToCloudinary } from '../../services/cloudinary';

export const Feed: React.FC = () => {
  const { currentUser, userProfile, isAdmin, isModerator } = useAuth();
  const { posts, comments, createPost, toggleLikePost, addComment, deletePost, settings } = useData();
  const { t, formatDate, language } = useThemeLanguage();

  const [postText, setPostText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !selectedFile) return;

    try {
      setUploading(true);
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;

      if (selectedFile) {
        const uploadResult = await uploadMediaToCloudinary(
          selectedFile,
          settings.cloudinaryCloudName,
          settings.cloudinaryUploadPreset
        );
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
      }

      await createPost(postText.trim(), mediaUrl, mediaType);
      setPostText('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim() || !currentUser) return;
    await addComment(postId, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Create Post Card */}
      {currentUser ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile?.displayName?.charAt(0) || 'U'
                )}
              </div>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={t('whatsOnYourMind')}
                rows={3}
                className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
              />
            </div>

            {selectedFile && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-between text-xs">
                <span className="truncate max-w-xs font-medium text-slate-700 dark:text-slate-300">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-rose-500 hover:text-rose-700 font-bold px-2"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>{t('photoVideo')}</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                />
              </label>

              <button
                type="submit"
                disabled={(!postText.trim() && !selectedFile) || uploading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {uploading ? t('loading') : t('post')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            {t('mustLogin')}
          </p>
        </div>
      )}

      {/* Posts Stream */}
      {posts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {language === 'bn' ? 'ফিডে এখনো কোনো পোস্ট করা হয়নি।' : 'No feed posts yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = currentUser && post.likes?.[currentUser.uid];
            const likeCount = Object.keys(post.likes || {}).length;
            const postCommentsList = comments[post.id] || [];
            const canDelete =
              post.authorUid === currentUser?.uid || isAdmin || isModerator;

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        post.authorName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {post.authorName}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(post.createdAt)} •{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium capitalize">
                          {post.authorRole}
                        </span>
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={t('deletePost')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {post.text}
                </p>

                {/* Attached Media */}
                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden bg-black/10 max-h-96">
                    {post.mediaType === 'video' ? (
                      <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95"
                        onClick={() => window.open(post.mediaUrl, '_blank')}
                      />
                    )}
                  </div>
                )}

                {/* Engagement Bar (Likes, Comments, Share) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-all ${
                        isLiked
                          ? 'text-rose-600 scale-105'
                          : 'text-slate-500 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                      <span>{likeCount}</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-emerald-600"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{postCommentsList.length}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'As Sair Community', text: post.text });
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    title={t('share')}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Comment Drawer / List */}
                {activeCommentPostId === post.id && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="space-y-2 max-h-60 overflow-y-auto smooth-scroll">
                      {postCommentsList.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {c.authorName}
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    {currentUser && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder={t('writeComment')}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-xl bg-emerald-600 text-white"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
