import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  AttendanceStatus,
  AttendanceRecord,
  ATTENDANCE_STATUS_MAP,
  Student
} from '../types';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  BarChart3,
  CalendarDays,
  UserX,
  Printer,
  Sparkles,
  FileSpreadsheet,
  Info
} from 'lucide-react';

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const formatThaiDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dateObj = new Date(y, m, d);
  const dayName = THAI_DAYS[dateObj.getDay()] || '';
  const monthName = THAI_MONTHS_FULL[m] || '';
  const budYear = y > 2400 ? y : y + 543;
  return `วัน${dayName}ที่ ${d} ${monthName} พ.ศ. ${budYear}`;
};

const formatShortThaiDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const budYear = y > 2400 ? y : y + 543;
  return `${d} ${THAI_MONTHS_FULL[m]} ${budYear}`;
};

const getDayOfWeek = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dateObj = new Date(y, m, d);
  return `วัน${THAI_DAYS[dateObj.getDay()] || ''}`;
};

const isBoy = (name: string) => name.startsWith('เด็กชาย') || name.startsWith('ด.ช.') || name.startsWith('นาย');
const isGirl = (name: string) => name.startsWith('เด็กหญิง') || name.startsWith('ด.ญ.') || name.startsWith('น.ส.') || name.startsWith('นางสาว');

