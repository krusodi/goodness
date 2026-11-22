import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ScheduleDayKey,
  TeachingPeriodTimes,
  TeachingSchedule,
  TeachingScheduleCell
} from '../types';
import {
  DEFAULT_TEACHING_PERIOD_TIMES,
  DEFAULT_TEACHING_SCHEDULE
} from '../data/initialData';
import {
  Clock,
  Printer,
  FileText,
  Edit3,
  RotateCcw,
  Save,
  X,
  Utensils,
  BookOpen,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { exportElementToWord } from '../utils/exportWord';

interface DayConfig {
  key: ScheduleDayKey;
  label: string;
  shortLabel: string;
  rowBg: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
}

const DAYS_OF_WEEK: DayConfig[] = [
  {
    key: 'mon',
    label: 'วันจันทร์',
    shortLabel: 'จ.',
    rowBg: 'bg-amber-50/40',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    borderAccent: 'border-l-4 border-l-amber-400'
  },
  {
    key: 'tue',
    label: 'วันอังคาร',
    shortLabel: 'อ.',
    rowBg: 'bg-pink-50/40',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-900',
    borderAccent: 'border-l-4 border-l-pink-400'
  },
  {
    key: 'wed',
    label: 'วันพุธ',
    shortLabel: 'พ.',
    rowBg: 'bg-emerald-50/40',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    borderAccent: 'border-l-4 border-l-emerald-500'
  },
  {
    key: 'thu',
    label: 'วันพฤหัสบดี',
    shortLabel: 'พฤ.',
    rowBg: 'bg-orange-50/40',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
    borderAccent: 'border-l-4 border-l-orange-400'
  },
  {
    key: 'fri',
    label: 'วันศุกร์',
    shortLabel: 'ศ.',
    rowBg: 'bg-sky-50/40',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    borderAccent: 'border-l-4 border-l-sky-400'
  }
];

const SUBJECT_PRESETS = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์ฯ',
  'ภาษาอังกฤษ',
  'สังคมศึกษาฯ',
  'ประวัติศาสตร์',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'วิทยาการคำนวณ',
  'หน้าที่พลเมือง',
  'ลูกเสือ - เนตรนารี',
  'ชุมนุม',
  'แนะแนว / โฮมรูม',
  'ซ่อมเสริม / คุณธรรม',
  'กิจกรรมพัฒนาผู้เรียน'
];

const COLOR_OPTIONS: Array<{
  id: string;
  label: string;
  cellClass: string;
  dotClass: string;
}> = [
  { id: 'emerald', label: 'เขียว', cellClass: 'bg-emerald-50/80 border-emerald-200 text-emerald-950', dotClass: 'bg-emerald-500' },
  { id: 'sky', label: 'ฟ้า', cellClass: 'bg-sky-50/80 border-sky-200 text-sky-950', dotClass: 'bg-sky-500' },
  { id: 'amber', label: 'เหลือง', cellClass: 'bg-amber-50/80 border-amber-200 text-amber-950', dotClass: 'bg-amber-500' },
  { id: 'rose', label: 'ชมพู/แดง', cellClass: 'bg-rose-50/80 border-rose-200 text-rose-950', dotClass: 'bg-rose-500' },
  { id: 'purple', label: 'ม่วง', cellClass: 'bg-purple-50/80 border-purple-200 text-purple-950', dotClass: 'bg-purple-500' },
  { id: 'indigo', label: 'คราม', cellClass: 'bg-indigo-50/80 border-indigo-200 text-indigo-950', dotClass: 'bg-indigo-500' },
  { id: 'teal', label: 'เขียวน้ำทะเล', cellClass: 'bg-teal-50/80 border-teal-200 text-teal-950', dotClass: 'bg-teal-500' },
  { id: 'slate', label: 'เทา', cellClass: 'bg-slate-50 border-slate-200 text-slate-900', dotClass: 'bg-slate-500' }
];

const getColorMeta = (colorId?: string) => {
  return COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
};

