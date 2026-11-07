import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, FileText, RotateCcw, Check } from 'lucide-react';

interface FooterDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DEFAULT_SYSTEM_DESCRIPTION =
  'ระบบสนับสนุนการพัฒนาคุณธรรม จริยธรรม และวินัยเชิงบวกตามหลักสูตรการศึกษาขั้นพื้นฐาน';

export const FooterDescriptionModal: React.FC<FooterDescriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateSettings, showToast } = useApp();
  const [text, setText] = useState(
    settings.system_description || DEFAULT_SYSTEM_DESCRIPTION
  );

  useEffect(() => {
    if (isOpen) {
      setText(settings.system_description || DEFAULT_SYSTEM_DESCRIPTION);
    }
  }, [isOpen, settings.system_description]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim() || DEFAULT_SYSTEM_DESCRIPTION;
    updateSettings({ system_description: cleanText });
    showToast('แก้ไขข้อความท้ายเว็บเรียบร้อยแล้ว', 'success');
    onClose();
  };

  const handleReset = () => {
    setText(DEFAULT_SYSTEM_DESCRIPTION);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                แก้ไขข้อความท้ายเว็บ (Footer)
              </h3>
              <p className="text-[11px] text-slate-500">
                ข้อความคำอธิบายระบบด้านล่างสุดของทุกหน้า
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                ข้อความที่ต้องการให้แสดง:
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>คืนค่าข้อความเดิม</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="กรอกข้อความที่ต้องการ..."
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 leading-relaxed"
              required
            />
          </div>

          {/* Live Preview Box */}
          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 block mb-1">
              ตัวอย่างการแสดงผลท้ายเว็บ:
            </span>
            <div className="text-center py-2.5 px-3 bg-white/90 rounded-lg border border-emerald-100 text-xs">
              <p className="font-semibold text-emerald-950">
                {settings.system_name} · {settings.school_name}
              </p>
              <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                {text.trim() || DEFAULT_SYSTEM_DESCRIPTION}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกข้อความ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
