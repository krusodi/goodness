import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Settings,
  Users,
  Shield,
  KeyRound,
  Trash2,
  Database,
  Download,
  Upload,
  Palette,
  Type,
  AlertTriangle,
  Check,
  RotateCcw,
  UserPlus,
  Lock,
  X
} from 'lucide-react';

export const AdminManagementView: React.FC = () => {
  const {
    currentUser,
    users,
    addUser,
    updateUserPassword,
    deleteUser,
    settings,
    updateSettings,
    resetSettings,
    clearMerits,
    clearDemerits,
    clearAllData,
    resetToDemo,
    exportJSON,
    importJSON,
    setLoginModalOpen,
    showToast
  } = useApp();

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'users' | 'security' | 'data' | 'theme'>('users');

  // User Management Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [addUserOpen, setAddUserOpen] = useState(false);

  // User Delete 2-step confirm tracker
  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<string | null>(null);

  // Change Password for any user Modal State
  const [changingPassUser, setChangingPassUser] = useState<{ id: string; name: string } | null>(null);
  const [targetNewPass, setTargetNewPass] = useState('');

  // Change My Password State
  const [myNewPassword, setMyNewPassword] = useState('');
  const [myConfirmPassword, setMyConfirmPassword] = useState('');

  // 3-Step Confirmation Modal State for Data Clearing
  // Action type: 'merits' | 'demerits' | 'all'
  const [clearModalAction, setClearModalAction] = useState<'merits' | 'demerits' | 'all' | null>(null);
  const [clearStep, setClearStep] = useState<number>(1);

  // Theme Settings local state
  const [systemName, setSystemName] = useState(settings.system_name);
  const [schoolName, setSchoolName] = useState(settings.school_name);
  const [academicYear, setAcademicYear] = useState(settings.academic_year);
  const [bgColor, setBgColor] = useState(settings.bg_color);
  const [surfaceColor, setSurfaceColor] = useState(settings.surface_color);
  const [textColor, setTextColor] = useState(settings.text_color);
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondary_color);
  const [fontSize, setFontSize] = useState<number>(settings.font_size);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If not logged in as admin, show lock guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-lg mx-auto text-center border border-slate-100 shadow-sm mt-8 space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-rose-100">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">พื้นที่เฉพาะผู้ดูแลระบบ (Admin)</h2>
        <p className="text-xs text-slate-500">
          กรุณาเข้าสู่ระบบด้วยบัญชี Admin เพื่อจัดการผู้ใช้ ล้างข้อมูล หรือตั้งค่าระบบ
        </p>
        <button
          onClick={() => setLoginModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
        >
          เข้าสู่ระบบด้วยบัญชี Admin
        </button>
      </div>
    );
  }

  // Handle Add User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addUser({
      username: newUsername,
      password: newPassword,
      role: newRole,
      name: newName
    });
    if (res.success) {
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewRole('user');
      setAddUserOpen(false);
    }
  };

  // Handle Delete User with 2-click confirm
  const handleDeleteUserClick = (userId: string) => {
    if (deleteUserConfirmId === userId) {
      deleteUser(userId);
      setDeleteUserConfirmId(null);
    } else {
      setDeleteUserConfirmId(userId);
      showToast('คลิกปุ่มลบอีกครั้งเพื่อยืนยัน', 'info');
      setTimeout(() => {
        setDeleteUserConfirmId((prev) => (prev === userId ? null : prev));
      }, 4000);
    }
  };

  // Handle Save User Password
  const handleSaveUserPassword = () => {
    if (!changingPassUser || !targetNewPass.trim()) return;
    const res = updateUserPassword(changingPassUser.id, targetNewPass);
    if (res.success) {
      setChangingPassUser(null);
      setTargetNewPass('');
    }
  };

  // Handle Change My Password
  const handleSaveMyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.is_default_admin || currentUser.username.toLowerCase() === 'admin') {
      showToast('ไม่สามารถเปลี่ยนรหัสผ่านของ Admin ระบบเริ่มต้นได้ (ตามข้อกำหนด)', 'error');
      return;
    }
    if (myNewPassword !== myConfirmPassword) {
      showToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'error');
      return;
    }
    const res = updateUserPassword(currentUser.id, myNewPassword);
    if (res.success) {
      setMyNewPassword('');
      setMyConfirmPassword('');
    }
  };

  // Handle 3-step clear data confirmation
  const handleClearModalNext = () => {
    if (clearStep < 3) {
      setClearStep(clearStep + 1);
    } else {
      // Step 3 confirmed! Execute destructive action
      if (clearModalAction === 'merits') {
        clearMerits();
      } else if (clearModalAction === 'demerits') {
        clearDemerits();
      } else if (clearModalAction === 'all') {
        clearAllData();
      }
      setClearModalAction(null);
      setClearStep(1);
    }
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save Theme and Content Settings
  const handleSaveThemeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      system_name: systemName,
      school_name: schoolName,
      academic_year: academicYear,
      bg_color: bgColor,
      surface_color: surfaceColor,
      text_color: textColor,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      font_size: fontSize
    });
  };

  const handleResetColors = () => {
    setBgColor('#f0fdf4');
    setSurfaceColor('#ffffff');
    setTextColor('#14532d');
    setPrimaryColor('#16a34a');
    setSecondaryColor('#22c55e');
    setFontSize(16);
    resetSettings();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>ระบบจัดการสำหรับแอดมิน</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            แผงควบคุมระบบ (Admin Console)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการบัญชีผู้ใช้ ความปลอดภัย ฐานข้อมูล และปรับแต่งสี/ชื่อระบบ
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800 self-start md:self-center">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>เข้าสู่ระบบในฐานะ: {currentUser.name}</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            adminTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. จัดการผู้ใช้ ({users.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            adminTab === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>2. เปลี่ยนรหัสผ่านของฉัน</span>
        </button>

        <button
          onClick={() => setAdminTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            adminTab === 'data'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>3. จัดการข้อมูล & สำรอง/กู้คืน</span>
        </button>

        <button
          onClick={() => setAdminTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            adminTab === 'theme'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>4. ตั้งค่าระบบ & ธีมสี</span>
        </button>
      </div>

      {/* ---------------- TAB 1: USER MANAGEMENT ---------------- */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">บัญชีผู้ใช้งานในระบบ</h2>
              <p className="text-xs text-slate-500">
                แอดมินสามารถเพิ่มผู้บันทึก (User) และเปลี่ยนรหัสผ่านได้
              </p>
            </div>

            <button
              onClick={() => setAddUserOpen(!addUserOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all self-start sm:self-center"
            >
              <UserPlus className="w-4 h-4" />
              <span>{addUserOpen ? 'ปิดฟอร์ม' : 'เพิ่มผู้ใช้ใหม่'}</span>
            </button>
          </div>

          {/* Add User Form */}
          {addUserOpen && (
            <form
              onSubmit={handleAddUserSubmit}
              className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-xs"
            >
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-700" />
                เพิ่มผู้ใช้ใหม่
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    ชื่อผู้ใช้ (Username)
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="เช่น kru_malee"
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="รหัสผ่าน"
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    ชื่อ-นามสกุล / ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="เช่น ครูมาลี ศรีสุข"
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1">
                    บทบาท (Role)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="user">ผู้บันทึก (User)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddUserOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกผู้ใช้</span>
                </button>
              </div>
            </form>
          )}

          {/* User List Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                    <th className="py-3 px-4">ชื่อผู้ใช้ (Username)</th>
                    <th className="py-3 px-4 text-center">บทบาท (Role)</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isHardcodedAdmin = u.is_default_admin || u.username.toLowerCase() === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {u.name}
                          {isHardcodedAdmin && (
                            <span className="text-[10px] ml-2 font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ระบบเริ่มต้น
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {u.username}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้บันทึก (User)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Change Password for User */}
                            {!isHardcodedAdmin && (
                              <button
                                onClick={() => {
                                  setChangingPassUser({ id: u.id, name: u.name });
                                  setTargetNewPass('');
                                }}
                                className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 flex items-center gap-1"
                                title="เปลี่ยนรหัสผ่าน"
                              >
                                <KeyRound className="w-3 h-3 text-slate-500" />
                                <span>เปลี่ยนรหัส</span>
                              </button>
                            )}

                            {/* Delete User (2 clicks) */}
                            {!isHardcodedAdmin ? (
                              <button
                                onClick={() => handleDeleteUserClick(u.id)}
                                className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                                  deleteUserConfirmId === u.id
                                    ? 'bg-rose-600 text-white font-bold animate-pulse'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                                title="ลบผู้ใช้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {deleteUserConfirmId === u.id && <span>ยืนยันลบ?</span>}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">ไม่สามารถลบได้</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: CHANGE MY PASSWORD ---------------- */}
      {adminTab === 'security' && (
        <div className="max-w-md bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>เปลี่ยนรหัสผ่านของฉัน ({currentUser.name})</span>
          </div>

          {currentUser.is_default_admin || currentUser.username.toLowerCase() === 'admin' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>ข้อจำกัด Admin ระบบเริ่มต้น</span>
              </div>
              <p>
                Admin ระบบเริ่มต้น (ชื่อ: Admin, รหัส: kruyb) ถูกล็อกไว้ตามข้อกำหนดระบบเพื่อป้องกันการลืมรหัสผ่านหลัก
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveMyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
                  value={myNewPassword}
                  onChange={(e) => setMyNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
                  value={myConfirmPassword}
                  onChange={(e) => setMyConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                ยืนยันการเปลี่ยนรหัสผ่าน
              </button>
            </form>
          )}
        </div>
      )}

      {/* ---------------- TAB 3: DATA MANAGEMENT & BACKUP ---------------- */}
      {adminTab === 'data' && (
        <div className="space-y-6">
          {/* Backup & Restore Panel */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>สำรองและกู้คืนข้อมูล (Backup & Restore)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ดาวน์โหลดไฟล์สำรองข้อมูล (JSON) เก็บไว้ในเครื่อง หรือนำเข้าไฟล์ JSON เพื่อกู้คืนข้อมูล
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={exportJSON}
                className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Download className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-mono text-emerald-700">.json</span>
                </div>
                <div className="font-bold text-sm text-emerald-950">สำรองข้อมูล (Download JSON)</div>
                <div className="text-xs text-emerald-700 mt-1">บันทึกข้อมูลนักเรียน บันทึกคะแนน และการตั้งค่า</div>
              </button>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-left transition-all cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <div className="flex items-center justify-between mb-2">
                  <Upload className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-mono text-blue-700">.json</span>
                </div>
                <div className="font-bold text-sm text-blue-950">กู้คืนข้อมูล (Upload JSON)</div>
                <div className="text-xs text-blue-700 mt-1">เลือกไฟล์สำรองข้อมูล JSON เพื่อนำเข้าสู่ระบบ</div>
              </div>

              <button
                onClick={resetToDemo}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <RotateCcw className="w-5 h-5 text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[11px] text-slate-400">เริ่มต้นใหม่</span>
                </div>
                <div className="font-bold text-sm text-slate-800">ล้างระบบเป็นค่าเริ่มต้น (Reset System)</div>
                <div className="text-xs text-slate-500 mt-1">ลบข้อมูลนักเรียนและคะแนนทั้งหมด เริ่มต้นระบบสะอาด</div>
              </button>
            </div>
          </div>

          {/* Danger Zone: Clear Data with 3-Step Confirmation */}
          <div className="bg-rose-50/60 rounded-2xl p-5 sm:p-6 border border-rose-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>พื้นที่จัดการข้อมูลระดับสูง (ยืนยัน 3 ครั้งก่อนลบ)</span>
              </h2>
              <p className="text-xs text-rose-700 mt-1">
                การล้างข้อมูลจะลบรายการออกจากระบบอย่างถาวร กรุณาสำรองข้อมูลก่อนทำรายการ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => {
                  setClearModalAction('merits');
                  setClearStep(1);
                }}
                className="p-3.5 bg-white hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-rose-900">🗑️ ล้างบันทึกความดี</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">ยืนยัน 3 ครั้ง</span>
                </div>
                <p className="text-[11px] text-slate-500">ลบบันทึกคะแนนความดีทั้งหมด คงรายชื่อนักเรียนไว้</p>
              </button>

              <button
                onClick={() => {
                  setClearModalAction('demerits');
                  setClearStep(1);
                }}
                className="p-3.5 bg-white hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-rose-900">🗑️ ล้างหักคะแนน</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">ยืนยัน 3 ครั้ง</span>
                </div>
                <p className="text-[11px] text-slate-500">ลบรายการหักคะแนนทั้งหมด คงรายชื่อนักเรียนไว้</p>
              </button>

              <button
                onClick={() => {
                  setClearModalAction('all');
                  setClearStep(1);
                }}
                className="p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-left transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">🗑️ ล้างข้อมูลทั้งหมด</span>
                  <span className="text-[10px] bg-rose-800 text-rose-100 px-1.5 py-0.5 rounded">ยืนยัน 3 ครั้ง</span>
                </div>
                <p className="text-[11px] text-rose-100">ลบทั้งนักเรียนและบันทึกคะแนนทั้งหมดในระบบ</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: THEME & CONTENT SETTINGS ---------------- */}
      {adminTab === 'theme' && (
        <form onSubmit={handleSaveThemeSettings} className="space-y-6">
          {/* Content Settings */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Type className="w-5 h-5 text-emerald-600" />
              <span>ตั้งค่าข้อความระบบ (Content Settings)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อระบบ
                </label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อโรงเรียน
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ปีการศึกษา
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Color Picker & Font Settings */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                <span>ตั้งค่าสีและขนาดตัวอักษร (Color & Font Settings)</span>
              </h2>
              <button
                type="button"
                onClick={handleResetColors}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline"
              >
                คืนค่าสีเริ่มต้น
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {/* Bg Color */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  🟢 สีพื้นหลัง (Background)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-xs">{bgColor}</span>
                </div>
              </div>

              {/* Surface Color */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  ⚪ สีพื้นผิว (Surface)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={surfaceColor}
                    onChange={(e) => setSurfaceColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-xs">{surfaceColor}</span>
                </div>
              </div>

              {/* Text Color */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  🟩 สีข้อความ (Text)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-xs">{textColor}</span>
                </div>
              </div>

              {/* Primary Color */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  🟦 สีหลัก (Primary)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-xs">{primaryColor}</span>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  🟩 สีรอง (Secondary)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-xs">{secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Font Config */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">รูปแบบตัวอักษร: Kanit (มาตรฐาน)</span>
                <span className="text-[11px] text-slate-400">แบบอักษรภาษาไทยที่อ่านง่ายและสวยงาม</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">ขนาดตัวอักษรพื้นฐาน:</span>
                {[14, 15, 16, 18].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono font-bold border ${
                      fontSize === size
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                บันทึกการตั้งค่าทั้งหมด
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3-Step Confirmation Modal for Destructive Data Deletion */}
      {clearModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
            <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>ยืนยันการล้างข้อมูล (ขั้นตอนที่ {clearStep}/3)</span>
              </div>
              <button
                onClick={() => setClearModalAction(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                {clearStep === 1 && (
                  <div>
                    <strong>ขั้นที่ 1:</strong> คุณกำลังจะ
                    {clearModalAction === 'merits' && ' "ล้างบันทึกความดีทั้งหมด" '}
                    {clearModalAction === 'demerits' && ' "ล้างบันทึกหักคะแนนทั้งหมด" '}
                    {clearModalAction === 'all' && ' "ล้างข้อมูลนักเรียนและคะแนนทั้งหมด" '}
                    คุณแน่ใจหรือไม่?
                  </div>
                )}
                {clearStep === 2 && (
                  <div>
                    <strong>ขั้นที่ 2 (คำเตือน):</strong> ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้เว้นแต่คุณจะดาวน์โหลดสำรองข้อมูลไว้แล้ว คุณยังต้องการดำเนินการต่อหรือไม่?
                  </div>
                )}
                {clearStep === 3 && (
                  <div className="font-bold text-rose-700">
                    <strong>ขั้นที่ 3 (ยืนยันครั้งสุดท้าย):</strong> ยืนยันการลบอย่างถาวรทันที!
                  </div>
                )}
              </div>

              {/* Progress indicators */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      step <= clearStep
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClearModalAction(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleClearModalNext}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
                >
                  {clearStep < 3 ? `ดำเนินการต่อ (ขั้นที่ ${clearStep + 1})` : 'ยืนยันล้างข้อมูลทันที'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password for User Modal */}
      {changingPassUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">เปลี่ยนรหัสผ่านผู้ใช้</h3>
              <button
                onClick={() => setChangingPassUser(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600">
                ผู้ใช้: <strong>{changingPassUser.name}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="text"
                  value={targetNewPass}
                  onChange={(e) => setTargetNewPass(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setChangingPassUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveUserPassword}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  บันทึกรหัสผ่านใหม่
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
