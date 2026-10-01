import React, { useState } from 'react';
import {
  Image as ImageIcon,
  PlusCircle,
  X,
  Filter,
  Trash2,
  Calendar,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { GalleryAlbum, GalleryItem } from '../../types';
import { Modal } from '../common/Modal';
import { uploadMediaToCloudinary } from '../../services/cloudinary';

export const Gallery: React.FC = () => {
  const { currentUser, isAdmin, isModerator } = useAuth();
  const { gallery, addGalleryItem, deleteGalleryItem, settings } = useData();
  const { t, formatDate, language } = useThemeLanguage();

  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [selectedMediaForLightbox, setSelectedMediaForLightbox] = useState<GalleryItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState<GalleryAlbum>('Memories');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const albums: GalleryAlbum[] = ['Meeting', 'Tour', 'Event', 'Memories', 'Religious', 'Other'];

  const filteredItems = gallery.filter((item) =>
    selectedAlbum === 'all' ? true : item.album === selectedAlbum
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    try {
      setUploading(true);
      const res = await uploadMediaToCloudinary(
        file,
        settings.cloudinaryCloudName,
        settings.cloudinaryUploadPreset
      );
      await addGalleryItem({
        title: title.trim(),
        album,
        mediaUrl: res.url,
        mediaType: res.type,
        description: description.trim(),
      });
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (err) {
      console.error('Gallery upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('photoGallery')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'আস-সাইর কাফেলার বিভিন্ন দ্বীনি সফর, সভা ও স্মৃতিময় মুহূর্তের অ্যালবাম'
              : 'Albums of memorable tours, meetings, and organization events'}
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('uploadPhoto')}</span>
          </button>
        )}
      </div>

      {/* Album Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 smooth-scroll">
        <button
          onClick={() => setSelectedAlbum('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedAlbum === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {language === 'bn' ? 'সকল অ্যালবাম' : 'All Albums'}
        </button>

        {albums.map((alb) => (
          <button
            key={alb}
            onClick={() => setSelectedAlbum(alb)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedAlbum === alb
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {alb}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          {language === 'bn' ? 'এই অ্যালবামে এখনো কোনো ছবি নেই।' : 'No photos in this album yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const canDelete =
              item.uploaderUid === currentUser?.uid || isAdmin || isModerator;

            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs aspect-square flex flex-col justify-end"
              >
                {item.mediaType === 'video' ? (
                  <video src={item.mediaUrl} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setSelectedMediaForLightbox(item)}
                  />
                )}

                {/* Dark Gradient Overlay with Info */}
                <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    {item.album}
                  </span>
                  <h4 className="text-xs font-bold truncate">{item.title}</h4>
                </div>

                {/* Action buttons on hover */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={() => setSelectedMediaForLightbox(item)}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => deleteGalleryItem(item.id)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMediaForLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedMediaForLightbox(null)}
        >
          <button
            onClick={() => setSelectedMediaForLightbox(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMediaForLightbox.mediaType === 'video' ? (
              <video src={selectedMediaForLightbox.mediaUrl} controls autoPlay className="max-h-[75vh] w-auto rounded-xl" />
            ) : (
              <img
                src={selectedMediaForLightbox.mediaUrl}
                alt={selectedMediaForLightbox.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            )}
            <div className="text-white text-center mt-3">
              <h3 className="font-bold text-base">{selectedMediaForLightbox.title}</h3>
              <p className="text-xs text-white/70">{selectedMediaForLightbox.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title={t('uploadPhoto')}
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'ছবির শিরোনাম' : 'Media Title'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. বার্ষিক কাফেলা সফর ২০২৬"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('album')}
              </label>
              <select
                value={album}
                onChange={(e) => setAlbum(e.target.value as GalleryAlbum)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                {albums.map((alb) => (
                  <option key={alb} value={alb}>
                    {alb}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'ছবি বা ভিডিও ফাইল' : 'File'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                required
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)' : 'Description (Optional)'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="স্মৃতি বা স্থান সম্পর্কিত মন্তব্য..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                {uploading ? t('loading') : t('save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
