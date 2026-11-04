import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Star,
  AlertTriangle,
  Search,
  Sparkles
} from 'lucide-react';

interface BehaviorPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BehaviorPresetModal: React.FC<BehaviorPresetModalProps> = ({ isOpen, onClose }) => {
  const {
    meritBehaviors,
    demeritBehaviors,
    addMeritBehavior,
    updateMeritBehavior,
    deleteMeritBehavior,
    resetMeritBehaviors,
    addDemeritBehavior,
    updateDemeritBehavior,
    deleteDemeritBehavior,
    resetDemeritBehaviors,
    behaviorModalTab,
    setBehaviorModalTab
  } = useApp();

  const [newItemName, setNewItemName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const currentList = behaviorModalTab === 'merit' ? meritBehaviors : demeritBehaviors;
  const isMerit = behaviorModalTab === 'merit';

  const filteredList = currentList.map((item, originalIndex) => ({
    name: item,
    originalIndex
  })).filter((entry) =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (isMerit) {
      const res = addMeritBehavior(newItemName.trim());
      if (res.success) setNewItemName('');
    } else {
      const res = addDemeritBehavior(newItemName.trim());
      if (res.success) setNewItemName('');
    }
  };

  const startEdit = (originalIndex: number, currentVal: string) => {
    setEditingIndex(originalIndex);
    setEditingValue(currentVal);
  };

  const saveEdit = (oldName: string) => {
    if (!editingValue.trim()) return;

    if (isMerit) {
      updateMeritBehavior(oldName, editingValue.trim());
    } else {
      updateDemeritBehavior(oldName, editingValue.trim());
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleDelete = (name: string) => {
    if (isMerit) {
      deleteMeritBehavior(name);
    } else {
      deleteDemeritBehavior(name);
    }
    if (editingIndex !== null) {
      setEditingIndex(null);
    }
  };

  const handleReset = () => {
    if (isMerit) {
      resetMeritBehaviors();
    } else {
      resetDemeritBehaviors();
    }
    setConfirmReset(false);
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          isMerit ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-rose-600 to-pink-600'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              {isMerit ? (
                <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-200" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                จัดการรายการพฤติกรรมมาตรฐาน (21 รายการ)
              </h2>
              <p className="text-xs text-white/80">
                เพิ่ม ลบ หรือแก้ไขข้อความพฤติกรรมมาตรฐานสำหรับครูและผู้ดูแลระบบ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Merit vs Demerit */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setBehaviorModalTab('merit');
              setEditingIndex(null);
              setSearchTerm('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isMerit
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Star className={`w-4 h-4 ${isMerit ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
            <span>พฤติกรรมความดี ({meritBehaviors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBehaviorModalTab('demerit');
              setEditingIndex(null);
              setSearchTerm('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              !isMerit
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${!isMerit ? 'text-amber-200' : 'text-slate-400'}`} />
            <span>พฤติกรรมหักคะแนน ({demeritBehaviors.length})</span>
          </button>
        </div>

        {/* Add New Item Form & Search Bar */}
        <div className="p-4 bg-white border-b border-slate-100 space-y-3">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={isMerit ? 'พิมพ์พฤติกรรมความดีที่ต้องการเพิ่ม เช่น ช่วยเปิดปิดไฟ...' : 'พิมพ์พฤติกรรมหักคะแนนที่ต้องการเพิ่ม เช่น นำของเล่นมา...' }
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isMerit
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการ</span>
            </button>
          </form>

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาข้อความพฤติกรรมในรายการ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              {searchTerm ? 'ไม่พบรายการที่ตรงกับคำค้นหา' : 'ยังไม่มีรายการพฤติกรรม'}
            </div>
          ) : (
            filteredList.map((entry) => {
              const isEditing = editingIndex === entry.originalIndex;

              return (
                <div
                  key={`${entry.name}-${entry.originalIndex}`}
                  className="pt-2 first:pt-0 flex items-center justify-between gap-3 group hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                      isMerit ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {entry.originalIndex + 1}
                    </span>

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(entry.name);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                          autoFocus
                          className="flex-1 px-2.5 py-1 text-xs sm:text-sm border border-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(entry.name)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          title="บันทึก"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                          title="ยกเลิก"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                        {entry.name}
                      </span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(entry.originalIndex, entry.name)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="แก้ไขชื่อพฤติกรรมนี้"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(entry.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Reset to Default 21 items & Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700 font-semibold">ยืนยันคืนค่า 21 รายการเดิม?</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
                >
                  ยืนยัน
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                title="รีเซ็ตกลับเป็น 21 รายการมาตรฐานดั้งเดิม"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>คืนค่าเริ่มต้น 21 รายการมาตรฐานเดิม</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
