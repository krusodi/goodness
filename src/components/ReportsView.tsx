import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { THAI_MONTHS, BehaviorRecord } from '../types';
import { getStudentGender, getGenderStyles } from '../utils/gender';
import {
  FileText,
  User,
  Calendar,
  CalendarDays,
  Trophy,
  Printer,
  PlusCircle,
  MinusCircle,
  Star,
  AlertTriangle,
  Clock,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';

interface ReportsViewProps {
  initialStudentId?: string | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ initialStudentId }) => {
  const {
    students,
    records,
    settings,
    currentUser,
    addMeritBatch,
    addDemeritBatch,
    getSummaries,
    showToast
  } = useApp();

  // Active Report Sub-tab:
  // 1: individual (รายงานนักเรียน รายบุคคล)
  // 2: daily (รายงานรายวัน)
  // 3: monthly (รายงานรายเดือน)
  // 4: monthly_summary (สรุปคะแนนประจำเดือน - อันดับ)
  const [reportType, setReportType] = useState<'individual' | 'daily' | 'monthly' | 'monthly_summary'>('individual');

  // Individual Report State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students.length > 0 ? students[0].id : '')
  );

  // Quick Inline Merit / Demerit Modal State for Individual Report
  const [quickActionModal, setQuickActionModal] = useState<'merit' | 'demerit' | null>(null);
  const [quickBehavior, setQuickBehavior] = useState('');
  const [quickScore, setQuickScore] = useState(5);

  // Daily Report State
  const [dailyDate, setDailyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyStudentFilter, setDailyStudentFilter] = useState<string>('all');

  // Monthly Report State
  const [monthlyYear, setMonthlyYear] = useState<string>('2569');
  const [monthlyMonth, setMonthlyMonth] = useState<string>('10');
  const [monthlyStudentFilter, setMonthlyStudentFilter] = useState<string>('all');

  // Monthly Summary Leaderboard State
  const [summaryYear, setSummaryYear] = useState<string>('2569');
  const [summaryMonth, setSummaryMonth] = useState<string>('10');

  // Current selected student
  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const csStyles = currentStudent ? getGenderStyles(getStudentGender(currentStudent.student_name)) : null;

  // Individual records
  const studentRecords = records.filter(
    (r) => r.student_id === selectedStudentId || (currentStudent && r.student_no === currentStudent.student_no)
  );
  const studentMerits = studentRecords.filter((r) => r.category === 'merit');
  const studentDemerits = studentRecords.filter((r) => r.category === 'demerit');
  const studentMeritScore = studentMerits.reduce((acc, r) => acc + r.score, 0);
  const studentDemeritScore = studentDemerits.reduce((acc, r) => acc + r.score, 0);
  const studentNetScore = studentMeritScore - studentDemeritScore;

  // Daily records
  const dailyRecords = records.filter((r) => {
    if (r.record_date !== dailyDate) return false;
    if (dailyStudentFilter !== 'all' && r.student_id !== dailyStudentFilter) return false;
    return true;
  });

  // Monthly records
  const monthlyRecords = records.filter((r) => {
    const parts = r.record_date.split('-');
    if (parts.length < 2) return false;
    const recYear = parts[0];
    const recBuddhistYear = (parseInt(recYear, 10) + 543).toString();
    const recMonth = parts[1];

    if (recBuddhistYear !== monthlyYear && recYear !== monthlyYear) return false;
    if (recMonth !== monthlyMonth) return false;
    if (monthlyStudentFilter !== 'all' && r.student_id !== monthlyStudentFilter) return false;
    return true;
  });

  // Monthly Summaries (Leaderboard)
  const monthlySummaries = getSummaries(summaryMonth, summaryYear);

  const handlePrint = () => {
    window.print();
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !quickBehavior.trim()) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    if (quickActionModal === 'merit') {
      addMeritBatch([currentStudent.id], quickBehavior, quickScore, dateStr, timeStr);
    } else {
      addDemeritBatch([currentStudent.id], quickBehavior, quickScore, dateStr, timeStr);
    }

    setQuickActionModal(null);
    setQuickBehavior('');
    setQuickScore(5);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>ระบบออกรายงานและสถิติ</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            รายงานผลคะแนนความดีและความประพฤติ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ดูและพิมพ์รายงานรายบุคคล, รายวัน, รายเดือน และสรุปตารางอันดับประจำเดือน
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition-all self-start md:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์รายงาน (Print / PDF)</span>
        </button>
      </div>

      {/* Report Sub-Tabs (No-Print) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 no-print">
        <button
          onClick={() => setReportType('individual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            reportType === 'individual'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. รายงานนักเรียน (รายบุคคล)</span>
        </button>

        <button
          onClick={() => setReportType('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            reportType === 'daily'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>2. รายงานรายวัน</span>
        </button>

        <button
          onClick={() => setReportType('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            reportType === 'monthly'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>3. รายงานรายเดือน</span>
        </button>

        <button
          onClick={() => setReportType('monthly_summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            reportType === 'monthly_summary'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>4. สรุปคะแนนประจำเดือน (อันดับ)</span>
        </button>
      </div>

      {/* Formal Header Printed on Page */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
        <div className="text-xl font-bold">{settings.school_name}</div>
        <div className="text-sm font-medium">สำนักงานเขตพื้นที่การศึกษาประถมศึกษา</div>
        <div className="text-base font-bold mt-1">
          {reportType === 'individual' && `แบบรายงานผลคะแนนความดีและความประพฤติรายบุคคล (ชั้น ${settings.system_name.includes('ป.') ? 'ป.5/1' : 'ป.5/1'})`}
          {reportType === 'daily' && `รายงานบันทึกพฤติกรรมความดีและความประพฤติ ประจำวันที่ ${dailyDate}`}
          {reportType === 'monthly' && `รายงานบันทึกพฤติกรรมความดี ประจำเดือน ${THAI_MONTHS.find(m => m.value === monthlyMonth)?.label} ปี พ.ศ. ${monthlyYear}`}
          {reportType === 'monthly_summary' && `รายงานสรุปผลคะแนนและอันดับความดี ประจำเดือน ${THAI_MONTHS.find(m => m.value === summaryMonth)?.label} ปี พ.ศ. ${summaryYear}`}
        </div>
        <div className="text-xs text-slate-600 mt-1">
          ปีการศึกษา {settings.academic_year} · ออกเอกสารเมื่อวันที่ {new Date().toLocaleDateString('th-TH')}
        </div>
      </div>

      {/* ----------------- SUB-TAB 1: INDIVIDUAL REPORT ----------------- */}
      {reportType === 'individual' && (
        <div className="space-y-6">
          {/* Student Selector Toolbar */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                เลือกนักเรียน:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-xs"
              >
                {students.length === 0 ? (
                  <option value="">-- ยังไม่มีรายชื่อนักเรียน --</option>
                ) : (
                  students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {getGenderStyles(getStudentGender(st.student_name)).icon} เลขที่ {st.student_no} - {st.student_name} ({st.student_class})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Inline Quick Action Buttons for Logged-In Teachers */}
            {currentUser && currentStudent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setQuickActionModal('merit');
                    setQuickBehavior('ช่วยเหลือเพื่อน');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>➕ เพิ่มความดีได้เลย</span>
                </button>

                <button
                  onClick={() => {
                    setQuickActionModal('demerit');
                    setQuickBehavior('คุยในห้องเรียน');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>➖ หักคะแนนได้เลย</span>
                </button>
              </div>
            )}
          </div>

          {currentStudent && csStyles ? (
            <div className="space-y-6">
              {/* Individual Profile & Score Summary Cards */}
              <div className={`bg-white rounded-2xl p-5 border shadow-xs ${csStyles.borderClass}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${csStyles.avatarClass}`}>
                      {currentStudent.student_no}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${csStyles.badgeClass}`}>
                          {csStyles.icon} {csStyles.label}
                        </span>
                        <h2 className={`text-xl font-bold ${csStyles.textClass}`}>
                          {currentStudent.student_name}
                        </h2>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        เลขที่ {currentStudent.student_no} · ชั้นเรียน {currentStudent.student_class} · {settings.school_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium uppercase">ผลคะแนนรวมสุทธิ</div>
                      <div className="text-3xl font-extrabold tabular-nums">
                        <span className={studentNetScore >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {studentNetScore}
                        </span>
                        <span className="text-xs font-normal text-slate-400 ml-1">คะแนน</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-center">
                    <div className="text-xs font-semibold text-amber-800 whitespace-nowrap">✅ คะแนนความดี (+)</div>
                    <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
                      +{studentMeritScore}
                    </div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">จาก {studentMerits.length} รายการ</div>
                  </div>

                  <div className="p-3 bg-rose-50/60 border border-rose-200/60 rounded-xl text-center">
                    <div className="text-xs font-semibold text-rose-800 whitespace-nowrap">❌ คะแนนที่ถูกหัก (-)</div>
                    <div className="text-xl font-bold text-rose-600 mt-1 tabular-nums">
                      -{studentDemeritScore}
                    </div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">จาก {studentDemerits.length} รายการ</div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-center">
                    <div className="text-xs font-semibold text-emerald-900 whitespace-nowrap">📈 คะแนนสุทธิ</div>
                    <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                      {studentNetScore}
                    </div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">
                      {studentNetScore >= 20 ? 'ระดับดีเยี่ยม' : studentNetScore >= 10 ? 'ระดับดีมาก' : 'ระดับปกติ'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Detailed Tables: All Merits & All Demerits */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Merit Records Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>รายการความดีทั้งหมด ({studentMerits.length})</span>
                    </h3>
                    <span className="text-xs font-bold text-emerald-700">+{studentMeritScore} คะแนน</span>
                  </div>

                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 sticky top-0 font-semibold">
                        <tr>
                          <th className="py-2 px-3 w-24">วันที่</th>
                          <th className="py-2 px-3">พฤติกรรมความดี</th>
                          <th className="py-2 px-2 text-right">คะแนน</th>
                          <th className="py-2 px-3">ผู้บันทึก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentMerits.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400">
                              ยังไม่มีรายการความดี
                            </td>
                          </tr>
                        ) : (
                          studentMerits.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                                <div>{m.record_date}</div>
                                <div className="text-[10px] text-slate-400">{m.record_time} น.</div>
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {m.behavior}
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-emerald-600 tabular-nums">
                                +{m.score}
                              </td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">
                                {m.recorded_by}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Demerit Records Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="px-4 py-3 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-rose-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>รายการหักคะแนนทั้งหมด ({studentDemerits.length})</span>
                    </h3>
                    <span className="text-xs font-bold text-rose-700">-{studentDemeritScore} คะแนน</span>
                  </div>

                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 sticky top-0 font-semibold">
                        <tr>
                          <th className="py-2 px-3 w-24">วันที่</th>
                          <th className="py-2 px-3">พฤติกรรมที่หักคะแนน</th>
                          <th className="py-2 px-2 text-right">คะแนน</th>
                          <th className="py-2 px-3">ผู้บันทึก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentDemerits.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400">
                              ไม่มีรายการถูกหักคะแนน
                            </td>
                          </tr>
                        ) : (
                          studentDemerits.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                                <div>{d.record_date}</div>
                                <div className="text-[10px] text-slate-400">{d.record_time} น.</div>
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {d.behavior}
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-rose-600 tabular-nums">
                                -{d.score}
                              </td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">
                                {d.recorded_by}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
              {students.length === 0 ? (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-600">ยังไม่มีรายชื่อนักเรียนในระบบ</div>
                  <div className="text-xs text-slate-400">กรุณาเพิ่มรายชื่อนักเรียนที่เมนู &ldquo;จัดการนักเรียน&rdquo; ก่อนดูรายงานรายบุคคล</div>
                </div>
              ) : (
                'กรุณาเลือกนักเรียน'
              )}
            </div>
          )}
        </div>
      )}

      {/* ----------------- SUB-TAB 2: DAILY REPORT ----------------- */}
      {reportType === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-semibold text-slate-700">เลือกวันที่:</label>
                <input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-semibold text-slate-700">กรองตามนักเรียน:</label>
                <select
                  value={dailyStudentFilter}
                  onChange={(e) => setDailyStudentFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">นักเรียนทุกคน</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {getGenderStyles(getStudentGender(st.student_name)).icon} เลขที่ {st.student_no} - {st.student_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              พบบันทึกทั้งหมด <strong>{dailyRecords.length}</strong> รายการ
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-20 whitespace-nowrap">เวลา</th>
                    <th className="py-2.5 px-3 w-16 text-center whitespace-nowrap">เลขที่</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">ชื่อ - นามสกุล</th>
                    <th className="py-2.5 px-3 text-center w-24 whitespace-nowrap">ประเภท</th>
                    <th className="py-2.5 px-4 min-w-[180px]">พฤติกรรม</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">คะแนน</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">ผู้บันทึก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        ไม่มีบันทึกพฤติกรรมในวันที่ {dailyDate}
                      </td>
                    </tr>
                  ) : (
                    dailyRecords.map((r) => {
                      const gs = getGenderStyles(getStudentGender(r.student_name));
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{r.record_time} น.</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${gs.noBadgeClass}`}>
                              {r.student_no}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${gs.badgeClass}`}>
                                {gs.icon} {gs.label}
                              </span>
                              <span className={`font-semibold ${gs.textClass}`}>
                                {r.student_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              r.category === 'merit'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.category === 'merit' ? 'ความดี ⭐' : 'หักคะแนน ⚠️'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-700">{r.behavior}</td>
                          <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                            {r.category === 'merit' ? (
                              <span className="text-emerald-600">+{r.score}</span>
                            ) : (
                              <span className="text-rose-600">-{r.score}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-500">{r.recorded_by}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB 3: MONTHLY REPORT ----------------- */}
      {reportType === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-semibold text-slate-700">ปีการศึกษา:</label>
                <select
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="2569">2569 (2026)</option>
                  <option value="2568">2568 (2025)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-700">เดือน:</label>
                <select
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {THAI_MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-700">กรองนักเรียน:</label>
                <select
                  value={monthlyStudentFilter}
                  onChange={(e) => setMonthlyStudentFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">ทุกคน</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {getGenderStyles(getStudentGender(st.student_name)).icon} เลขที่ {st.student_no} - {st.student_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              พบบันทึกทั้งหมด <strong>{monthlyRecords.length}</strong> รายการ
            </div>
          </div>

          {/* Monthly Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-24 whitespace-nowrap">วันที่</th>
                    <th className="py-2.5 px-3 w-16 text-center whitespace-nowrap">เลขที่</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">ชื่อ - นามสกุล</th>
                    <th className="py-2.5 px-3 text-center w-24 whitespace-nowrap">ประเภท</th>
                    <th className="py-2.5 px-4 min-w-[180px]">พฤติกรรม</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">คะแนน</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">ผู้บันทึก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        ไม่มีบันทึกพฤติกรรมในเดือน {THAI_MONTHS.find(m => m.value === monthlyMonth)?.label} {monthlyYear}
                      </td>
                    </tr>
                  ) : (
                    monthlyRecords.map((r) => {
                      const gs = getGenderStyles(getStudentGender(r.student_name));
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{r.record_date}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${gs.noBadgeClass}`}>
                              {r.student_no}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${gs.badgeClass}`}>
                                {gs.icon} {gs.label}
                              </span>
                              <span className={`font-semibold ${gs.textClass}`}>
                                {r.student_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              r.category === 'merit'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.category === 'merit' ? 'ความดี ⭐' : 'หักคะแนน ⚠️'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-700">{r.behavior}</td>
                          <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                            {r.category === 'merit' ? (
                              <span className="text-emerald-600">+{r.score}</span>
                            ) : (
                              <span className="text-rose-600">-{r.score}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-500">{r.recorded_by}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB 4: MONTHLY SCORE SUMMARY (LEADERBOARD) ----------------- */}
      {reportType === 'monthly_summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-semibold text-slate-700">ปีการศึกษา:</label>
                <select
                  value={summaryYear}
                  onChange={(e) => setSummaryYear(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="2569">2569 (2026)</option>
                  <option value="2568">2568 (2025)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-700">เดือน:</label>
                <select
                  value={summaryMonth}
                  onChange={(e) => setSummaryMonth(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {THAI_MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-emerald-800 font-semibold">
              ตารางอันดับคะแนนประจำเดือน {THAI_MONTHS.find(m => m.value === summaryMonth)?.label}
            </div>
          </div>

          {/* Monthly Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-center w-24 whitespace-nowrap">อันดับ</th>
                    <th className="py-3 px-3 text-center w-16 whitespace-nowrap">เลขที่</th>
                    <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">ชื่อ - นามสกุล</th>
                    <th className="py-3 px-3 text-center w-16 whitespace-nowrap">ชั้น</th>
                    <th className="py-3 px-3 text-right text-emerald-700 whitespace-nowrap">ความดี (+)</th>
                    <th className="py-3 px-3 text-right text-rose-700 whitespace-nowrap">หักคะแนน (-)</th>
                    <th className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">คะแนนสุทธิ</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">ระดับผลการประเมิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlySummaries.map((item) => {
                    const gs = getGenderStyles(getStudentGender(item.student.student_name));
                    return (
                      <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center font-bold">
                          {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : item.rank}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${gs.noBadgeClass}`}>
                            {item.student.student_no}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${gs.badgeClass}`}>
                              {gs.icon} {gs.label}
                            </span>
                            <span className={`font-semibold ${gs.textClass}`}>
                              {item.student.student_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500">{item.student.student_class}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 tabular-nums">+{item.merit_score}</td>
                        <td className="py-3 px-3 text-right font-bold text-rose-600 tabular-nums">{item.demerit_score > 0 ? `-${item.demerit_score}` : '0'}</td>
                        <td className="py-3 px-4 text-right font-bold text-base tabular-nums">
                          <span className={item.net_score >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {item.net_score}
                          </span>
                        </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {item.net_score >= 20 ? 'ดีเยี่ยม' : item.net_score >= 10 ? 'ดีมาก' : 'ปกติ'}
                        </span>
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

      {/* Official Signatures Printed at the Footer */}
      <div className="hidden print:grid grid-cols-3 gap-6 pt-16 mt-8 text-center text-xs page-break-avoid">
        <div>
          <div className="mb-8">ลงชื่อ ......................................................</div>
          <div className="font-bold">( ...................................................... )</div>
          <div className="text-slate-600">ครูประจำชั้น ป.5/1</div>
        </div>

        <div>
          <div className="mb-8">ลงชื่อ ......................................................</div>
          <div className="font-bold">( ...................................................... )</div>
          <div className="text-slate-600">หัวหน้ากลุ่มงานกิจการนักเรียน</div>
        </div>

        <div>
          <div className="mb-8">ลงชื่อ ......................................................</div>
          <div className="font-bold">( ...................................................... )</div>
          <div className="text-slate-600">ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)</div>
        </div>
      </div>

      {/* Quick Action Modal for Individual View (➕ เพิ่มความดีได้เลย / ➖ หักคะแนนได้เลย) */}
      {quickActionModal && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className={`px-6 py-4 text-white flex items-center justify-between ${
              quickActionModal === 'merit' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              <h3 className="font-bold text-sm">
                {quickActionModal === 'merit' ? '⭐ บันทึกความดีทันที' : '⚠️ บันทึกการหักคะแนนทันที'}
              </h3>
              <button
                onClick={() => setQuickActionModal(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                นักเรียน: <strong>{currentStudent.student_name}</strong> (เลขที่ {currentStudent.student_no})
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {quickActionModal === 'merit' ? 'พฤติกรรมความดี' : 'พฤติกรรมที่หักคะแนน'}
                </label>
                <input
                  type="text"
                  required
                  value={quickBehavior}
                  onChange={(e) => setQuickBehavior(e.target.value)}
                  placeholder="เช่น ช่วยเหลือเพื่อน, มาเรียนสาย"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คะแนน (1 - 100)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quickScore}
                  onChange={(e) => setQuickScore(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickActionModal(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm ${
                    quickActionModal === 'merit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  บันทึกคะแนน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
