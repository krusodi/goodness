import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicYearModal: React.FC<AcademicYearModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    academicYears,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    updateSettings,
    showToast
  } = useApp();

  const [newYearInput, setNewYearInput] = useState('');
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [deleteConfirmYear, setDeleteConfirmYear] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;
    const res = addAcademicYear(newYearInput.trim());
    if (res.success) {
      setNewYearInput('');
    }
  };

  const handleStartEdit = (year: string) => {
    setEditingYear(year);
    setEditingValue(year);
    setDeleteConfirmYear(null);
  };

  const handleSaveEdit = (oldYear: string) => {
    if (!editingValue.trim()) return;
    const res = updateAcademicYear(oldYear, editingValue.trim());
    if (res.success) {
      setEditingYear(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingYear(null);
    setEditingValue('');
  };

  const handleDeleteClick = (year: string) => {
    if (deleteConfirmYear === year) {
      deleteAcademicYear(year);
      setDeleteConfirmYear(null);
    } else {
      setDeleteConfirmYear(year);
      showToast(`คลิกลบอีกครั้งเพื่อยืนยันการลบปี ${year}`, 'info');
      setTimeout(() => {
        setDeleteConfirmYear((prev) => (prev === year ? null : prev));
      }, 4000);
    }
  };

  const handleSetPrimaryYear = (year: string) => {
    updateSettings({ academic_year: year });
    showToast(`ตั้งปีการศึกษา ${year} เป็นปีหลักของระบบแล้ว`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs shrink-0">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">จัดการตัวกรอง: ปีการศึกษา</h2>
              <p className="text-xs text-emerald-100">เพิ่ม ลบ หรือแก้ไขปีการศึกษาในระบบได้ด้วยตนเอง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Add Year Form */}
          <form
            onSubmit={handleAddSubmit}
            className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2.5"
          >
            <label className="block text-xs font-bold text-emerald-950">
              ➕ เพิ่มปีการศึกษาใหม่
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                placeholder="เช่น 2570 หรือ 2568"
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มปี</span>
              </button>
            </div>
            <p className="text-[11px] text-emerald-700">
              ปีที่เพิ่มจะแสดงในตัวกรองหน้าหลักและหน้ารายงานทันที
            </p>
          </form>

          {/* List of Academic Years */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                รายการปีการศึกษาทั้งหมด ({academicYears.length} ปี)
              </h3>
              <span className="text-[11px] text-slate-400">เรียงจากปีล่าสุด</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              {academicYears.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  ไม่มีปีการศึกษาในระบบ
                </div>
              ) : (
                academicYears.map((year) => {
                  const isPrimary = settings.academic_year === year;
                  const isEditing = editingYear === year;

                  return (
                    <div
                      key={year}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isPrimary ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Year Label or Inline Edit */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isPrimary
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="px-2.5 py-1 text-xs border border-emerald-400 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-900 w-full"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(year)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                              title="บันทึก"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
                              title="ยกเลิก"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              ปีการศึกษา {year}
                            </span>
                            {isPrimary && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                                <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                                <span>ปีหลักของระบบ</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryYear(year)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                              title="ตั้งปีนี้เป็นปีหลักของโรงเรียน"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="hidden sm:inline">ตั้งเป็นปีหลัก</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEdit(year)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors"
                            title="แก้ไขปีการศึกษา"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(year)}
                            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
                              deleteConfirmYear === year
                                ? 'bg-rose-600 text-white border-rose-600 font-bold animate-pulse px-2'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
                            }`}
                            title="ลบปีการศึกษา"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleteConfirmYear === year && <span>ยืนยันลบ?</span>}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>การลบปีการศึกษาจะลบเฉพาะตัวเลือกในตัวกรอง (ไม่ลบข้อมูลคะแนน)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
