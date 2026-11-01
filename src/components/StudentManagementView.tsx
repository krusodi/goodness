import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { getStudentGender, getGenderStyles } from '../utils/gender';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ArrowUpDown,
  Download
} from 'lucide-react';

export const StudentManagementView: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents,
    showToast
  } = useApp();

  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // New Student Form State
  const [newNo, setNewNo] = useState<string>((students.length + 1).toString());
  const [newName, setNewName] = useState<string>('');
  const [newClass, setNewClass] = useState<string>('ป.5/1');
  const [addFormOpen, setAddFormOpen] = useState(false);

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editNo, setEditNo] = useState<number>(0);
  const [editName, setEditName] = useState<string>('');
  const [editClass, setEditClass] = useState<string>('');

  // Delete confirmation tracker (studentId -> boolean for 2-step confirm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk Import Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [rawBulkText, setRawBulkText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Array<{ student_no: number; student_name: string; student_class: string }>>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'no' | 'name'>('no');
  const [sortAsc, setSortAsc] = useState(true);

  // Handle Add Student
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = addStudent({
      student_no: parseInt(newNo, 10) || students.length + 1,
      student_name: newName,
      student_class: newClass || 'ป.5/1'
    });

    if (res.success) {
      setNewName('');
      setNewNo((students.length + 2).toString());
      setAddFormOpen(false);
    }
  };

  // Handle Edit Student
  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setEditNo(student.student_no);
    setEditName(student.student_name);
    setEditClass(student.student_class);
  };

  const saveEdit = () => {
    if (!editingStudent || !editName.trim()) return;
    updateStudent(editingStudent.id, {
      student_no: editNo,
      student_name: editName,
      student_class: editClass
    });
    setEditingStudent(null);
  };

  // Handle Delete with 2-click confirmation
  const handleDeleteClick = (studentId: string) => {
    if (deleteConfirmId === studentId) {
      // Confirmed on 2nd click!
      deleteStudent(studentId);
      setDeleteConfirmId(null);
    } else {
      // 1st click: request confirmation
      setDeleteConfirmId(studentId);
      showToast('คลิกปุ่มลบอีกครั้งเพื่อยืนยัน', 'info');
      setTimeout(() => {
        setDeleteConfirmId((prev) => (prev === studentId ? null : prev));
      }, 4000);
    }
  };

  // Parse Bulk Text from Excel / CSV copy-paste
  const handleParseBulk = (text: string) => {
    setRawBulkText(text);
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parsed: Array<{ student_no: number; student_name: string; student_class: string }> = [];

    lines.forEach((line, idx) => {
      // Split by tab or comma
      let parts = line.includes('\t') ? line.split('\t') : line.split(',');
      parts = parts.map((p) => p.trim());

      let sNo = idx + 1;
      let sName = '';
      let sClass = 'ป.5/1';

      if (parts.length >= 3) {
        sNo = parseInt(parts[0], 10) || idx + 1;
        sName = parts[1];
        sClass = parts[2] || 'ป.5/1';
      } else if (parts.length === 2) {
        // Could be "No, Name" or "Name, Class"
        if (!isNaN(parseInt(parts[0], 10))) {
          sNo = parseInt(parts[0], 10);
          sName = parts[1];
        } else {
          sName = parts[0];
          sClass = parts[1];
        }
      } else if (parts.length === 1) {
        sName = parts[0];
      }

      if (sName) {
        parsed.push({ student_no: sNo, student_name: sName, student_class: sClass });
      }
    });

    setParsedPreview(parsed);
  };

  const handleConfirmBulk = () => {
    if (parsedPreview.length === 0) return;
    bulkAddStudents(parsedPreview);
    setRawBulkText('');
    setParsedPreview([]);
    setBulkModalOpen(false);
  };

  // Export current list to CSV
  const handleExportCSV = () => {
    const csvContent =
      'เลขที่,ชื่อ-สกุล,ชั้น\n' +
      students.map((s) => `${s.student_no},"${s.student_name}",${s.student_class}`).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดรายชื่อนักเรียน (CSV) สำเร็จ', 'success');
  };

  // Gender counts
  const maleCount = students.filter((s) => getStudentGender(s.student_name) === 'male').length;
  const femaleCount = students.filter((s) => getStudentGender(s.student_name) === 'female').length;

  // Filter & Sort
  const filteredStudents = students
    .filter((s) => {
      if (genderFilter !== 'all') {
        if (getStudentGender(s.student_name) !== genderFilter) return false;
      }
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        s.student_name.toLowerCase().includes(q) ||
        s.student_no.toString().includes(q) ||
        s.student_class.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortField === 'no') {
        return sortAsc ? a.student_no - b.student_no : b.student_no - a.student_no;
      } else {
        return sortAsc
          ? a.student_name.localeCompare(b.student_name, 'th')
          : b.student_name.localeCompare(a.student_name, 'th');
      }
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>จัดการข้อมูลนักเรียน</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            รายชื่อนักเรียน (ทั้งหมด {students.length} คน)
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              นักเรียนชาย {maleCount} คน
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-pink-50 text-rose-700 border border-pink-200">
              นักเรียนหญิง {femaleCount} คน
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{addFormOpen ? 'ปิดฟอร์ม' : 'เพิ่มนักเรียน'}</span>
          </button>

          <button
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>นำเข้า CSV / Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
            title="ดาวน์โหลดเป็นไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Add Student Collapsible Panel */}
      {addFormOpen && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs transition-all space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              เพิ่มนักเรียนใหม่
            </h3>
            <span className="text-xs text-emerald-700">กรอกข้อมูลนักเรียนด้านล่าง</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-emerald-950 mb-1">เลขที่</label>
              <input
                type="number"
                required
                min={1}
                value={newNo}
                onChange={(e) => setNewNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-7">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-emerald-950">ชื่อ - นามสกุล</label>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400">คำนำหน้า:</span>
                  <button
                    type="button"
                    onClick={() => setNewName((prev) => prev.startsWith('ด.ญ. ') ? prev.replace('ด.ญ. ', 'ด.ช. ') : prev.startsWith('ด.ช. ') ? prev : 'ด.ช. ' + prev)}
                    className="px-2 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-semibold"
                  >
                    ด.ช.
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewName((prev) => prev.startsWith('ด.ช. ') ? prev.replace('ด.ช. ', 'ด.ญ. ') : prev.startsWith('ด.ญ. ') ? prev : 'ด.ญ. ' + prev)}
                    className="px-2 py-0.5 rounded bg-pink-100 hover:bg-pink-200 text-rose-800 font-semibold"
                  >
                    ด.ญ.
                  </button>
                </div>
              </div>
              <input
                type="text"
                required
                placeholder="เช่น ด.ช. สมชาย สดใส หรือ ด.ญ. มาลี สุขใจ"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-emerald-950 mb-1">ชั้นเรียน</label>
              <input
                type="text"
                required
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddFormOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกนักเรียน</span>
            </button>
          </div>
        </form>
      )}

      {/* Toolbar: Search, Gender Filter & Sort */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ หรือ เลขที่..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                genderFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('male')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                genderFilter === 'male'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-sky-700 hover:bg-sky-50'
              }`}
            >
              <span>ชาย</span>
              <span className="text-[10px] opacity-90">({maleCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('female')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                genderFilter === 'female'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-pink-50'
              }`}
            >
              <span>หญิง</span>
              <span className="text-[10px] opacity-90">({femaleCount})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => {
              if (sortField === 'no') {
                setSortAsc(!sortAsc);
              } else {
                setSortField('no');
                setSortAsc(true);
              }
            }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-all ${
              sortField === 'no'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>เรียงตามเลขที่ {sortField === 'no' && (sortAsc ? '▲' : '▼')}</span>
          </button>

          <button
            onClick={() => {
              if (sortField === 'name') {
                setSortAsc(!sortAsc);
              } else {
                setSortField('name');
                setSortAsc(true);
              }
            }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-all ${
              sortField === 'name'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>เรียงตามชื่อ {sortField === 'name' && (sortAsc ? '▲' : '▼')}</span>
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
              <tr>
                <th className="py-3 px-4 w-20 text-center whitespace-nowrap">เลขที่</th>
                <th className="py-3 px-4 min-w-[220px] whitespace-nowrap">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4 w-28 text-center whitespace-nowrap">ชั้นเรียน</th>
                <th className="py-3 px-4 w-32 text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลนักเรียน
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const gender = getStudentGender(st.student_name);
                  const gs = getGenderStyles(gender);

                  return (
                    <tr key={st.id} className={`${gs.rowClass} transition-colors`}>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono text-xs ${gs.noBadgeClass}`}>
                          {st.student_no}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${gs.badgeClass}`}>
                            {gs.label}
                          </span>
                          <span className={gs.textClass}>
                            {st.student_name}
                          </span>
                        </div>
                      </td>
                    <td className="py-3 px-4 text-center text-slate-600 whitespace-nowrap">
                      {st.student_class}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => startEdit(st)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button with 2-click Confirmation */}
                        <button
                          onClick={() => handleDeleteClick(st.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                            deleteConfirmId === st.id
                              ? 'bg-rose-600 text-white font-bold animate-pulse'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={deleteConfirmId === st.id ? 'คลิกอีกครั้งเพื่อยืนยันการลบ' : 'ลบนักเรียน'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deleteConfirmId === st.id && (
                            <span className="text-[10px] whitespace-nowrap">ยืนยันลบ?</span>
                          )}
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

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">แก้ไขข้อมูลนักเรียน</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลขที่</label>
                <input
                  type="number"
                  value={editNo}
                  onChange={(e) => setEditNo(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ - สกุล</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชั้น</label>
                <input
                  type="text"
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import CSV/Excel Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">นำเข้าข้อมูลนักเรียนจาก Excel / CSV</h3>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">วิธีนำเข้า: </span>
                  คัดลอก (Copy) ข้อมูลจาก Excel หรือ Google Sheets แล้ววาง (Paste) ลงในช่องด้านล่าง
                  โดยสามารถวางรูปแบบ <strong>เลขที่ &nbsp; ชื่อ-สกุล &nbsp; ชั้น</strong> หรือเฉพาะชื่อ-สกุลบรรทัดละ 1 คน
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วางข้อความจาก Excel หรือ CSV ที่นี่:
                </label>
                <textarea
                  rows={6}
                  value={rawBulkText}
                  onChange={(e) => handleParseBulk(e.target.value)}
                  placeholder={`ตัวอย่าง:\n1\tด.ช. กิตติศักดิ์ มณีโชติ\tป.5/1\n2\tด.ช. ณัฐวุฒิ สิทธิชัย\tป.5/1\nหรือ\nด.ช. สมศักดิ์ รักเรียน\nด.ญ. มาลี มีสุข`}
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {parsedPreview.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      ตัวอย่างข้อมูลที่ตรวจพบ ({parsedPreview.length} คน):
                    </span>
                    <span className="text-[11px] text-emerald-700">ตรวจสอบความถูกต้องก่อนกดนำเข้า</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 sticky top-0 text-slate-700 font-semibold">
                        <tr>
                          <th className="py-2 px-3 w-16 text-center">เลขที่</th>
                          <th className="py-2 px-3">ชื่อ - สกุล</th>
                          <th className="py-2 px-3 w-20 text-center">ชั้น</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 text-center font-mono">{item.student_no}</td>
                            <td className="py-1.5 px-3 font-medium text-slate-800">{item.student_name}</td>
                            <td className="py-1.5 px-3 text-center text-slate-500">{item.student_class}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                disabled={parsedPreview.length === 0}
                onClick={handleConfirmBulk}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ยืนยันการนำเข้า ({parsedPreview.length} คน)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
