import React, { useRef, useState } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Plus, 
  X, 
  Check, 
  Play, 
  Clock, 
  Film, 
  Sparkles, 
  Maximize2, 
  Palette, 
  FileVideo,
  Layers,
  Info
} from 'lucide-react';
import { PostContentType, SocialPlatform } from '../../types';
import { MEDIA_PRESETS, VIDEO_PRESETS, VideoPreset } from '../../data/initialData';

export interface TextCardTheme {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const TEXT_CARD_THEMES: TextCardTheme[] = [
  { id: 'clean', name: 'Clean White', bgClass: 'bg-white', textClass: 'text-slate-900', borderClass: 'border-slate-200' },
  { id: 'midnight', name: 'Midnight Dark', bgClass: 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950', textClass: 'text-white', borderClass: 'border-slate-700' },
  { id: 'gradient-indigo', name: 'Electric Indigo', bgClass: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600', textClass: 'text-white', borderClass: 'border-indigo-400' },
  { id: 'sunset', name: 'Sunset Glow', bgClass: 'bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600', textClass: 'text-white', borderClass: 'border-rose-300' },
  { id: 'emerald', name: 'Emerald Forest', bgClass: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900', textClass: 'text-white', borderClass: 'border-emerald-400' },
  { id: 'quote', name: 'Editorial Quote', bgClass: 'bg-amber-50/70 border-l-4 border-l-amber-500', textClass: 'text-slate-900 font-serif italic', borderClass: 'border-amber-200' },
];

interface PostMediaControlsProps {
  postType: PostContentType;
  onSelectPostType: (type: PostContentType) => void;
  // Photos props
  mediaUrls: string[];
  onAddMediaUrl: (url: string) => void;
  onRemoveMediaUrl: (index: number) => void;
  onClearMediaUrls: () => void;
  photoAspectRatio: '1:1' | '4:5' | '16:9';
  onSetPhotoAspectRatio: (ar: '1:1' | '4:5' | '16:9') => void;
  // Video props
  videoUrl: string;
  onSetVideoUrl: (url: string) => void;
  videoThumbnail: string;
  onSetVideoThumbnail: (thumb: string) => void;
  videoDuration: number;
  onSetVideoDuration: (dur: number) => void;
  videoAspectRatio: '16:9' | '9:16';
  onSetVideoAspectRatio: (ar: '16:9' | '9:16') => void;
  // Text Card styling props
  textBackground: string;
  onSetTextBackground: (bg: string) => void;
  selectedPlatforms: SocialPlatform[];
}

export const PostMediaControls: React.FC<PostMediaControlsProps> = ({
  postType,
  onSelectPostType,
  mediaUrls,
  onAddMediaUrl,
  onRemoveMediaUrl,
  onClearMediaUrls,
  photoAspectRatio,
  onSetPhotoAspectRatio,
  videoUrl,
  onSetVideoUrl,
  videoThumbnail,
  onSetVideoThumbnail,
  videoDuration,
  onSetVideoDuration,
  videoAspectRatio,
  onSetVideoAspectRatio,
  textBackground,
  onSetTextBackground,
  selectedPlatforms,
}) => {
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [customVideoInput, setCustomVideoInput] = useState('');
  const [customThumbInput, setCustomThumbInput] = useState('');
  const fileImageRef = useRef<HTMLInputElement>(null);
  const fileVideoRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          onAddMediaUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Handle local video file upload
  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    onSetVideoUrl(objectUrl);
    // Extract default duration / thumbnail or placeholder
    onSetVideoDuration(30);
    onSetVideoThumbnail('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80');

    if (e.target) e.target.value = '';
  };

  const handleSelectVideoPreset = (preset: VideoPreset) => {
    onSetVideoUrl(preset.url);
    onSetVideoThumbnail(preset.thumbnailUrl);
    onSetVideoDuration(preset.duration);
    onSetVideoAspectRatio(preset.aspectRatio === '9:16' ? '9:16' : '16:9');
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoInput.trim()) return;
    onAddMediaUrl(customPhotoInput.trim());
    setCustomPhotoInput('');
  };

  const handleApplyCustomVideo = () => {
    if (!customVideoInput.trim()) return;
    onSetVideoUrl(customVideoInput.trim());
    if (customThumbInput.trim()) {
      onSetVideoThumbnail(customThumbInput.trim());
    } else if (!videoThumbnail) {
      onSetVideoThumbnail('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80');
    }
    setCustomVideoInput('');
  };

  const isTikTokSelected = selectedPlatforms.includes('tiktok');
  const isInstagramSelected = selectedPlatforms.includes('instagram');

  return (
    <div className="space-y-4">
      {/* 3-Option Primary Post Type Switcher */}
      <div className="p-1.5 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between px-2 py-1 mb-1">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Choose Post Format
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {postType === 'video' && '🎬 MP4, Reels & Shorts'}
            {postType === 'photos' && '🖼️ Carousels & Single Photos'}
            {postType === 'text' && '📝 Copy, Threads & Cards'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {/* Option 1: Video */}
          <button
            type="button"
            onClick={() => onSelectPostType('video')}
            className={`min-h-[46px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              postType === 'video'
                ? 'bg-white text-indigo-700 shadow-xs ring-2 ring-indigo-500/20 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Video className={`w-4 h-4 ${postType === 'video' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div className="text-left">
              <span className="block leading-tight">Video</span>
              <span className="text-[10px] font-normal text-slate-400 block leading-tight">Reels & Clips</span>
            </div>
            {videoUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto shrink-0" title="Video attached" />
            )}
          </button>

          {/* Option 2: Photos */}
          <button
            type="button"
            onClick={() => onSelectPostType('photos')}
            className={`min-h-[46px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              postType === 'photos'
                ? 'bg-white text-indigo-700 shadow-xs ring-2 ring-indigo-500/20 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ImageIcon className={`w-4 h-4 ${postType === 'photos' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div className="text-left">
              <span className="block leading-tight">Photos</span>
              <span className="text-[10px] font-normal text-slate-400 block leading-tight">Multi-image</span>
            </div>
            {mediaUrls.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 ml-auto shrink-0 font-mono">
                {mediaUrls.length}
              </span>
            )}
          </button>

          {/* Option 3: Text */}
          <button
            type="button"
            onClick={() => onSelectPostType('text')}
            className={`min-h-[46px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              postType === 'text'
                ? 'bg-white text-indigo-700 shadow-xs ring-2 ring-indigo-500/20 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Type className={`w-4 h-4 ${postType === 'text' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <div className="text-left">
              <span className="block leading-tight">Text</span>
              <span className="text-[10px] font-normal text-slate-400 block leading-tight">Clean & Cards</span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🎬 VIDEO SECTION CONTROLS                                 */}
      {/* ========================================================= */}
      {postType === 'video' && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Video className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Video Attachments & Player</h4>
                <p className="text-[11px] text-slate-500">
                  Select a video clip, upload MP4 file, or paste video streaming link
                </p>
              </div>
            </div>

            {videoUrl && (
              <button
                type="button"
                onClick={() => onSetVideoUrl('')}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Remove video
              </button>
            )}
          </div>

          {/* Video Aspect Ratio & Specs Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-indigo-600" />
              <span>Video Aspect Ratio</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSetVideoAspectRatio('16:9')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  videoAspectRatio === '16:9'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                16:9 Widescreen (Landscape)
              </button>
              <button
                type="button"
                onClick={() => onSetVideoAspectRatio('9:16')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  videoAspectRatio === '9:16'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                9:16 Vertical (TikTok / Reels)
              </button>
            </div>
          </div>

          {/* Active Video Preview Player / Status */}
          {videoUrl ? (
            <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  <span>Ready for Dispatch</span>
                </span>
                <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {videoDuration}s duration · {videoAspectRatio}
                </span>
              </div>

              <div className="relative rounded-lg overflow-hidden bg-black max-h-48 flex items-center justify-center">
                <video
                  src={videoUrl}
                  controls
                  poster={videoThumbnail}
                  className="max-h-48 w-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-white text-center space-y-2">
              <Film className="w-8 h-8 text-indigo-400 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">No video attached yet</p>
                <p className="text-[11px] text-slate-500">
                  Pick from curated HD presets below, upload a file, or paste an MP4 link
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileVideoRef}
                  onChange={handleLocalVideoUpload}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileVideoRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video (MP4 / WebM)</span>
                </button>
              </div>
            </div>
          )}

          {/* Curated Video Presets */}
          <div>
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Curated Video Clips (1-Click Attach)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIDEO_PRESETS.map((preset) => {
                const isSelected = videoUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectVideoPreset(preset)}
                    className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all group ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-200 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-video relative bg-slate-800">
                      <img
                        src={preset.thumbnailUrl}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center group-hover:bg-slate-900/20 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-white/90 text-indigo-700 flex items-center justify-center shadow-xs">
                          <Play className="w-3 h-3 fill-indigo-700 ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-mono px-1 py-0.2 rounded">
                        0:{preset.duration < 10 ? `0${preset.duration}` : preset.duration}
                      </span>
                    </div>

                    <div className="p-1.5 bg-white">
                      <p className="text-[11px] font-semibold text-slate-800 truncate">
                        {preset.title}
                      </p>
                      <span className="text-[9px] text-slate-400">
                        {preset.category} · {preset.aspectRatio}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paste Video URL */}
          <div className="pt-1">
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Or paste direct video URL:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customVideoInput}
                onChange={(e) => setCustomVideoInput(e.target.value)}
                placeholder="https://.../video.mp4"
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleApplyCustomVideo}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Apply Video
              </button>
            </div>
          </div>

          {/* Platform Recommendation Advice */}
          {(isTikTokSelected || isInstagramSelected) && (
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-start gap-2 text-xs text-amber-800">
              <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Reels & TikTok Tip:</strong> Vertical 9:16 videos with a duration under 60 seconds achieve highest algorithmic distribution and full-bleed viewing.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 🖼️ PHOTOS SECTION CONTROLS                                */}
      {/* ========================================================= */}
      {postType === 'photos' && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <ImageIcon className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Photo Attachments ({mediaUrls.length}/10)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Attach multiple images for carousels or single hero photos
                </p>
              </div>
            </div>

            {mediaUrls.length > 0 && (
              <button
                type="button"
                onClick={onClearMediaUrls}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Clear all photos
              </button>
            )}
          </div>

          {/* Photo Aspect Ratio Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Image Crop & Ratio</span>
            </span>

            <div className="flex items-center gap-1">
              {[
                { id: '1:1' as const, label: '1:1 Square (Instagram/Feed)' },
                { id: '4:5' as const, label: '4:5 Portrait (Mobile Feed)' },
                { id: '16:9' as const, label: '16:9 Landscape (Twitter/LinkedIn)' },
              ].map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => onSetPhotoAspectRatio(ar.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    photoAspectRatio === ar.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attached Photos Strip (with remove and counter) */}
          {mediaUrls.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Selected Photos (Drag or click × to remove)
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {mediaUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-indigo-500 shrink-0 group bg-slate-100 shadow-2xs"
                  >
                    <img
                      src={url}
                      alt={`Attached photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                      #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveMediaUrl(idx)}
                      className="absolute top-1 right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {mediaUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileImageRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] font-medium">+ Add Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Local Image Button & Preset Picker */}
          <div>
            <input
              type="file"
              ref={fileImageRef}
              onChange={handleLocalImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Photo Gallery Presets (Click to add/remove)
              </span>
              <button
                type="button"
                onClick={() => fileImageRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {MEDIA_PRESETS.map((preset) => {
                const isSelected = mediaUrls.includes(preset.url);
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      if (isSelected) {
                        const idx = mediaUrls.indexOf(preset.url);
                        if (idx >= 0) onRemoveMediaUrl(idx);
                      } else {
                        onAddMediaUrl(preset.url);
                      }
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-200 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-1">
                      <span className="text-[9px] text-white font-medium truncate block">
                        {preset.title}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paste Custom Image URL */}
          <div className="pt-1">
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Or paste image URL:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                placeholder="https://.../photo.jpg"
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Attach URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📝 TEXT SECTION CONTROLS (CARDS & TYPOGRAPHY)             */}
      {/* ========================================================= */}
      {postType === 'text' && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Palette className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Text Post Styling & Graphic Card Options
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select a card style for Facebook, Instagram quotes, or clean copy for Twitter/LinkedIn
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEXT_CARD_THEMES.map((theme) => {
              const isSelected = textBackground === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSetTextBackground(theme.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${theme.bgClass} ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-xs' : theme.borderClass
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold ${theme.textClass}`}>
                      {theme.name}
                    </span>
                    {isSelected && (
                      <Check className={`w-3 h-3 ${theme.id === 'clean' || theme.id === 'quote' ? 'text-indigo-600' : 'text-white'}`} />
                    )}
                  </div>
                  <p className={`text-[10px] opacity-80 truncate ${theme.textClass}`}>
                    Sample post preview text...
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
