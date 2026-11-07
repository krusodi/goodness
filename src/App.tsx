import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { StudentManagementView } from './components/StudentManagementView';
import { MeritRecordView } from './components/MeritRecordView';
import { DemeritRecordView } from './components/DemeritRecordView';
import { ReportsView } from './components/ReportsView';
import { AdminManagementView } from './components/AdminManagementView';
import { LoginModal } from './components/LoginModal';
import { AcademicYearModal } from './components/AcademicYearModal';
import { Top3ColorModal } from './components/Top3ColorModal';
import { BehaviorPresetModal } from './components/BehaviorPresetModal';
import { FooterDescriptionModal } from './components/FooterDescriptionModal';
import { Toast } from './components/Toast';
import { Pencil } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    settings,
    academicYearModalOpen,
    setAcademicYearModalOpen,
    top3ColorModalOpen,
    setTop3ColorModalOpen,
    behaviorModalOpen,
    setBehaviorModalOpen
  } = useApp();
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string | null>(null);
  const [editFooterModalOpen, setEditFooterModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectStudent={(studentId) => setSelectedStudentForReport(studentId)}
          />
        )}
        {activeTab === 'attendance' && <AttendanceView />}
        {activeTab === 'students' && <StudentManagementView />}
        {activeTab === 'merit' && <MeritRecordView />}
        {activeTab === 'demerit' && <DemeritRecordView />}
        {activeTab === 'reports' && (
          <ReportsView initialStudentId={selectedStudentForReport} />
        )}
        {activeTab === 'admin' && <AdminManagementView />}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-emerald-100 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-emerald-950">
            {settings.system_name} · {settings.school_name}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p className="text-slate-500 max-w-2xl text-[11px] sm:text-xs">
              {settings.system_description || 'ระบบสนับสนุนการพัฒนาคุณธรรม จริยธรรม และวินัยเชิงบวกตามหลักสูตรการศึกษาขั้นพื้นฐาน'}
            </p>
            <button
              type="button"
              onClick={() => setEditFooterModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
              title="แก้ไขข้อความท้ายเว็บนี้"
            >
              <Pencil className="w-3 h-3 text-emerald-600" />
              <span>แก้ไขข้อความ</span>
            </button>
          </div>
        </div>
      </footer>

      <LoginModal />
      <AcademicYearModal
        isOpen={academicYearModalOpen}
        onClose={() => setAcademicYearModalOpen(false)}
      />
      <Top3ColorModal
        isOpen={top3ColorModalOpen}
        onClose={() => setTop3ColorModalOpen(false)}
      />
      <BehaviorPresetModal
        isOpen={behaviorModalOpen}
        onClose={() => setBehaviorModalOpen(false)}
      />
      <FooterDescriptionModal
        isOpen={editFooterModalOpen}
        onClose={() => setEditFooterModalOpen(false)}
      />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