type PeriodSlotItem =
  | { kind: 'period'; periodNum: 1 | 2 | 3 | 4 | 5 | 6; timeKey: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'; label: string }
  | { kind: 'lunch'; label: string };

export const TeachingSchedulePanel: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();

  // Merge saved teaching_schedule safely with defaults
  const schedule: TeachingSchedule = useMemo(() => {
    const saved = settings.teaching_schedule;
    return {
      title: saved?.title || DEFAULT_TEACHING_SCHEDULE.title,
      periodTimes: {
        ...DEFAULT_TEACHING_PERIOD_TIMES,
        ...(saved?.periodTimes || {})
      },
      cells: saved?.cells ? { ...saved.cells } : { ...DEFAULT_TEACHING_SCHEDULE.cells }
    };
  }, [settings.teaching_schedule]);

  // Build ordered columns (Periods 1-6 + Lunch Break positioned after period 3 or 4)
  const columns: PeriodSlotItem[] = useMemo(() => {
    const p1: PeriodSlotItem = { kind: 'period', periodNum: 1, timeKey: 'p1', label: 'คาบที่ 1' };
    const p2: PeriodSlotItem = { kind: 'period', periodNum: 2, timeKey: 'p2', label: 'คาบที่ 2' };
    const p3: PeriodSlotItem = { kind: 'period', periodNum: 3, timeKey: 'p3', label: 'คาบที่ 3' };
    const p4: PeriodSlotItem = { kind: 'period', periodNum: 4, timeKey: 'p4', label: 'คาบที่ 4' };
    const p5: PeriodSlotItem = { kind: 'period', periodNum: 5, timeKey: 'p5', label: 'คาบที่ 5' };
    const p6: PeriodSlotItem = { kind: 'period', periodNum: 6, timeKey: 'p6', label: 'คาบที่ 6' };
    const lunch: PeriodSlotItem = {
      kind: 'lunch',
      label: schedule.periodTimes.lunchLabel || 'พักกลางวัน'
    };

    if (schedule.periodTimes.lunchPosition === 'after_4') {
      return [p1, p2, p3, p4, lunch, p5, p6];
    }
    return [p1, p2, p3, lunch, p4, p5, p6];
  }, [schedule.periodTimes.lunchLabel, schedule.periodTimes.lunchPosition]);

  // Modal 1: Edit Period Times (คาบที่ 1-6 และ พักกลางวัน)
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftTimes, setDraftTimes] = useState<TeachingPeriodTimes>(DEFAULT_TEACHING_PERIOD_TIMES);

  const openTimeModal = () => {
    setDraftTitle(schedule.title || DEFAULT_TEACHING_SCHEDULE.title || '');
    setDraftTimes({ ...schedule.periodTimes });
    setTimeModalOpen(true);
  };

  const handleSaveTimes = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TeachingSchedule = {
      ...schedule,
      title: draftTitle.trim() || DEFAULT_TEACHING_SCHEDULE.title,
      periodTimes: {
        p1: draftTimes.p1.trim() || DEFAULT_TEACHING_PERIOD_TIMES.p1,
        p2: draftTimes.p2.trim() || DEFAULT_TEACHING_PERIOD_TIMES.p2,
        p3: draftTimes.p3.trim() || DEFAULT_TEACHING_PERIOD_TIMES.p3,
        lunch: draftTimes.lunch.trim() || DEFAULT_TEACHING_PERIOD_TIMES.lunch,
        p4: draftTimes.p4.trim() || DEFAULT_TEACHING_PERIOD_TIMES.p4,
        p5: draftTimes.p5.trim() || DEFAULT_TEACHING_PERIOD_TIMES.p5,
        p6: draftTimes.p6.trim() || DEFAULT_TEACHING_PERIOD_TIMES.p6,
        lunchLabel: draftTimes.lunchLabel.trim() || 'พักกลางวัน',
        lunchPosition: draftTimes.lunchPosition === 'after_4' ? 'after_4' : 'after_3'
      }
    };
    updateSettings({ teaching_schedule: updated });
    setTimeModalOpen(false);
    showToast('บันทึกเวลาคาบที่ 1-6 และพักกลางวันเรียบร้อยแล้ว', 'success');
  };

  const handleResetDefaultTimes = () => {
    setDraftTimes({ ...DEFAULT_TEACHING_PERIOD_TIMES });
  };

  // Modal 2: Edit individual Day × Period Cell
  const [editingCell, setEditingCell] = useState<{
    day: DayConfig;
    periodNum: 1 | 2 | 3 | 4 | 5 | 6;
    timeText: string;
  } | null>(null);
  const [cellSubject, setCellSubject] = useState('');
  const [cellRoom, setCellRoom] = useState('');
  const [cellTeacher, setCellTeacher] = useState('');
  const [cellColor, setCellColor] = useState('emerald');

  const openCellModal = (day: DayConfig, periodNum: 1 | 2 | 3 | 4 | 5 | 6, timeText: string) => {
    const key = `${day.key}_${periodNum}`;
    const existing = schedule.cells[key];
    setEditingCell({ day, periodNum, timeText });
    setCellSubject(existing?.subject || '');
    setCellRoom(existing?.room || '');
    setCellTeacher(existing?.teacher || '');
    setCellColor(existing?.color || 'emerald');
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;
    const key = `${editingCell.day.key}_${editingCell.periodNum}`;
    const nextCells = { ...schedule.cells };

    if (!cellSubject.trim()) {
      delete nextCells[key];
    } else {
      const nextCell: TeachingScheduleCell = {
        subject: cellSubject.trim(),
        color: cellColor
      };
      if (cellRoom.trim()) nextCell.room = cellRoom.trim();
      if (cellTeacher.trim()) nextCell.teacher = cellTeacher.trim();
      nextCells[key] = nextCell;
    }

    updateSettings({
      teaching_schedule: {
        ...schedule,
        cells: nextCells
      }
    });
    setEditingCell(null);
    showToast(`อัปเดตตาราง ${editingCell.day.label} คาบที่ ${editingCell.periodNum} แล้ว`, 'success');
  };

  const handleClearCell = () => {
    if (!editingCell) return;
    const key = `${editingCell.day.key}_${editingCell.periodNum}`;
    const nextCells = { ...schedule.cells };
    delete nextCells[key];
    updateSettings({
      teaching_schedule: {
        ...schedule,
        cells: nextCells
      }
    });
    setEditingCell(null);
    showToast(`ล้างข้อมูล ${editingCell.day.label} คาบที่ ${editingCell.periodNum} แล้ว`, 'info');
  };

  return (
    <div className="space-y-5">
      {/* Control Toolbar Card */}
      <div className="no-print bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ตารางคาบสอน (วันจันทร์ - วันศุกร์ จำนวน 6 คาบ)
            </h2>
            <p className="text-xs text-slate-500">
              คลิกที่ช่องรายวิชาเพื่อแก้ไขวิชาสอน หรือกดปุ่ม &ldquo;แก้ไขเวลา คาบที่ 1-6 และพักกลางวัน&rdquo; เพื่อปรับช่วงเวลา
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openTimeModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>แก้ไขเวลา คาบที่ 1-6 และพักกลางวัน</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="พิมพ์ตารางคาบสอน / บันทึกเป็น PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>พิมพ์</span>
          </button>

          <button
            type="button"
            onClick={() =>
              exportElementToWord(
                'attendance-teaching-schedule',
                `ตารางคาบสอน_จันทร์-ศุกร์_ปีการศึกษา_${settings.academic_year || '2569'}`,
                { isLandscape: true }
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer shadow-2xs"
            title="ส่งออกและเปิดเอกสารด้วย Microsoft Word (.doc)"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Word</span>
          </button>
        </div>
      </div>

      {/* Printable & Word-Exportable Schedule Card */}
      <div
        id="attendance-teaching-schedule"
        className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden"
      >
        {/* Schedule Document Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/40">
          <div>
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
              {schedule.title || 'ตารางคาบสอน ประจำสัปดาห์ ชั้น ป.5/1'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {settings.school_name} · ภาคเรียนที่ {settings.academic_term || '1'} ปีการศึกษา {settings.academic_year || '2569'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>วันจันทร์ - วันศุกร์ · 6 คาบเรียน</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
              <Utensils className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {schedule.periodTimes.lunchLabel || 'พักกลางวัน'}: {schedule.periodTimes.lunch}
              </span>
            </span>
          </div>
        </div>

        {/* Responsive Schedule Table */}
        <div className="overflow-x-auto p-3 sm:p-5">
          <table className="w-full min-w-[920px] border-collapse border border-slate-300 text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th
                  scope="col"
                  className="border border-slate-300 py-3 px-3 text-center font-extrabold w-28 sm:w-32 bg-slate-100"
                >
                  <div className="text-xs sm:text-sm text-slate-900">วัน / คาบ</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">เวลาเรียน</div>
                </th>

                {columns.map((col, idx) => {
                  if (col.kind === 'lunch') {
                    return (
                      <th
                        key={`col_lunch_${idx}`}
                        scope="col"
                        onClick={openTimeModal}
                        title="คลิกเพื่อแก้ไขเวลาพักกลางวัน"
                        className="border border-slate-300 py-3 px-2 text-center bg-amber-50 hover:bg-amber-100/80 transition-colors cursor-pointer w-28 sm:w-32"
                      >
                        <div className="flex items-center justify-center gap-1 font-extrabold text-amber-900 text-xs sm:text-sm">
                          <Utensils className="w-3.5 h-3.5 text-amber-600 no-print" />
                          <span>{col.label}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-amber-800 mt-1 whitespace-nowrap">
                          {schedule.periodTimes.lunch}
                        </div>
                      </th>
                    );
                  }

                  const timeText = schedule.periodTimes[col.timeKey];
                  return (
                    <th
                      key={`col_p_${col.periodNum}`}
                      scope="col"
                      onClick={openTimeModal}
                      title={`คลิกเพื่อแก้ไขเวลา ${col.label}`}
                      className="border border-slate-300 py-3 px-2 text-center bg-slate-50 hover:bg-emerald-50/70 transition-colors cursor-pointer min-w-[115px]"
                    >
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {col.label}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-1 whitespace-nowrap">
                        {timeText}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {DAYS_OF_WEEK.map((day, dayIndex) => (
                <tr key={day.key} className="hover:bg-slate-50/40 transition-colors">
                  {/* Day Name Column */}
                  <td
                    className={`border border-slate-300 py-3.5 px-3 text-center font-extrabold ${day.rowBg} ${day.borderAccent}`}
                  >
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs sm:text-sm font-extrabold ${day.badgeBg} ${day.badgeText}`}
                    >
                      {day.label}
                    </span>
                  </td>

                  {/* Periods & Lunch Break */}
                  {columns.map((col, colIdx) => {
                    if (col.kind === 'lunch') {
                      if (dayIndex !== 0) return null;
                      return (
                        <td
                          key={`lunch_cell_${colIdx}`}
                          rowSpan={DAYS_OF_WEEK.length}
                          onClick={openTimeModal}
                          title="คลิกเพื่อแก้ไขเวลาพักกลางวัน"
                          className="border border-slate-300 bg-amber-50/60 hover:bg-amber-100/60 transition-colors text-center align-middle px-2 py-4 cursor-pointer"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 text-amber-900">
                            <Utensils className="w-5 h-5 text-amber-600 no-print" />
                            <span className="font-extrabold text-xs sm:text-sm">
                              {schedule.periodTimes.lunchLabel || 'พักกลางวัน'}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-800 whitespace-nowrap">
                              {schedule.periodTimes.lunch}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    const cellKey = `${day.key}_${col.periodNum}`;
                    const cell = schedule.cells[cellKey];
                    const colorMeta = getColorMeta(cell?.color);
                    const timeText = schedule.periodTimes[col.timeKey];

                    return (
                      <td
                        key={cellKey}
                        onClick={() => openCellModal(day, col.periodNum, timeText)}
                        title={`คลิกเพื่อแก้ไขรายวิชา ${day.label} คาบที่ ${col.periodNum}`}
                        className="border border-slate-300 p-1.5 sm:p-2 align-middle text-center cursor-pointer group hover:bg-emerald-50/40 transition-colors"
                      >
                        {cell && cell.subject ? (
                          <div
                            className={`rounded-xl border px-2 py-2.5 min-h-[68px] flex flex-col items-center justify-center gap-0.5 transition-all group-hover:shadow-xs ${colorMeta.cellClass}`}
                          >
                            <div className="font-bold text-xs sm:text-sm leading-snug break-words">
                              {cell.subject}
                            </div>
                            {cell.room && (
                              <div className="text-[11px] opacity-80 font-semibold">
                                ห้อง {cell.room}
                              </div>
                            )}
                            {cell.teacher && (
                              <div className="text-[10px] opacity-75 font-medium">
                                {cell.teacher}
                              </div>
                            )}
                            <span className="no-print mt-1 inline-flex items-center gap-1 text-[10px] font-semibold opacity-0 group-hover:opacity-80 transition-opacity">
                              <Edit3 className="w-2.5 h-2.5" />
                              แก้ไข
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 px-2 py-2.5 min-h-[68px] flex flex-col items-center justify-center text-slate-400 group-hover:border-emerald-300 group-hover:text-emerald-600 transition-colors">
                            <span className="text-xs font-medium">-</span>
                            <span className="no-print text-[10px] font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              + เพิ่มวิชา
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sign-off Footer for Print & Word */}
        <div className="p-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs mt-2">
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

      {/* ============================================================== */}
      {/* MODAL 1: แก้ไขเวลา คาบที่ 1-6 และ พักกลางวัน                  */}
      {/* ============================================================== */}
      {timeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setTimeModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-emerald-100 w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    แก้ไขเวลา คาบที่ 1-6 และพักกลางวัน
                  </h3>
                  <p className="text-xs text-slate-500">
                    กำหนดช่วงเวลาเรียนแต่ละคาบและตำแหน่งเวลาพักกลางวัน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTimeModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTimes} className="p-5 space-y-4">
              {/* Table Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อหัวตารางคาบสอน
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="เช่น ตารางคาบสอน ประจำสัปดาห์ ชั้น ป.5/1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Periods 1 - 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลา คาบที่ 1
                  </label>
                  <input
                    type="text"
                    value={draftTimes.p1}
                    onChange={(e) => setDraftTimes({ ...draftTimes, p1: e.target.value })}
                    placeholder="08:30 - 09:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลา คาบที่ 2
                  </label>
                  <input
                    type="text"
                    value={draftTimes.p2}
                    onChange={(e) => setDraftTimes({ ...draftTimes, p2: e.target.value })}
                    placeholder="09:30 - 10:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลา คาบที่ 3
                  </label>
                  <input
                    type="text"
                    value={draftTimes.p3}
                    onChange={(e) => setDraftTimes({ ...draftTimes, p3: e.target.value })}
                    placeholder="10:30 - 11:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Lunch Break Section */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  <span>ตั้งค่าเวลาพักกลางวัน</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      ข้อความช่วงพัก
                    </label>
                    <input
                      type="text"
                      value={draftTimes.lunchLabel}
                      onChange={(e) => setDraftTimes({ ...draftTimes, lunchLabel: e.target.value })}
                      placeholder="พักกลางวัน"
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      เวลาพักกลางวัน
                    </label>
                    <input
                      type="text"
                      value={draftTimes.lunch}
                      onChange={(e) => setDraftTimes({ ...draftTimes, lunch: e.target.value })}
                      placeholder="11:30 - 12:30"
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      ตำแหน่งพักกลางวัน
                    </label>
                    <select
                      value={draftTimes.lunchPosition}
                      onChange={(e) =>
                        setDraftTimes({
                          ...draftTimes,
                          lunchPosition: e.target.value === 'after_4' ? 'after_4' : 'after_3'
                        })
                      }
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="after_3">หลังคาบที่ 3 (ก่อนคาบ 4)</option>
                      <option value="after_4">หลังคาบที่ 4 (ก่อนคาบ 5)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Periods 4 - 6 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลา คาบที่ 4
                  </label>
                  <input
                    type="text"
                    value={draftTimes.p4}
                    onChange={(e) => setDraftTimes({ ...draftTimes, p4: e.target.value })}
                    placeholder="12:30 - 13:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลา คาบที่ 5
                  </label>
                  <input
                    type="text"
                    value={draftTimes.p5}
                    onChange={(e) => setDraftTimes({ ...draftTimes, p5: e.target.value })}
                    placeholder="13:30 - 14:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เวลา คาบที่ 6
                  </label>
                  <input
                    type="text"
                    value={draftTimes.p6}
                    onChange={(e) => setDraftTimes({ ...draftTimes, p6: e.target.value })}
                    placeholder="14:30 - 15:30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaultTimes}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>คืนค่าเวลาเริ่มต้น</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeModalOpen(false)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกเวลา</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: แก้ไขรายวิชาในคาบสอน                                */}
      {/* ============================================================== */}
      {editingCell && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setEditingCell(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-emerald-100 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    แก้ไขวิชาสอน · {editingCell.day.label} คาบที่ {editingCell.periodNum}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    เวลา {editingCell.timeText}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="p-5 space-y-4">
              {/* Subject Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เลือกวิชาด่วน (หรือพิมพ์ชื่อวิชาด้านล่าง)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUBJECT_PRESETS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setCellSubject(subj)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        cellSubject === subj
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อวิชา / กิจกรรม
                </label>
                <input
                  type="text"
                  value={cellSubject}
                  onChange={(e) => setCellSubject(e.target.value)}
                  placeholder="ระบุชื่อรายวิชา หรือกิจกรรม..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  autoFocus
                />
              </div>

              {/* Room & Teacher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ห้องเรียน / ระดับชั้น (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    value={cellRoom}
                    onChange={(e) => setCellRoom(e.target.value)}
                    placeholder="เช่น ป.5/1, ห้องวิทย์"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ครูผู้สอน (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    value={cellTeacher}
                    onChange={(e) => setCellTeacher(e.target.value)}
                    placeholder="เช่น ครูสมชาย"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Color Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สีแถบรายวิชา
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCellColor(opt.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        cellColor === opt.id
                          ? 'ring-2 ring-emerald-500 border-emerald-500 bg-white shadow-2xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${opt.dotClass}`} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleClearCell}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างช่องนี้</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกรายวิชา</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
