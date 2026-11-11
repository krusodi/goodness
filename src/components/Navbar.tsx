import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Users,
  Star,
  AlertTriangle,
  FileText,
  Settings,
  LogIn,
  LogOut,
  Printer,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  Cloud,
  Edit2
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';

export const Navbar: React.FC = () => {
  const {
    settings,
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    setLoginModalOpen,
    isFirebaseConnected,
    firebaseProjectId
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  interface NavItem {
    id: 'dashboard' | 'attendance' | 'students' | 'merit' | 'demerit' | 'reports' | 'admin';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    requireAuth?: boolean;
    requireAdmin?: boolean;
    highlight?: 'merit' | 'demerit';
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Award },
    { id: 'attendance', label: 'เช็คชื่อ', icon: UserCheck, requireAuth: true },
    { id: 'students', label: 'จัดการรายชื่อ', icon: Users, requireAuth: true },
    { id: 'merit', label: 'ความดี', icon: Star, requireAuth: true, highlight: 'merit' },
    { id: 'demerit', label: 'พฤติกรรมลบ', icon: AlertTriangle, requireAuth: true, highlight: 'demerit' },
    { id: 'reports', label: 'รายงาน', icon: FileText },
    { id: 'admin', label: 'ระบบจัดการ', icon: Settings, requireAdmin: true }
  ];

  const handleNavClick = (tabId: typeof activeTab, requireAuth?: boolean, requireAdmin?: boolean) => {
    if (requireAuth && !currentUser) {
      setLoginModalOpen(true);
      return;
    }
    if (requireAdmin && currentUser?.role !== 'admin') {
      setLoginModalOpen(true);
      return;
    }
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2.5 lg:gap-3">
          
          {/* Brand & School */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink min-w-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-left focus:outline-none min-w-0 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-xs ring-2 ring-emerald-200 shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-bold text-emerald-950 text-xs sm:text-sm lg:text-[13px] xl:text-base tracking-tight truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[200px] lg:max-w-[170px] xl:max-w-[240px]">
                  {settings.system_name}
                </div>
                <div className="text-[10px] sm:text-xs text-emerald-700 font-medium truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[200px] lg:max-w-[170px] xl:max-w-[240px]">
                  {settings.school_name}
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = (item.requireAuth && !currentUser) || (item.requireAdmin && currentUser?.role !== 'admin');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.requireAuth, item.requireAdmin)}
                  className={`flex items-center gap-1 xl:gap-1.5 px-2 py-1 xl:px-2.5 xl:py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                  title={isLocked ? 'ต้องเข้าสู่ระบบก่อน' : item.label}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive ? 'text-white' : item.highlight === 'merit' ? 'text-amber-500' : item.highlight === 'demerit' ? 'text-rose-500' : 'text-emerald-700'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Firebase Cloud Status Indicator */}
            <div
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 xl:px-2.5 py-1 rounded-full text-[10px] xl:text-[11px] font-semibold border shrink-0 ${
                isFirebaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title={
                isFirebaseConnected
                  ? `เชื่อมต่อฐานข้อมูล Cloud Firestore (${firebaseProjectId}) เรียลไทม์: ทุกอุปกรณ์อัปเดตตรงกันทันทีเมื่อมีการเพิ่มหรือแก้ไขข้อมูล`
                  : 'กำลังเชื่อมต่อฐานข้อมูล Cloud...'
              }
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isFirebaseConnected ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-300/60' : 'bg-amber-400'
                }`}
              />
              <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xl:inline whitespace-nowrap">
                {isFirebaseConnected ? 'Real-time ทุกเครื่อง' : 'กำลังเชื่อมต่อ...'}
              </span>
              <span className="hidden sm:inline xl:hidden whitespace-nowrap">
                {isFirebaseConnected ? 'Real-time' : '...'}
              </span>
            </div>

            {/* Quick Print Button */}
            <button
              onClick={handlePrint}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shrink-0 cursor-pointer shadow-2xs"
              title="พิมพ์รายงาน / พิมพ์เอกสารราชการ (Print / PDF)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden xl:inline">พิมพ์รายงาน / เอกสารราชการ</span>
              <span className="hidden sm:inline xl:hidden">พิมพ์รายงาน</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 shrink-0">
                {/* Desktop User Info */}
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="hidden md:flex flex-col text-right hover:opacity-80 transition-all group focus:outline-none cursor-pointer max-w-[110px] lg:max-w-[130px] xl:max-w-[180px]"
                  title="คลิกเพื่อแก้ไขชื่อ-นามสกุล หรือเปลี่ยนรหัสผ่าน"
                >
                  <span className="text-xs font-semibold text-slate-800 flex items-center justify-end gap-1 group-hover:text-emerald-700 truncate">
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                    <span className="truncate">{currentUser.name}</span>
                    <Edit2 className="w-2.5 h-2.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-600 truncate">
                    {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้บันทึก (User)'}
                  </span>
                </button>

                {/* Mobile/Tablet Compact User Avatar Button */}
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="md:hidden p-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 shrink-0"
                  title={`${currentUser.name} (${currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้บันทึก'}) - คลิกแก้ไข`}
                >
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  )}
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors shrink-0"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ออก</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-emerald-100 space-y-1 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-lg">
            {currentUser && (
              <div className="pb-2.5 mb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <div className="text-left truncate">
                      <div className="font-bold truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-emerald-700 font-normal">
                        {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin) · คลิกแก้ไข' : 'ผู้บันทึก (User) · คลิกแก้ไข'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded text-emerald-700 font-bold border border-emerald-200 shrink-0">
                    แก้ไข
                  </span>
                </button>
              </div>
            )}

            {/* Nav items in mobile drawer */}
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, item.requireAuth, item.requireAdmin)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight === 'merit' ? 'text-amber-500' : item.highlight === 'demerit' ? 'text-rose-500' : 'text-emerald-700'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.requireAuth && !currentUser && (
                      <span className="text-[11px] text-amber-600 font-normal">ต้องล็อกอิน</span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>พิมพ์รายงาน / เอกสารราชการ</span>
              </button>
              {currentUser && (
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Profile & Password Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  );
};
