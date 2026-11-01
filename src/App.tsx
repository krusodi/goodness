import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudentManagementView } from './components/StudentManagementView';
import { MeritRecordView } from './components/MeritRecordView';
import { DemeritRecordView } from './components/DemeritRecordView';
import { ReportsView } from './components/ReportsView';
import { AdminManagementView } from './components/AdminManagementView';
import { LoginModal } from './components/LoginModal';
import { AcademicYearModal } from './components/AcademicYearModal';
import { Top3ColorModal } from './components/Top3ColorModal';
import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const {
    activeTab,
    settings,
    academicYearModalOpen,
    setAcademicYearModalOpen,
    top3ColorModalOpen,
    setTop3ColorModalOpen
  } = useApp();
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectStudent={(studentId) => setSelectedStudentForReport(studentId)}
          />
        )}
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
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-emerald-950">
            {settings.system_name} · {settings.school_name}
          </p>
          <p className="text-slate-400">
            ระบบสนับสนุนการพัฒนาคุณธรรม จริยธรรม และวินัยเชิงบวกตามหลักสูตรการศึกษาขั้นพื้นฐาน
          </p>
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
