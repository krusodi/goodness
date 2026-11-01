import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, X, Lock, User, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, login, users } = useApp();
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('kruyb');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const adminUser = users.find((u) => u.username.toLowerCase() === 'admin') || users.find((u) => u.role === 'admin');
  const teacherUser = users.find((u) => u.username.toLowerCase() === 'kru_somchai') || users.find((u) => u.role === 'user');

  if (!loginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    }, 200);
  };

  const handleQuickFillAdmin = () => {
    setUsername(adminUser ? adminUser.username : 'Admin');
    setPassword(adminUser ? adminUser.password : 'kruyb');
    setError(null);
  };

  const handleQuickFillTeacher = () => {
    setUsername(teacherUser ? teacherUser.username : 'kru_somchai');
    setPassword(teacherUser ? teacherUser.password : '123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">เข้าสู่ระบบบันทึกความดี</h2>
              <p className="text-xs text-emerald-100">สำหรับคุณครูและผู้ดูแลระบบ</p>
            </div>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผู้ใช้ (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ เช่น Admin"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick autofill helper as described in prompt */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
              คลิกเพื่อเติมรหัสผ่านทดสอบ:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="px-2.5 py-2 text-xs text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2 min-w-0"
              >
                <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] text-emerald-950 truncate">
                    {adminUser ? adminUser.name : 'Admin (สิทธิ์เต็ม)'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono truncate">
                    {adminUser ? `${adminUser.username} / ${adminUser.password}` : 'Admin / kruyb'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleQuickFillTeacher}
                className="px-2.5 py-2 text-xs text-left bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl transition-colors flex items-center gap-2 min-w-0"
              >
                <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] text-blue-950 truncate">
                    {teacherUser ? teacherUser.name : 'ครูประจำชั้น'}
                  </div>
                  <div className="text-[10px] text-blue-700 font-mono truncate">
                    {teacherUser ? `${teacherUser.username} / ${teacherUser.password}` : 'kru_somchai / 123'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span>
            </button>
          </div>
        </form>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          ผู้ใช้ทั่วไปสามารถดูข้อมูลคะแนนและอันดับได้ที่หน้าหลักโดยไม่ต้องเข้าสู่ระบบ
        </div>
      </div>
    </div>
  );
};