export const AttendanceView: React.FC = () => {
  const {
    students,
    attendanceRecords,
    setStudentAttendance,
    markAllPresent,
    resetDayAttendance,
    deleteDayAttendance,
    settings,
    currentUser,
    setActiveTab
  } = useApp();

  // Tab: 'marking' | 'reports'
  const [activeSubTab, setActiveSubTab] = useState<'marking' | 'reports'>('marking');

  // Report Sub-mode: 'overview' | 'daily_monthly' | 'student_detail'
  const [reportSubMode, setReportSubMode] = useState<'overview' | 'daily_monthly' | 'student_detail'>('overview');

  // Filters for marking
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Daily/Monthly Report state
  const [reportDailyOrMonthly, setReportDailyOrMonthly] = useState<'daily' | 'monthly'>('daily');
  const [reportDate, setReportDate] = useState<string>(todayStr);
  const [reportMonth, setReportMonth] = useState<string>(() => {
    const curMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return curMonth;
  });
  const [reportYear, setReportYear] = useState<string>(settings.academic_year || '2569');

  // Student Detail Report state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Unique list of classes
  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.student_class) set.add(s.student_class);
    });
    const list = Array.from(set).sort();
    return list;
  }, [students]);

  // Set default class if available and 'all'
  React.useEffect(() => {
    if (selectedClass === 'all' && classList.length === 1) {
      setSelectedClass(classList[0]);
    }
  }, [classList, selectedClass]);

  // Quick Date Navigation
  const shiftDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  // Filtered students for marking
  const displayStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (selectedClass !== 'all' && s.student_class !== selectedClass) return false;
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase();
          const matchName = s.student_name.toLowerCase().includes(term);
          const matchNo = s.student_no.toString().includes(term);
          return matchName || matchNo;
        }
        return true;
      })
      .sort((a, b) => a.student_no - b.student_no);
  }, [students, selectedClass, searchTerm]);

  // Map of studentId -> attendance record for selectedDate
  const dayRecordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((r) => {
      if (r.date === selectedDate) {
        map.set(r.student_id, r);
      }
    });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Real-time counters for the selected date & class
  const dayStats = useMemo(() => {
    const targetStudents = selectedClass !== 'all'
      ? students.filter((s) => s.student_class === selectedClass)
      : students;

    const total = targetStudents.length;
    let present = 0;
    let late = 0;
    let personal_leave = 0;
    let sick = 0;
    let absent = 0;
    let unchecked = 0;

    targetStudents.forEach((st) => {
      const rec = dayRecordsMap.get(st.id);
      if (!rec) {
        unchecked++;
      } else {
        switch (rec.status) {
          case 'present':
            present++;
            break;
          case 'late':
            late++;
            break;
          case 'personal_leave':
            personal_leave++;
            break;
          case 'sick':
            sick++;
            break;
          case 'absent':
            absent++;
            break;
          default:
            unchecked++;
        }
      }
    });

    const attendedCount = present + late;
    const rate = total > 0 ? Math.round((attendedCount / total) * 100) : 0;

    return {
      total,
      present,
      late,
      personal_leave,
      sick,
      absent,
      unchecked,
      attendedCount,
      rate
    };
  }, [students, selectedClass, dayRecordsMap]);

  // Handlers for Quick Actions
  const handleMarkAllPresent = async () => {
    if (displayStudents.length === 0) return;
    await markAllPresent(selectedDate, selectedClass);
  };

  const handleResetToday = async () => {
    if (window.confirm(`ต้องการรีเซ็ตสถานะการเช็คชื่อวันที่ ${selectedDate} หรือไม่?`)) {
      await resetDayAttendance(selectedDate, selectedClass);
    }
  };

  const handleDeleteToday = async () => {
    if (window.confirm(`ยืนยันการลบข้อมูลการเช็คชื่อวันที่ ${selectedDate} ทั้งหมด? ข้อมูลจะไม่สามารถกู้คืนได้`)) {
      await deleteDayAttendance(selectedDate, selectedClass);
    }
  };

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    await setStudentAttendance(studentId, status, selectedDate);
  };

  const handleNoteChange = async (studentId: string, note: string) => {
    const existing = dayRecordsMap.get(studentId);
    if (existing) {
      await setStudentAttendance(studentId, existing.status, selectedDate, note);
    } else {
      // default to present with note if not marked yet
      await setStudentAttendance(studentId, 'present', selectedDate, note);
    }
  };

  // --- REPORT DATA CALCULATIONS ---

  // 1. Overall stats
  const overallStats = useMemo(() => {
    const totalRecords = attendanceRecords.length;
    let present = 0;
    let late = 0;
    let personal_leave = 0;
    let sick = 0;
    let absent = 0;

    // Distinct dates
    const datesSet = new Set<string>();
    attendanceRecords.forEach((r) => {
      datesSet.add(r.date);
      if (r.status === 'present') present++;
      else if (r.status === 'late') late++;
      else if (r.status === 'personal_leave') personal_leave++;
      else if (r.status === 'sick') sick++;
      else if (r.status === 'absent') absent++;
    });

    const totalDaysRecorded = datesSet.size;
    const totalPresentAndLate = present + late;
    const overallRate = totalRecords > 0 ? Math.round((totalPresentAndLate / totalRecords) * 100) : 0;

    return {
      totalRecords,
      totalDaysRecorded,
      present,
      late,
      personal_leave,
      sick,
      absent,
      overallRate
    };
  }, [attendanceRecords]);

  // Per student overall summary
  const studentOverallSummaries = useMemo(() => {
    return students.map((st) => {
      const recs = attendanceRecords.filter((r) => r.student_id === st.id);
      let p = 0;
      let l = 0;
      let pl = 0;
      let s = 0;
      let a = 0;
      recs.forEach((r) => {
        if (r.status === 'present') p++;
        else if (r.status === 'late') l++;
        else if (r.status === 'personal_leave') pl++;
        else if (r.status === 'sick') s++;
        else if (r.status === 'absent') a++;
      });
      const total = recs.length;
      const rate = total > 0 ? Math.round(((p + l) / total) * 100) : 0;
      return {
        student: st,
        total,
        present: p,
        late: l,
        personal_leave: pl,
        sick: s,
        absent: a,
        rate
      };
    }).sort((a, b) => {
      if (b.rate !== a.rate) return b.rate - a.rate;
      if (a.absent !== b.absent) return a.absent - b.absent;
      return a.student.student_no - b.student.student_no;
    });
  }, [students, attendanceRecords]);

  // 2. Daily Report data (for reportDate)
  const dailyReportData = useMemo(() => {
    const list = attendanceRecords.filter((r) => r.date === reportDate);
    // Sort by student_no
    list.sort((a, b) => a.student_no - b.student_no);
    const absentOrLeave = list.filter((r) => r.status !== 'present');
    return {
      all: list,
      absentOrLeave
    };
  }, [attendanceRecords, reportDate]);

  // Monthly Report data (for reportMonth & reportYear)
  const monthlyReportData = useMemo(() => {
    const filteredRecs = attendanceRecords.filter((r) => {
      const [y, m] = r.date.split('-');
      if (m !== reportMonth) return false;
      const bYear = (parseInt(y, 10) + 543).toString();
      if (reportYear && reportYear !== 'all') {
        if (bYear !== reportYear && y !== reportYear) return false;
      }
      return true;
    });

    const studentMap = new Map<string, { present: number; late: number; personal_leave: number; sick: number; absent: number; total: number }>();

    filteredRecs.forEach((r) => {
      const cur = studentMap.get(r.student_id) || { present: 0, late: 0, personal_leave: 0, sick: 0, absent: 0, total: 0 };
      cur.total++;
      if (r.status === 'present') cur.present++;
      else if (r.status === 'late') cur.late++;
      else if (r.status === 'personal_leave') cur.personal_leave++;
      else if (r.status === 'sick') cur.sick++;
      else if (r.status === 'absent') cur.absent++;
      studentMap.set(r.student_id, cur);
    });

    return students.map((st) => {
      const counts = studentMap.get(st.id) || { present: 0, late: 0, personal_leave: 0, sick: 0, absent: 0, total: 0 };
      const attended = counts.present + counts.late;
      const rate = counts.total > 0 ? Math.round((attended / counts.total) * 100) : 0;
      return {
        student: st,
        ...counts,
        rate
      };
    }).sort((a, b) => a.student.student_no - b.student.student_no);
  }, [attendanceRecords, reportMonth, reportYear, students]);

  // 3. Selected Student Absence/Leave Detail
  const targetStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || (students.length > 0 ? students[0] : null);
  }, [students, selectedStudentId]);

  const studentAbsenceHistory = useMemo(() => {
    if (!targetStudent) return [];
    return attendanceRecords
      .filter((r) => r.student_id === targetStudent.id && r.status !== 'present')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, targetStudent]);

  const studentAllHistory = useMemo(() => {
    if (!targetStudent) return [];
    return attendanceRecords
      .filter((r) => r.student_id === targetStudent.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, targetStudent]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Main Sub-tab Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md ring-4 ring-emerald-50">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ระบบเช็คชื่อนักเรียน
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {settings.school_name} · บันทึกการมาเรียน 5 สถานะ เรียลไทม์ และสรุปรายงาน
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="no-print flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('marking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'marking'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการเช็คชื่อ</span>
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'reports'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <span>รายงานสรุป</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: บันทึกการเช็คชื่อ (MARKING)                          */}
      {/* ============================================================== */}
      {activeSubTab === 'marking' && (
        <div className="space-y-6">
          {/* Filter & Date Control Box */}
          <div className="no-print bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
              
              {/* Class Selector */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เลือกชั้นเรียน
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="all">ทุกห้องเรียน ({students.length} คน)</option>
                    {classList.map((c) => (
                      <option key={c} value={c}>
                        ชั้น {c} ({students.filter((s) => s.student_class === c).length} คน)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Navigation & Picker */}
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เลือกวันที่เช็คชื่อ
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => shiftDate(-1)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 shrink-0"
                    title="วันก่อนหน้า"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setSelectedDate(todayStr)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                      selectedDate === todayStr
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    วันนี้
                  </button>

                  <button
                    onClick={() => shiftDate(1)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 shrink-0"
                    title="วันถัดไป"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search filter */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ค้นหาตามชื่อ/เลขที่
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อ หรือ เลขที่..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Formatted Date Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs sm:text-sm text-emerald-950 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-900">{formatThaiDate(selectedDate)}</span>
                {selectedDate === todayStr && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                    วันนี้
                  </span>
                )}
              </div>
              <div className="text-slate-500 text-xs">
                ห้อง: <span className="font-bold text-slate-700">{selectedClass === 'all' ? 'ทุกห้อง' : selectedClass}</span> | 
                แสดง: <span className="font-bold text-emerald-700">{displayStudents.length}</span> คน
              </div>
            </div>
          </div>

          {/* Real-time Status Counter Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total & Rate */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>นักเรียน</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">ทั้งหมด</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{dayStats.total}</span>
                <span className="text-xs text-slate-500 font-medium">คน</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                มาเรียน {dayStats.rate}%
              </div>
            </div>

            {/* Present (มา) */}
            <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>มาเรียน</span>
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-full font-bold">
                  {dayStats.total > 0 ? Math.round((dayStats.present / dayStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-700">{dayStats.present}</span>
                <span className="text-xs text-emerald-700 font-medium">คน</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">
                ตรงเวลา
              </div>
            </div>

            {/* Late (สาย) */}
            <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>มาสาย</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                  {dayStats.total > 0 ? Math.round((dayStats.late / dayStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-700">{dayStats.late}</span>
                <span className="text-xs text-amber-700 font-medium">คน</span>
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">
                นับเป็นมาเรียน
              </div>
            </div>

            {/* Personal Leave (ลากิจ) */}
            <div className="bg-sky-50/70 rounded-xl p-3.5 border border-sky-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-sky-800 mb-1">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span>ลากิจ</span>
                </span>
                <span className="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded-full font-bold">
                  {dayStats.total > 0 ? Math.round((dayStats.personal_leave / dayStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-sky-700">{dayStats.personal_leave}</span>
                <span className="text-xs text-sky-700 font-medium">คน</span>
              </div>
              <div className="text-[10px] text-sky-600 font-medium mt-1">
                มีใบลา/แจ้งครู
              </div>
            </div>

            {/* Sick (ป่วย) */}
            <div className="bg-purple-50/70 rounded-xl p-3.5 border border-purple-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-purple-800 mb-1">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>ลาป่วย</span>
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded-full font-bold">
                  {dayStats.total > 0 ? Math.round((dayStats.sick / dayStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-purple-700">{dayStats.sick}</span>
                <span className="text-xs text-purple-700 font-medium">คน</span>
              </div>
              <div className="text-[10px] text-purple-600 font-medium mt-1">
                มีอาการป่วย
              </div>
            </div>

            {/* Absent (ขาด) */}
            <div className="bg-rose-50/70 rounded-xl p-3.5 border border-rose-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
                <span className="flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>ขาดเรียน</span>
                </span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-full font-bold">
                  {dayStats.total > 0 ? Math.round((dayStats.absent / dayStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-rose-700">{dayStats.absent}</span>
                <span className="text-xs text-rose-700 font-medium">คน</span>
              </div>
              <div className="text-[10px] text-rose-600 font-medium mt-1">
                {dayStats.unchecked > 0 ? `(ยังไม่ระบุ ${dayStats.unchecked} คน)` : 'เช็คครบแล้ว'}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Strip */}
          <div className="no-print bg-white rounded-xl p-3 sm:p-4 border border-emerald-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">ปุ่มด่วน:</span>
              
              {/* Mark All Present */}
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                title="กำหนดให้นักเรียนทุกคนในห้องที่เลือกมีสถานะ 'มาเรียน'"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>มาทั้งหมด</span>
              </button>

              {/* Reset Today */}
              <button
                type="button"
                onClick={handleResetToday}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 active:scale-95 rounded-xl border border-amber-200 transition-all cursor-pointer"
                title="รีเซ็ตการเช็คชื่อของวันนี้เพื่อเริ่มใหม่"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>รีเซ็ตวันนี้</span>
              </button>

              {/* Delete Today */}
              <button
                type="button"
                onClick={handleDeleteToday}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl border border-rose-200 transition-all cursor-pointer"
                title="ลบข้อมูลการเช็คชื่อของวันนี้ทั้งหมด"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ลบวันนี้</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>บันทึกและซิงค์ Cloud อัตโนมัติทันทีที่กดเลือกสถานะ</span>
            </div>
          </div>

          {/* Student Roster Card Grid / Table */}
          {displayStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 mb-1">
                {searchTerm ? 'ไม่พบนักเรียนตามคำค้นหา' : 'ยังไม่มีข้อมูลนักเรียนในระบบหรือห้องที่เลือก'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                กรุณาเพิ่มรายชื่อนักเรียนในเมนู "จัดการรายชื่อ" หรือเปลี่ยนเงื่อนไขห้องเรียน
              </p>
              <button
                onClick={() => setActiveTab('students')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                ไปที่จัดการรายชื่อ
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {displayStudents.map((st) => {
                  const currentRecord = dayRecordsMap.get(st.id);
                  const currentStatus = currentRecord?.status;
                  const isMale = isBoy(st.student_name);
                  const isFemale = isGirl(st.student_name);

                  return (
                    <div
                      key={st.id}
                      className={`p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                        currentStatus === 'present'
                          ? 'bg-emerald-50/20'
                          : currentStatus === 'absent'
                          ? 'bg-rose-50/30'
                          : currentStatus === 'sick'
                          ? 'bg-purple-50/30'
                          : currentStatus === 'personal_leave'
                          ? 'bg-sky-50/30'
                          : currentStatus === 'late'
                          ? 'bg-amber-50/30'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                          {st.student_no}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-bold text-sm tracking-tight ${
                                isMale
                                  ? 'text-blue-900'
                                  : isFemale
                                  ? 'text-rose-900'
                                  : 'text-slate-900'
                              }`}
                            >
                              {st.student_name}
                            </span>
                            {isMale && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                                ชาย
                              </span>
                            )}
                            {isFemale && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-pink-50 text-pink-700 border border-pink-200 font-semibold">
                                หญิง
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            ชั้น {st.student_class}
                            {currentRecord?.note && (
                              <span className="ml-2 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                                หมายเหตุ: {currentRecord.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 5 Status Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(['present', 'late', 'personal_leave', 'sick', 'absent'] as AttendanceStatus[]).map((stKey) => {
                          const config = ATTENDANCE_STATUS_MAP[stKey];
                          const isSelected = currentStatus === stKey;

                          return (
                            <button
                              key={stKey}
                              type="button"
                              onClick={() => handleStatusChange(st.id, stKey)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isSelected ? config.activeButtonClass : config.inactiveButtonClass
                              }`}
                            >
                              {config.shortLabel}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Note Input */}
                      <div className="md:w-1/4">
                        <input
                          type="text"
                          placeholder="หมายเหตุ (เช่น ไปหาหมอ, ธุระ)"
                          defaultValue={currentRecord?.note || ''}
                          key={`${st.id}_${selectedDate}_${currentRecord?.note || ''}`}
                          onBlur={(e) => handleNoteChange(st.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: รายงานสรุป (REPORTS)                                */}
      {/* ============================================================== */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {/* Sub-modes Navigation */}
          <div className="no-print bg-white rounded-2xl p-2 border border-emerald-100 shadow-xs flex flex-wrap gap-1">
            <button
              onClick={() => setReportSubMode('overview')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                reportSubMode === 'overview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>1. สรุปภาพรวมทั้งหมด</span>
            </button>

            <button
              onClick={() => setReportSubMode('daily_monthly')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                reportSubMode === 'daily_monthly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>2. ขาด/ลา เฉพาะวัน & รายเดือน</span>
            </button>

            <button
              onClick={() => setReportSubMode('student_detail')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                reportSubMode === 'student_detail'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>3. สรุปขาดเรียนรายบุคคล</span>
            </button>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* REPORT 1: สรุปภาพรวมทั้งหมด                                    */}
          {/* ------------------------------------------------------------ */}
          {reportSubMode === 'overview' && (
            <div className="space-y-6">
              {/* Progress bar visual breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800">
                      สัดส่วนสถานะการมาเรียนทั้งหมด
                    </h3>
                    <p className="text-xs text-slate-500">
                      จำนวนวันที่บันทึกเช็คชื่อ: <span className="font-bold text-emerald-700">{overallStats.totalDaysRecorded} วัน</span> ({overallStats.totalRecords} รายการบันทึก)
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                    รวม {overallStats.totalRecords} ครั้งบันทึก
                  </span>
                </div>

                {overallStats.totalRecords > 0 ? (
                  <>
                    <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        style={{ width: `${(overallStats.present / overallStats.totalRecords) * 100}%` }}
                        className="bg-emerald-500"
                        title={`มา: ${overallStats.present}`}
                      />
                      <div
                        style={{ width: `${(overallStats.late / overallStats.totalRecords) * 100}%` }}
                        className="bg-amber-400"
                        title={`สาย: ${overallStats.late}`}
                      />
                      <div
                        style={{ width: `${(overallStats.personal_leave / overallStats.totalRecords) * 100}%` }}
                        className="bg-sky-400"
                        title={`ลากิจ: ${overallStats.personal_leave}`}
                      />
                      <div
                        style={{ width: `${(overallStats.sick / overallStats.totalRecords) * 100}%` }}
                        className="bg-purple-400"
                        title={`ป่วย: ${overallStats.sick}`}
                      />
                      <div
                        style={{ width: `${(overallStats.absent / overallStats.totalRecords) * 100}%` }}
                        className="bg-rose-500"
                        title={`ขาด: ${overallStats.absent}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        มาเรียน {overallStats.present} ({Math.round((overallStats.present / overallStats.totalRecords) * 100)}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        มาสาย {overallStats.late} ({Math.round((overallStats.late / overallStats.totalRecords) * 100)}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-sky-700">
                        <span className="w-3 h-3 rounded-full bg-sky-400" />
                        ลากิจ {overallStats.personal_leave} ({Math.round((overallStats.personal_leave / overallStats.totalRecords) * 100)}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <span className="w-3 h-3 rounded-full bg-purple-400" />
                        ป่วย {overallStats.sick} ({Math.round((overallStats.sick / overallStats.totalRecords) * 100)}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-700">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        ขาด {overallStats.absent} ({Math.round((overallStats.absent / overallStats.totalRecords) * 100)}%)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">ยังไม่มีบันทึกข้อมูลการเช็คชื่อในระบบ</p>
                )}
              </div>

              {/* Leaderboard Table of Student Attendance */}
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      ตารางสรุปสถิติการมาเรียนรายบุคคล
                    </h3>
                    <p className="text-xs text-slate-500">เรียงตามเปอร์เซ็นต์การมาเรียนและจำนวนวันที่ขาดน้อยที่สุด</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] lg:min-w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-12 sm:w-14 whitespace-nowrap text-xs font-bold">เลขที่</th>
                        <th scope="col" className="py-2.5 px-2.5 sm:px-3.5 text-left min-w-[170px] sm:min-w-[200px] whitespace-nowrap text-xs sm:text-sm font-bold">ชื่อ - สกุล</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-16 sm:w-20 whitespace-nowrap text-xs font-bold">ชั้น</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center whitespace-nowrap text-xs font-bold">วันที่บันทึก</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-emerald-700 whitespace-nowrap text-xs font-bold">มา (วัน)</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-amber-700 whitespace-nowrap text-xs font-bold">สาย</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-sky-700 whitespace-nowrap text-xs font-bold">ลากิจ</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-purple-700 whitespace-nowrap text-xs font-bold">ป่วย</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-rose-700 whitespace-nowrap text-xs font-bold">ขาด</th>
                        <th scope="col" className="py-2.5 px-2 sm:px-3 text-center min-w-[110px] whitespace-nowrap text-xs font-bold">อัตราการมาเรียน</th>
                        <th scope="col" className="no-print py-2.5 px-2 sm:px-3 text-center w-24 sm:w-28 whitespace-nowrap text-xs font-bold">ประวัติ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentOverallSummaries.map((item) => {
                        const isMale = isBoy(item.student.student_name);
                        const isFemale = isGirl(item.student.student_name);

                        return (
                          <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-slate-600 whitespace-nowrap">
                              {item.student.student_no}
                            </td>
                            <td className="py-2.5 px-2.5 sm:px-3.5 font-semibold whitespace-nowrap min-w-[170px] sm:min-w-[200px]">
                              <span className={isMale ? 'text-blue-900 font-bold' : isFemale ? 'text-rose-900 font-bold' : 'text-slate-900'}>
                                {item.student.student_name}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center text-slate-600 font-medium whitespace-nowrap">
                              {item.student.student_class}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center text-slate-600 font-medium whitespace-nowrap">
                              {item.total}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                              {item.present}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-amber-600 whitespace-nowrap">
                              {item.late}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-sky-600 whitespace-nowrap">
                              {item.personal_leave}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-purple-600 whitespace-nowrap">
                              {item.sick}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-rose-600 whitespace-nowrap">
                              {item.absent}
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center justify-center min-w-[56px] px-2.5 py-0.5 rounded-full font-bold text-xs whitespace-nowrap ${
                                  item.rate >= 90
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : item.rate >= 80
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {item.rate}%
                              </span>
                            </td>
                            <td className="no-print py-2.5 px-2 sm:px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(item.student.id);
                                  setReportSubMode('student_detail');
                                }}
                                className="inline-flex items-center justify-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                ดูรายละเอียด
                              </button>
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

          {/* ------------------------------------------------------------ */}
          {/* REPORT 2: ขาด/ลา เฉพาะวัน & รายเดือน                          */}
          {/* ------------------------------------------------------------ */}
          {reportSubMode === 'daily_monthly' && (
            <div className="space-y-6">
              {/* Daily / Monthly toggle bar */}
              <div className="no-print bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReportDailyOrMonthly('daily')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      reportDailyOrMonthly === 'daily'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ดูเฉพาะวัน
                  </button>
                  <button
                    onClick={() => setReportDailyOrMonthly('monthly')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      reportDailyOrMonthly === 'monthly'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ดูรายเดือน
                  </button>
                </div>

                {reportDailyOrMonthly === 'daily' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">เลือกวันที่:</span>
                    <input
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">เลือกเดือน:</span>
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {THAI_MONTHS_FULL.map((mName, idx) => {
                        const val = String(idx + 1).padStart(2, '0');
                        return (
                          <option key={val} value={val}>
                            {mName}
                          </option>
                        );
                      })}
                    </select>

                    <span className="text-xs font-semibold text-slate-600 ml-2">ปี:</span>
                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">ทุกปี</option>
                      {(settings.academic_years || ['2570', '2569', '2568', '2567']).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* View 2A: เฉพาะวัน */}
              {reportDailyOrMonthly === 'daily' && (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        รายงานรายชื่อนักเรียนขาด / ลา ประจำ {formatThaiDate(reportDate)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        แสดงนักเรียนที่มีสถานะ ขาดเรียน, ลาป่วย, ลากิจ, หรือมาสาย ในวันนี้
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="no-print self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์หน้านี้</span>
                    </button>
                  </div>

                  {dailyReportData.absentOrLeave.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800">
                        ไม่มีนักเรียนขาดหรือลาในวันที่เลือก
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        นักเรียนทุกคนมาเรียนตรงเวลา หรือยังไม่มีการบันทึกข้อมูลในวันนี้
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] lg:min-w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                            <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-12 sm:w-14 whitespace-nowrap text-xs font-bold">เลขที่</th>
                            <th scope="col" className="py-2.5 px-2.5 sm:px-3.5 text-left min-w-[170px] sm:min-w-[200px] whitespace-nowrap text-xs sm:text-sm font-bold">ชื่อ - นามสกุล</th>
                            <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-24 sm:w-28 whitespace-nowrap text-xs font-bold">สถานะ</th>
                            <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-16 sm:w-20 whitespace-nowrap text-xs font-bold">ชั้น</th>
                            <th scope="col" className="py-2.5 px-3 min-w-[140px] sm:min-w-[180px] text-xs font-bold">สาเหตุ / หมายเหตุ</th>
                            <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-28 whitespace-nowrap text-xs font-bold">ผู้บันทึก</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dailyReportData.absentOrLeave.map((rec) => {
                            const config = ATTENDANCE_STATUS_MAP[rec.status];
                            const isMale = isBoy(rec.student_name);
                            const isFemale = isGirl(rec.student_name);

                            return (
                              <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-slate-600 whitespace-nowrap">
                                  {rec.student_no}
                                </td>
                                <td className="py-2.5 px-2.5 sm:px-3.5 font-semibold whitespace-nowrap min-w-[170px] sm:min-w-[200px]">
                                  <span className={isMale ? 'text-blue-900 font-bold' : isFemale ? 'text-rose-900 font-bold' : 'text-slate-900'}>
                                    {rec.student_name}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 sm:px-3 text-center whitespace-nowrap">
                                  <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold text-xs border whitespace-nowrap ${config.badgeClass}`}>
                                    {config.label}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 sm:px-3 text-center text-slate-600 font-medium whitespace-nowrap">
                                  {rec.student_class}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 italic">
                                  {rec.note || '-'}
                                </td>
                                <td className="py-2.5 px-2 sm:px-3 text-center text-slate-500 text-xs whitespace-nowrap">
                                  {rec.recorded_by}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Print signature footer */}
                  <div className="p-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs mt-4">
                    <div className="space-y-1">
                      <p className="text-slate-500">ลงชื่อ..................................................</p>
                      <p className="font-bold text-slate-800">({settings.signatory1_name || 'ครูประจำชั้น'})</p>
                      <p className="text-slate-500">{settings.signatory1_title || 'ครูประจำชั้น ป.5/1'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">ลงชื่อ..................................................</p>
                      <p className="font-bold text-slate-800">({settings.signatory2_name || 'หัวหน้ากลุ่มงาน'})</p>
                      <p className="text-slate-500">{settings.signatory2_title || 'หัวหน้ากลุ่มงานกิจการนักเรียน'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">ลงชื่อ..................................................</p>
                      <p className="font-bold text-slate-800">({settings.signatory3_name || 'ผู้อำนวยการโรงเรียน'})</p>
                      <p className="text-slate-500">{settings.signatory3_title || 'ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2B: รายเดือน */}
              {reportDailyOrMonthly === 'monthly' && (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        รายงานสรุปการมาเรียนประจำเดือน {THAI_MONTHS_FULL[parseInt(reportMonth, 10) - 1]} พ.ศ. {reportYear}
                      </h3>
                      <p className="text-xs text-slate-500">
                        สรุปจำนวนวันมาเรียน มาสาย ลากิจ ลาป่วย และขาดเรียนของนักเรียนทุกคน
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="no-print self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์รายงานเดือนนี้</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] lg:min-w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-12 sm:w-14 whitespace-nowrap text-xs font-bold">เลขที่</th>
                          <th scope="col" className="py-2.5 px-2.5 sm:px-3.5 text-left min-w-[170px] sm:min-w-[200px] whitespace-nowrap text-xs sm:text-sm font-bold">ชื่อ - สกุล</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-16 sm:w-20 whitespace-nowrap text-xs font-bold">ชั้น</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center whitespace-nowrap text-xs font-bold">วันทั้งหมด</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-emerald-700 whitespace-nowrap text-xs font-bold">มา</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-amber-700 whitespace-nowrap text-xs font-bold">สาย</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-sky-700 whitespace-nowrap text-xs font-bold">ลากิจ</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-purple-700 whitespace-nowrap text-xs font-bold">ป่วย</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center text-rose-700 whitespace-nowrap text-xs font-bold">ขาด</th>
                          <th scope="col" className="py-2.5 px-2 sm:px-3 text-center min-w-[110px] whitespace-nowrap text-xs font-bold">อัตราการมาเรียน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {monthlyReportData.map((item) => {
                          const isMale = isBoy(item.student.student_name);
                          const isFemale = isGirl(item.student.student_name);

                          return (
                            <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-slate-600 whitespace-nowrap">
                                {item.student.student_no}
                              </td>
                              <td className="py-2.5 px-2.5 sm:px-3.5 font-semibold whitespace-nowrap min-w-[170px] sm:min-w-[200px]">
                                <span className={isMale ? 'text-blue-900 font-bold' : isFemale ? 'text-rose-900 font-bold' : 'text-slate-900'}>
                                  {item.student.student_name}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center text-slate-600 font-medium whitespace-nowrap">
                                {item.student.student_class}
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                                {item.total}
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                                {item.present}
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-amber-600 whitespace-nowrap">
                                {item.late}
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-sky-600 whitespace-nowrap">
                                {item.personal_leave}
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-purple-600 whitespace-nowrap">
                                {item.sick}
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-rose-600 whitespace-nowrap">
                                {item.absent}
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-center whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center justify-center min-w-[56px] px-2.5 py-0.5 rounded-full font-bold text-xs whitespace-nowrap ${
                                    item.rate >= 90
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : item.rate >= 80
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  {item.rate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Print signature footer */}
                  <div className="p-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs mt-4">
                    <div className="space-y-1">
                      <p className="text-slate-500">ลงชื่อ..................................................</p>
                      <p className="font-bold text-slate-800">({settings.signatory1_name || 'ครูประจำชั้น'})</p>
                      <p className="text-slate-500">{settings.signatory1_title || 'ครูประจำชั้น ป.5/1'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">ลงชื่อ..................................................</p>
                      <p className="font-bold text-slate-800">({settings.signatory2_name || 'หัวหน้ากลุ่มงาน'})</p>
                      <p className="text-slate-500">{settings.signatory2_title || 'หัวหน้ากลุ่มงานกิจการนักเรียน'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">ลงชื่อ..................................................</p>
                      <p className="font-bold text-slate-800">({settings.signatory3_name || 'ผู้อำนวยการโรงเรียน'})</p>
                      <p className="text-slate-500">{settings.signatory3_title || 'ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* REPORT 3: สรุปขาดเรียนรายบุคคล (INDIVIDUAL HISTORY)           */}
          {/* ------------------------------------------------------------ */}
          {reportSubMode === 'student_detail' && (
            <div className="space-y-6">
              {/* Student selector dropdown */}
              <div className="no-print bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <label className="text-xs font-bold text-slate-700 shrink-0">
                    เลือกนักเรียน:
                  </label>
                  <select
                    value={targetStudent?.id || ''}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full sm:max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        เลขที่ {st.student_no} - {st.student_name} (ชั้น {st.student_class})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ใบบันทึกการขาดเรียน</span>
                </button>
              </div>

              {targetStudent ? (
                <div className="space-y-6">
                  {/* Student Summary Profile Card */}
                  <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center border border-emerald-200">
                            {targetStudent.student_no}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900">
                            {targetStudent.student_name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          ชั้น {targetStudent.student_class} · {settings.school_name}
                        </p>
                      </div>

                      {/* Small Quick Counts */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                          มา: {studentAllHistory.filter((r) => r.status === 'present').length} วัน
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                          สาย: {studentAllHistory.filter((r) => r.status === 'late').length} วัน
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                          ลากิจ: {studentAllHistory.filter((r) => r.status === 'personal_leave').length} วัน
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                          ป่วย: {studentAllHistory.filter((r) => r.status === 'sick').length} วัน
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                          ขาด: {studentAllHistory.filter((r) => r.status === 'absent').length} วัน
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 text-xs text-slate-500">
                      อัตราการเข้าเรียน: <span className="font-bold text-emerald-700">
                        {studentAllHistory.length > 0
                          ? Math.round(
                              ((studentAllHistory.filter((r) => r.status === 'present' || r.status === 'late').length) /
                                studentAllHistory.length) *
                                100
                            )
                          : 100}%
                      </span> (จากทั้งหมด {studentAllHistory.length} วันที่บันทึก)
                    </div>
                  </div>

                  {/* Absence & Leave History Table */}
                  <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                      <h4 className="text-base font-bold text-slate-900">
                        ประวัติวันที่ขาดเรียน ลาป่วย ลากิจ และมาสาย
                      </h4>
                      <p className="text-xs text-slate-500">
                        แสดงรายละเอียดวันที่ วันในสัปดาห์ สถานะ และเหตุผลการขาดหรือลา
                      </p>
                    </div>

                    {studentAbsenceHistory.length === 0 ? (
                      <div className="p-10 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <h5 className="text-sm font-bold text-slate-800">
                          ดีเยี่ยม! นักเรียนคนนี้ไม่เคยขาดเรียน หรือ ลาเลย
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                          มีสถิติการมาเรียนครบ 100% ตรงเวลาทุกวัน
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                              <th className="py-2.5 px-3 text-center w-12">ลำดับ</th>
                              <th className="py-2.5 px-3">วันในสัปดาห์</th>
                              <th className="py-2.5 px-3">วันที่ขาด/ลา</th>
                              <th className="py-2.5 px-3 text-center">สถานะ</th>
                              <th className="py-2.5 px-3">สาเหตุ / หมายเหตุ</th>
                              <th className="py-2.5 px-3 text-center">ผู้บันทึก</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {studentAbsenceHistory.map((rec, index) => {
                              const config = ATTENDANCE_STATUS_MAP[rec.status];
                              const dayName = getDayOfWeek(rec.date);

                              return (
                                <tr key={rec.id} className="hover:bg-slate-50/80">
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                                    {index + 1}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-700">
                                    {dayName}
                                  </td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">
                                    {formatShortThaiDate(rec.date)}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border ${config.badgeClass}`}
                                    >
                                      {config.label}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 italic">
                                    {rec.note || '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-center text-slate-500 text-xs">
                                    {rec.recorded_by}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Sign-off Box for Report Print */}
                    <div className="p-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs mt-6">
                      <div className="space-y-1">
                        <p className="text-slate-500">ลงชื่อ..................................................</p>
                        <p className="font-bold text-slate-800">({settings.signatory1_name || 'ครูประจำชั้น'})</p>
                        <p className="text-slate-500">{settings.signatory1_title || 'ครูประจำชั้น ป.5/1'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-500">ลงชื่อ..................................................</p>
                        <p className="font-bold text-slate-800">({settings.signatory2_name || 'หัวหน้ากลุ่มงาน'})</p>
                        <p className="text-slate-500">{settings.signatory2_title || 'หัวหน้ากลุ่มงานกิจการนักเรียน'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-500">ลงชื่อ..................................................</p>
                        <p className="font-bold text-slate-800">({settings.signatory3_name || 'ผู้อำนวยการโรงเรียน'})</p>
                        <p className="text-slate-500">{settings.signatory3_title || 'ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
