import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRESET_DEMERIT_BEHAVIORS, BehaviorRecord } from '../types';
import { getStudentGender, getGenderStyles } from '../utils/gender';
import {
  AlertTriangle,
  CheckSquare,
  Square,
  Search,
  Check,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export const DemeritRecordView: React.FC = () => {
  const {
    students,
    records,
    addDemeritBatch,
    updateRecord,
    deleteRecord,
    showToast
  } = useApp();

  // Current date & time defaults
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  // Form State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedBehavior, setSelectedBehavior] = useState<string>(PRESET_DEMERIT_BEHAVIORS[0]);
  const [customBehavior, setCustomBehavior] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [score, setScore] = useState<number>(5);
  const [recordDate, setRecordDate] = useState<string>(defaultDate);
  const [recordTime, setRecordTime] = useState<string>(defaultTime);
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Editing record state
  const [editingRecord, setEditingRecord] = useState<BehaviorRecord | null>(null);
  const [editBehavior, setEditBehavior] = useState('');
  const [editScore, setEditScore] = useState(5);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // History search
  const [historySearch, setHistorySearch] = useState('');

  // Recent 50 demerits
  const demeritRecords = records
    .filter((r) => r.category === 'demerit')
    .slice(0, 50);

  const filteredHistory = demeritRecords.filter((r) => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      r.student_name.toLowerCase().includes(q) ||
      r.student_no.toString().includes(q) ||
      r.behavior.toLowerCase().includes(q) ||
      r.record_date.includes(q)
    );
  });

  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  const maleCount = students.filter((s) => getStudentGender(s.student_name) === 'male').length;
  const femaleCount = students.filter((s) => getStudentGender(s.student_name) === 'female').length;

  // Toggle student selection
  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllStudents = () => {
    if (genderFilter === 'male') {
      const maleIds = students.filter(s => getStudentGender(s.student_name) === 'male').map(s => s.id);
      setSelectedStudentIds(Array.from(new Set([...selectedStudentIds, ...maleIds])));
    } else if (genderFilter === 'female') {
      const femaleIds = students.filter(s => getStudentGender(s.student_name) === 'female').map(s => s.id);
      setSelectedStudentIds(Array.from(new Set([...selectedStudentIds, ...femaleIds])));
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const selectOnlyBoys = () => {
    const maleIds = students.filter(s => getStudentGender(s.student_name) === 'male').map(s => s.id);
    setSelectedStudentIds(maleIds);
  };

  const selectOnlyGirls = () => {
    const femaleIds = students.filter(s => getStudentGender(s.student_name) === 'female').map(s => s.id);
    setSelectedStudentIds(femaleIds);
  };

  const clearSelectedStudents = () => {
    setSelectedStudentIds([]);
  };

  // Submit batch
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      showToast('กรุณาเลือกนักเรียนอย่างน้อย 1 คน', 'error');
      return;
    }

    const finalBehavior = isCustom ? customBehavior.trim() : selectedBehavior.trim();
    if (!finalBehavior) {
      showToast('กรุณาระบุพฤติกรรมที่หักคะแนน', 'error');
      return;
    }

    const success = addDemeritBatch(
      selectedStudentIds,
      finalBehavior,
      score,
      recordDate,
      recordTime
    );

    if (success) {
      setSelectedStudentIds([]);
      if (isCustom) {
        setCustomBehavior('');
      }
    }
  };

  // Edit record
  const startEdit = (rec: BehaviorRecord) => {
    setEditingRecord(rec);
    setEditBehavior(rec.behavior);
    setEditScore(rec.score);
    setEditDate(rec.record_date);
    setEditTime(rec.record_time);
  };

  const saveEdit = () => {
    if (!editingRecord || !editBehavior.trim()) return;
    updateRecord(editingRecord.id, {
      behavior: editBehavior.trim(),
      score: Math.max(1, Math.min(100, editScore)),
      record_date: editDate,
      record_time: editTime
    });
    setEditingRecord(null);
  };

  // Filter students for picker
  const filteredStudents = students.filter((s) => {
    if (genderFilter !== 'all') {
      if (getStudentGender(s.student_name) !== genderFilter) return false;
    }
    const q = studentSearch.trim().toLowerCase();
    if (!q) return true;
    return s.student_name.toLowerCase().includes(q) || s.student_no.toString().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>หักคะแนนความประพฤติ (ลบคะแนน)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            บันทึกการหักคะแนนพฤติกรรม ⚠️
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            เลือกนักเรียนหนึ่งหรือหลายคนพร้อมกัน และเลือกพฤติกรรมจาก 21 รายการมาตรฐานหรือพิมพ์เอง
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-rose-900 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>บันทึกหักคะแนนสะสม {records.filter(r => r.category === 'demerit').length} รายการ</span>
        </div>
      </div>

      {/* Main Demerit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 sm:p-6 space-y-6">
        
        {/* Step 1: Select Students (Single or Batch) with Gender Distinction */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs flex items-center justify-center font-bold">1</span>
              <span>เลือกนักเรียนที่ถูกหักคะแนน</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                เลือกแล้ว {selectedStudentIds.length} คน
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllStudents}
                className="text-xs font-medium text-rose-700 hover:text-rose-900 flex items-center gap-1 hover:underline"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>เลือกทั้งหมด</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={selectOnlyBoys}
                className="text-xs font-medium text-sky-700 hover:text-sky-900 hover:underline"
              >
                👦 เฉพาะชาย ({maleCount})
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={selectOnlyGirls}
                className="text-xs font-medium text-rose-700 hover:text-rose-900 hover:underline"
              >
                👧 เฉพาะหญิง ({femaleCount})
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={clearSelectedStudents}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
              >
                <Square className="w-3.5 h-3.5" />
                <span>ล้าง</span>
              </button>
            </div>
          </div>

          {/* Quick search & Gender Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรือเลขที่นักเรียน..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  genderFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                ทุกคน ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('male')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  genderFilter === 'male' ? 'bg-sky-600 text-white shadow-xs' : 'text-sky-700 hover:bg-sky-50'
                }`}
              >
                <span>👦 ชาย</span>
                <span className="text-[10px] opacity-90">({maleCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('female')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  genderFilter === 'female' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-600 hover:bg-pink-50'
                }`}
              >
                <span>👧 หญิง</span>
                <span className="text-[10px] opacity-90">({femaleCount})</span>
              </button>
            </div>
          </div>

          {/* Student Grid with Gender-Colored Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/50">
            {filteredStudents.map((st) => {
              const isSelected = selectedStudentIds.includes(st.id);
              const gender = getStudentGender(st.student_name);
              const gs = getGenderStyles(gender);

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => toggleStudent(st.id)}
                  className={`p-2 rounded-xl text-left border text-xs transition-all flex items-start gap-2 ${
                    isSelected
                      ? 'bg-rose-600 border-rose-700 text-white font-bold shadow-xs ring-2 ring-rose-400'
                      : gs.chipInactive
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[11px] font-mono font-bold ${
                    isSelected ? 'bg-white text-rose-700' : gs.avatarClass
                  }`}>
                    {isSelected ? '✓' : st.student_no}
                  </div>
                  <div className="truncate min-w-0">
                    <div className="truncate text-xs leading-tight flex items-center gap-1">
                      <span>{gs.icon}</span>
                      <span className="truncate">{st.student_name}</span>
                    </div>
                    <div className={`text-[10px] ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                      เลขที่ {st.student_no} · {gs.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Demerit Behavior (21 Preset Items + Custom) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs flex items-center justify-center font-bold">2</span>
              <span>เลือกพฤติกรรมที่หักคะแนน (21 รายการมาตรฐาน)</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline"
            >
              {isCustom ? '← เลือกจาก 21 รายการ' : '✏️ พิมพ์พฤติกรรมเอง'}
            </button>
          </div>

          {!isCustom ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
              {PRESET_DEMERIT_BEHAVIORS.map((beh) => {
                const isChosen = selectedBehavior === beh;
                return (
                  <button
                    key={beh}
                    type="button"
                    onClick={() => setSelectedBehavior(beh)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                      isChosen
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50/50 hover:border-rose-200'
                    }`}
                  >
                    ⚠️ {beh}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={customBehavior}
                onChange={(e) => setCustomBehavior(e.target.value)}
                placeholder="พิมพ์พฤติกรรมที่ต้องการหักคะแนน..."
                className="w-full px-3 py-2 text-sm bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[11px] text-slate-400">
                หากพฤติกรรมไม่มีใน 21 รายการ สามารถพิมพ์ระบุได้อิสระ
              </p>
            </div>
          )}
        </div>

        {/* Step 3: Score & Date/Time */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2 border-t border-slate-100">
          {/* Score Selector */}
          <div className="sm:col-span-5">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs flex items-center justify-center font-bold">3</span>
              <span>คะแนนที่หัก (1 - 100)</span>
            </label>

            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((quickScore) => (
                <button
                  key={quickScore}
                  type="button"
                  onClick={() => setScore(quickScore)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold border transition-all ${
                    score === quickScore
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  -{quickScore}
                </button>
              ))}

              <div className="relative flex-1">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-1.5 text-sm font-bold text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  แต้ม
                </span>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>วันที่บันทึก</span>
            </label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Time Picker */}
          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>เวลาที่บันทึก</span>
            </label>
            <input
              type="time"
              value={recordTime}
              onChange={(e) => setRecordTime(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {selectedStudentIds.length > 0 ? (
              <span>
                กำลังจะหักคะแนนนักเรียน <strong>{selectedStudentIds.length}</strong> คน คนละ <strong>-{score}</strong> คะแนน
              </span>
            ) : (
              <span>กรุณาคลิกเลือกนักเรียนด้านบน</span>
            )}
          </div>

          <button
            type="submit"
            disabled={selectedStudentIds.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>หักคะแนน ({selectedStudentIds.length} คน)</span>
          </button>
        </div>
      </form>

      {/* History 50 Recent Demerits (Edit / Delete) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              ประวัติการหักคะแนน 50 รายการล่าสุด
            </h2>
            <p className="text-xs text-slate-500">สามารถแก้ไขหรือลบรายการที่บันทึกผิดพลาดได้</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="ค้นหาในประวัติ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 sticky top-0 font-semibold">
              <tr>
                <th className="py-2.5 px-4 w-28">วันที่ / เวลา</th>
                <th className="py-2.5 px-3 w-16 text-center">เลขที่</th>
                <th className="py-2.5 px-4">ชื่อ - นามสกุล</th>
                <th className="py-2.5 px-4">พฤติกรรมที่หักคะแนน</th>
                <th className="py-2.5 px-3 text-right">คะแนน</th>
                <th className="py-2.5 px-4">ผู้บันทึก</th>
                <th className="py-2.5 px-3 w-20 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ไม่พบรายการประวัติการหักคะแนน
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => {
                  const gs = getGenderStyles(getStudentGender(rec.student_name));
                  return (
                    <tr key={rec.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                        <div>{rec.record_date}</div>
                        <div className="text-[11px] text-slate-400">{rec.record_time} น.</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${gs.noBadgeClass}`}>
                          {rec.student_no}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${gs.badgeClass}`}>
                            {gs.icon} {gs.label}
                          </span>
                          <span className={`font-semibold ${gs.textClass}`}>
                            {rec.student_name}
                          </span>
                        </div>
                      </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 font-medium text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        {rec.behavior}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 tabular-nums">
                      -{rec.score}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-500">
                      {rec.recorded_by}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => startEdit(rec)}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRecord(rec.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-rose-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">แก้ไขรายการหักคะแนน</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600 pb-2 border-b border-slate-100">
                นักเรียน: <strong>{editingRecord.student_name}</strong> (เลขที่ {editingRecord.student_no})
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  พฤติกรรมที่หักคะแนน
                </label>
                <input
                  type="text"
                  value={editBehavior}
                  onChange={(e) => setEditBehavior(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คะแนนที่หัก (1 - 100)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={editScore}
                  onChange={(e) => setEditScore(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เวลา
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
