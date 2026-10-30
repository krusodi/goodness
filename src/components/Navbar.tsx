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
  Cloud
} from 'lucide-react';

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

  interface NavItem {
    id: 'dashboard' | 'students' | 'merit' | 'demerit' | 'reports' | 'admin';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    requireAuth?: boolean;
    requireAdmin?: boolean;
    highlight?: 'merit' | 'demerit';
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Award },
    { id: 'students', label: 'จัดการนักเรียน', icon: Users, requireAuth: true },
    { id: 'merit', label: 'บันทึกความดี', icon: Star, requireAuth: true, highlight: 'merit' },
    { id: 'demerit', label: 'หักคะแนน', icon: AlertTriangle, requireAuth: true, highlight: 'demerit' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & School */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-200">
                <Award className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-emerald-950 text-base sm:text-lg tracking-tight">
                  {settings.system_name}
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  {settings.school_name}
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = (item.requireAuth && !currentUser) || (item.requireAdmin && currentUser?.role !== 'admin');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.requireAuth, item.requireAdmin)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                  title={isLocked ? 'ต้องเข้าสู่ระบบก่อน' : item.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight === 'merit' ? 'text-amber-500' : item.highlight === 'demerit' ? 'text-rose-500' : 'text-emerald-700'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Firebase Cloud Status Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
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
              <span className="font-semibold hidden sm:inline">
                {isFirebaseConnected ? 'Real-time ทุกเครื่อง' : 'กำลังเชื่อมต่อ...'}
              </span>
              <span className="font-semibold sm:hidden text-[10px]">
                {isFirebaseConnected ? 'Real-time' : '...'}
              </span>
            </div>

            {/* Quick Print Button */}
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="พิมพ์หน้านี้ / บันทึกเป็น PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>พิมพ์</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 flex items-center justify-end gap-1">
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                    )}
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้บันทึกข้อมูล'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ออก</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-emerald-100 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.requireAuth, item.requireAdmin)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.requireAuth && !currentUser && (
                    <span className="text-[11px] text-amber-600 font-normal">ต้องล็อกอิน</span>
                  )}
                </button>
              );
            })}
            
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>พิมพ์รายงานหน้าปัจจุบัน</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
