import React, { useState } from 'react';
import { GreetingData } from '../types';
import { X, Flame, Edit3, Check, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  greeting: GreetingData;
  onSaveGreeting: (updated: GreetingData) => void;
}

export const GreetingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  greeting,
  onSaveGreeting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [recipient, setRecipient] = useState(greeting.recipient);
  const [sender, setSender] = useState(greeting.sender);
  const [streakDays, setStreakDays] = useState(greeting.streakDays);
  const [message, setMessage] = useState(greeting.message);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveGreeting({
      ...greeting,
      recipient,
      sender,
      streakDays: Number(streakDays) || 500,
      message,
    });
    setIsEditing(false);
    sounds.playChime();
  };

  return (
    <div
      id="greeting-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="greeting-modal-content"
        className="relative w-full max-w-lg bg-[#faf6ed] text-[#2c221e] rounded-2xl shadow-2xl p-6 sm:p-8 border-4 border-[#e6d7bf] transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="btn-close-greeting"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-600 hover:bg-stone-200/70 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#e6d7bf] pb-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center text-2xl shadow-inner">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-orange-900 font-['Cinzel']">
                CONGRATS STREAK!
              </h2>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {streakDays} Days
              </span>
            </div>
            <p className="text-xs text-orange-800/80 font-medium">
              Milestone Pencapaian Konsistensi Tanpa Terputus
            </p>
          </div>
        </div>

        {/* Modal Body */}
        {!isEditing ? (
          <div className="space-y-4">
            <div className="bg-[#f3ede0] p-4 rounded-xl border border-[#dfd4be]">
              <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-1">
                Penerima Ucapan:
              </div>
              <div className="text-lg font-bold text-stone-900">
                {greeting.recipient}
              </div>
            </div>

            <div className="p-4 bg-white/70 rounded-xl border border-[#dfd4be]/80 text-stone-800 leading-relaxed font-['Plus_Jakarta_Sans']">
              <p className="whitespace-pre-line text-sm sm:text-base">
                {greeting.message}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs text-stone-500 border-t border-[#e6d7bf]">
              <div>
                <span className="font-semibold text-stone-700">Tertanda:</span> {greeting.sender}
              </div>
              <div className="font-mono">{greeting.dateStr}</div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                id="btn-edit-card"
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm py-2.5 px-4 rounded-xl border border-stone-300 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Pesan & Nama
              </button>
              <button
                id="btn-confirm-card"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Simpan & Nikmati 3D
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Penerima:
              </label>
              <input
                type="text"
                id="input-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Contoh: Hani / Sahabatku"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jumlah Hari Streak:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="input-streak-days"
                    value={streakDays}
                    onChange={(e) => setStreakDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Flame className="w-4 h-4 text-orange-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pengirim:
                </label>
                <input
                  type="text"
                  id="input-sender"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nama Kamu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pesan Ucapan Hangat:
              </label>
              <textarea
                rows={4}
                id="textarea-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                id="btn-cancel-edit"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-save-edit"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors shadow"
              >
                <Check className="w-3.5 h-3.5" />
                Perbarui Kartu 3D
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
