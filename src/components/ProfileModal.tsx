import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, KeyRound, X, Check, ShieldCheck, UserCheck } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, updateUserPassword, showToast } = useApp();

  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('กรุณากรอกชื่อ - นามสกุล', 'error');
      return;
    }
    const res = updateUserProfile(currentUser.id, { name: name.trim() });
    if (res.success) {
      onClose();
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showToast('กรุณากรอกรหัสผ่านใหม่', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'error');
      return;
    }
    const res = updateUserPassword(currentUser.id, newPassword.trim());
    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs shrink-0">
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              ) : (
                <UserCheck className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate">ข้อมูลบัญชีผู้ใช้งาน</h2>
              <div className="text-xs text-emerald-100 flex items-center gap-1.5 truncate">
                <span className="font-mono">{currentUser.username}</span>
                <span>·</span>
                <span>{currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'คุณครูผู้บันทึก (User)'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs selector */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'profile'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. แก้ไข ชื่อ - นามสกุล</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('password')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeSubTab === 'password'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>2. เปลี่ยนรหัสผ่าน</span>
          </button>
        </div>

        {/* Tab 1: Edit Profile Name */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                disabled
                value={currentUser.username}
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล / ตำแหน่ง
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ครูสมชาย สว่างจิตต์ หรือ ผู้ดูแลระบบ"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ชื่อนี้จะปรากฏในรายงานและประวัติการบันทึกคะแนนความดี
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกชื่อ - นามสกุล</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeSubTab === 'password' && (
          <form onSubmit={handleSavePassword} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ยืนยันเปลี่ยนรหัสผ่าน</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
