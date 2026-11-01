import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { THAI_MONTHS, StudentScoreSummary, BehaviorRecord } from '../types';
import { getStudentGender, getGenderStyles, Gender } from '../utils/gender';
import {
  Trophy,
  Star,
  AlertTriangle,
  Search,
  Filter,
  Printer,
  ChevronRight,
  Calendar,
  Sparkles,
  Users,
  Settings2,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTop3Style } from '../utils/top3Color';

interface DashboardViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectStudent }) => {
  const {
    settings,
    students,
    records,
    getSummaries,
    setActiveTab,
    academicYears,
    academicYearModalOpen,
    setAcademicYearModalOpen,
    setTop3ColorModalOpen
  } = useApp();

  const top3Style = getTop3Style(settings);

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRecentTab, setActiveRecentTab] = useState<'merit' | 'demerit'>('merit');

  // Trigger celebration confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const summaries = getSummaries(selectedMonth, selectedYear);

  const boyCount = students.filter(s => getStudentGender(s.student_name) === 'male').length;
  const girlCount = students.filter(s => getStudentGender(s.student_name) === 'female').length;

  // Filter summaries by search and gender
  const filteredSummaries = summaries.filter((s) => {
    if (selectedGender !== 'all') {
      const g = getStudentGender(s.student.student_name);
      if (g !== selectedGender) return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.student.student_name.toLowerCase().includes(q) ||
      s.student.student_no.toString().includes(q)
    );
  });

  // Top 3 Podium
  const top1 = summaries.length > 0 ? summaries[0] : null;
  const top2 = summaries.length > 1 ? summaries[1] : null;
  const top3 = summaries.length > 2 ? summaries[2] : null;

  // Recent 50 Merits
  const recentMerits = records
    .filter((r) => r.category === 'merit')
    .slice(0, 50);

  // Recent 50 Demerits
  const recentDemerits = records
    .filter((r) => r.category === 'demerit')
    .slice(0, 50);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-amber-600">
          <span className="text-xl">🥇</span> 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-slate-500">
          <span className="text-xl">🥈</span> 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-amber-800">
          <span className="text-xl">🥉</span> 3
        </span>
      );
    }
    return <span className="text-slate-600 font-bold font-mono text-sm">{rank}</span>;
  };

  const getStatusText = (netScore: number) => {
    if (netScore >= 25) return { label: 'ดีเด่น ⭐⭐⭐', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (netScore >= 15) return { label: 'ดีมาก ⭐⭐', color: 'text-green-700 bg-green-50 border-green-200' };
    if (netScore >= 5) return { label: 'ดี ⭐', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (netScore >= 0) return { label: 'ปกติ', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    return { label: 'ควรปรับปรุง ⚠️', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner / School Context */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>กระดานจัดอันดับความดีนักเรียน</span>
            <span aria-hidden="true">·</span>
            <span>ปีการศึกษา {settings.academic_year}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {settings.system_name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {settings.school_name} — ส่งเสริมคุณธรรม จริยธรรม และวินัยเชิงบวกในห้องเรียน
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0 no-print">
          <button
            onClick={triggerCelebration}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>ฉลองคนเก่ง</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>พิมพ์ตารางอันดับ</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      {summaries.length > 0 && (
        <div
          style={top3Style.backgroundStyle}
          className="rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden transition-all duration-300"
        >
          <div
            style={{ backgroundColor: top3Style.glowColor }}
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">สุดยอดคนดีประจำชั้น (Top 3)</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setTop3ColorModalOpen(true)}
                title="ตั้งค่าเปลี่ยนสีพื้นหลัง Top 3"
                className="inline-flex items-center gap-1.5 text-xs text-white/95 hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full border border-white/25 transition-all backdrop-blur-xs font-semibold cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              >
                <Palette className="w-3.5 h-3.5 text-amber-300" />
                <span>เปลี่ยนสีพื้นหลัง</span>
              </button>
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${top3Style.badgeClass}`}>
                {selectedMonth !== 'all' ? `คะแนนรวมประจำเดือน ${THAI_MONTHS.find(m => m.value === selectedMonth)?.label}` : 'คะแนนรวมตลอดเดือน'}
              </span>
            </div>
          </div>

          {summaries.length === 0 ? (
            <div className="py-10 text-center text-white/80">
              <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-2 opacity-70" />
              <div className="text-sm font-semibold">ยังไม่มีข้อมูลนักเรียนและคะแนนความดี</div>
              <p className="text-xs text-emerald-200/80 mt-1">
                สามารถเริ่มต้นเพิ่มรายชื่อนักเรียนได้ที่เมนู &ldquo;จัดการนักเรียน&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
              {/* Rank 2 (Silver) */}
              {top2 ? (() => {
                const gs2 = getGenderStyles(getStudentGender(top2.student.student_name));
                return (
                  <div className="order-2 sm:order-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center relative group hover:bg-white/15 transition-all">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-2xl font-bold ring-4 ring-slate-400/30">
                      🥈
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
                      <span>อันดับ 2</span>
                      <span>·</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${gs2.label === 'ชาย' ? 'bg-sky-400/30 text-sky-200' : 'bg-pink-400/30 text-pink-200'}`}>
                        {gs2.icon} {gs2.label}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1 truncate" title={top2.student.student_name}>
                      {top2.student.student_name}
                    </div>
                    <div className="text-xs text-emerald-200">เลขที่ {top2.student.student_no}</div>
                    <div className="mt-3 py-1 px-2 rounded-lg bg-white/15 font-mono text-base font-bold text-emerald-300 tabular-nums">
                      {top2.net_score} คะแนน
                    </div>
                    <div className="mt-1 text-[11px] text-slate-300">
                      + {top2.merit_score} | - {top2.demerit_score}
                    </div>
                  </div>
                );
              })() : (
                <div className="order-2 sm:order-1 bg-white/5 rounded-xl p-4 text-center text-xs text-white/40">ไม่มีข้อมูล</div>
              )}

              {/* Rank 1 (Gold - Center taller) */}
              {top1 ? (() => {
                const gs1 = getGenderStyles(getStudentGender(top1.student.student_name));
                return (
                  <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-500/20 to-white/10 backdrop-blur-sm rounded-2xl p-5 border-2 border-amber-400/50 text-center relative shadow-lg transform sm:-translate-y-2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-bold text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> ยอดเยี่ยมอันดับ 1
                    </div>
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-3xl font-bold ring-4 ring-amber-300/40 shadow-inner">
                      🥇
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-bold">
                      <span>คะแนนสูงสุด</span>
                      <span>·</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${gs1.label === 'ชาย' ? 'bg-sky-400/40 text-sky-100' : 'bg-pink-400/40 text-pink-100'}`}>
                        {gs1.icon} {gs1.label}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-white mt-1 truncate" title={top1.student.student_name}>
                      {top1.student.student_name}
                    </div>
                    <div className="text-xs text-emerald-200">เลขที่ {top1.student.student_no} · ชั้น {top1.student.student_class}</div>
                    <div className="mt-3 py-1.5 px-3 rounded-xl bg-amber-400/20 border border-amber-400/30 font-mono text-xl font-black text-amber-300 tabular-nums">
                      {top1.net_score} คะแนน
                    </div>
                    <div className="mt-1 text-xs text-amber-100">
                      ความดี +{top1.merit_score} ({top1.merit_count} ครั้ง) · หัก -{top1.demerit_score}
                    </div>
                  </div>
                );
              })() : null}

              {/* Rank 3 (Bronze) */}
              {top3 ? (() => {
                const gs3 = getGenderStyles(getStudentGender(top3.student.student_name));
                return (
                  <div className="order-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center relative group hover:bg-white/15 transition-all">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-700/80 text-amber-100 flex items-center justify-center text-2xl font-bold ring-4 ring-amber-600/30">
                      🥉
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200 font-medium">
                      <span>อันดับ 3</span>
                      <span>·</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${gs3.label === 'ชาย' ? 'bg-sky-400/30 text-sky-200' : 'bg-pink-400/30 text-pink-200'}`}>
                        {gs3.icon} {gs3.label}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1 truncate" title={top3.student.student_name}>
                      {top3.student.student_name}
                    </div>
                    <div className="text-xs text-emerald-200">เลขที่ {top3.student.student_no}</div>
                    <div className="mt-3 py-1 px-2 rounded-lg bg-white/15 font-mono text-base font-bold text-amber-300 tabular-nums">
                      {top3.net_score} คะแนน
                    </div>
                    <div className="mt-1 text-[11px] text-slate-300">
                      + {top3.merit_score} | - {top3.demerit_score}
                    </div>
                  </div>
                );
              })() : (
                <div className="order-3 bg-white/5 rounded-xl p-4 text-center text-xs text-white/40">ไม่มีข้อมูล</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Toolbar with Gender Separator */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>ตัวกรอง:</span>
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedYear}
              onChange={(e) => {
                if (e.target.value === '__manage__') {
                  setAcademicYearModalOpen(true);
                } else {
                  setSelectedYear(e.target.value);
                }
              }}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="all">ปีการศึกษาทั้งหมด</option>
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  ปีการศึกษา {yr}
                </option>
              ))}
              <option value="__manage__">⚙️ + จัดการปีการศึกษา...</option>
            </select>
            <button
              type="button"
              onClick={() => setAcademicYearModalOpen(true)}
              title="จัดการตัวกรองปีการศึกษา (เพิ่ม ลบ แก้ไข)"
              className="px-2 py-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 font-medium shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline text-[11px]">จัดการปี</span>
            </button>
          </div>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">ทุกเดือน (สะสม)</option>
            {THAI_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                เดือน{m.label}
              </option>
            ))}
          </select>

          {/* Gender Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedGender('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedGender === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('male')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                selectedGender === 'male'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-sky-700 hover:bg-sky-50'
              }`}
            >
              <span>👦 ชาย</span>
              <span className="text-[10px] opacity-90">({boyCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('female')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                selectedGender === 'female'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-pink-50'
              }`}
            >
              <span>👧 หญิง</span>
              <span className="text-[10px] opacity-90">({girlCount})</span>
            </button>
          </div>

          {(selectedYear !== 'all' || selectedMonth !== 'all' || selectedGender !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedYear('all');
                setSelectedMonth('all');
                setSelectedGender('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 underline px-1"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ หรือ เลขที่..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Leaderboard Table (ทั้งชั้น) with Gender Colors */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              ตารางสรุปคะแนนความดีและอันดับ (ทั้งชั้น ป.5/1)
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                👦 ชาย {boyCount} คน
              </span>
              <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                👧 หญิง {girlCount} คน
              </span>
            </div>
            <span>
              แสดง {filteredSummaries.length} จาก {students.length} คน
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3 px-4 text-center w-20 whitespace-nowrap">อันดับ</th>
                <th className="py-3 px-3 text-center w-16 whitespace-nowrap">เลขที่</th>
                <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3 text-center w-16 whitespace-nowrap">ชั้น</th>
                <th className="py-3 px-3 text-right text-emerald-700 whitespace-nowrap">ความดี (+)</th>
                <th className="py-3 px-3 text-right text-rose-700 whitespace-nowrap">หักคะแนน (-)</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">คะแนนสุทธิ</th>
                <th className="py-3 px-4 text-center min-w-[120px] whitespace-nowrap">ระดับพฤติกรรม</th>
                <th className="py-3 px-3 text-center w-20 whitespace-nowrap no-print">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลนักเรียนตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item) => {
                  const status = getStatusText(item.net_score);
                  const gender = getStudentGender(item.student.student_name);
                  const gs = getGenderStyles(gender);

                  return (
                    <tr
                      key={item.student.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-bold whitespace-nowrap">
                        {getRankBadge(item.rank)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-bold text-xs ${gs.noBadgeClass}`}>
                          {item.student.student_no}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${gs.badgeClass}`}>
                            <span>{gs.icon}</span>
                            <span>{gs.label}</span>
                          </span>
                          <span className={`font-semibold ${gs.textClass} group-hover:underline`}>
                            {item.student.student_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500 whitespace-nowrap">
                        {item.student.student_class}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-emerald-600 whitespace-nowrap">
                        +{item.merit_score}
                        <span className="text-[10px] text-slate-400 ml-1">({item.merit_count})</span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-rose-600 whitespace-nowrap">
                        {item.demerit_score > 0 ? `-${item.demerit_score}` : '0'}
                        <span className="text-[10px] text-slate-400 ml-1">({item.demerit_count})</span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-base whitespace-nowrap">
                        <span className={item.net_score >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {item.net_score}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center no-print whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (onSelectStudent) {
                              onSelectStudent(item.student.id);
                            }
                            setActiveTab('reports');
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          title="ดูรายงานบุคคล"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent 50 Records Section (⭐ ความดีล่าสุด 50 / ⚠️ หักคะแนนล่าสุด 50) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              ประวัติการบันทึกล่าสุด 50 รายการ
            </h2>
            <p className="text-xs text-slate-500">
              อัปเดตแบบเรียลไทม์เมื่อมีการบันทึกพฤติกรรม
            </p>
          </div>

          {/* Segmented Tab */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setActiveRecentTab('merit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeRecentTab === 'merit'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>ความดีล่าสุด ({recentMerits.length})</span>
            </button>
            <button
              onClick={() => setActiveRecentTab('demerit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeRecentTab === 'demerit'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>หักคะแนนล่าสุด ({recentDemerits.length})</span>
            </button>
          </div>
        </div>

        {/* Recent Items List / Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          {activeRecentTab === 'merit' ? (
            <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 sticky top-0 font-semibold">
                <tr>
                  <th className="py-2.5 px-4 w-28 whitespace-nowrap">วันที่ / เวลา</th>
                  <th className="py-2.5 px-3 w-16 text-center whitespace-nowrap">เลขที่</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">ชื่อ - นามสกุล</th>
                  <th className="py-2.5 px-4 min-w-[180px]">พฤติกรรมความดี</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">คะแนน</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">ผู้บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMerits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ยังไม่มีรายการบันทึกความดี
                    </td>
                  </tr>
                ) : (
                  recentMerits.map((rec) => {
                    const gs = getGenderStyles(getStudentGender(rec.student_name));
                    return (
                      <tr key={rec.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{rec.record_date}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{rec.record_time} น.</div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${gs.noBadgeClass}`}>
                            {rec.student_no}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${gs.badgeClass}`}>
                              {gs.icon} {gs.label}
                            </span>
                            <span className={`font-semibold ${gs.textClass}`}>
                              {rec.student_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-800 font-medium break-words leading-snug">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            <span>{rec.behavior}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                          +{rec.score}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {rec.recorded_by}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 sticky top-0 font-semibold">
                <tr>
                  <th className="py-2.5 px-4 w-28 whitespace-nowrap">วันที่ / เวลา</th>
                  <th className="py-2.5 px-3 w-16 text-center whitespace-nowrap">เลขที่</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">ชื่อ - นามสกุล</th>
                  <th className="py-2.5 px-4 min-w-[180px]">พฤติกรรมที่หักคะแนน</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">คะแนน</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">ผู้บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDemerits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ยังไม่มีรายการหักคะแนน
                    </td>
                  </tr>
                ) : (
                  recentDemerits.map((rec) => {
                    const gs = getGenderStyles(getStudentGender(rec.student_name));
                    return (
                      <tr key={rec.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{rec.record_date}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{rec.record_time} น.</div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${gs.noBadgeClass}`}>
                            {rec.student_no}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${gs.badgeClass}`}>
                              {gs.icon} {gs.label}
                            </span>
                            <span className={`font-semibold ${gs.textClass}`}>
                              {rec.student_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-800 font-medium break-words leading-snug">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{rec.behavior}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-600 tabular-nums whitespace-nowrap">
                          -{rec.score}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {rec.recorded_by}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
