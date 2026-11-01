import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Check,
  RotateCcw,
  PenTool,
  UserCheck,
  Shield,
  Building,
  FileText
} from 'lucide-react';

interface SignatureSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignatureSettingsModal: React.FC<SignatureSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateSettings, showToast } = useApp();

  const [sig1Title, setSig1Title] = useState(settings.signatory1_title || 'ครูประจำชั้น ป.5/1');
  const [sig1Name, setSig1Name] = useState(settings.signatory1_name || '');

  const [sig2Title, setSig2Title] = useState(settings.signatory2_title || 'หัวหน้ากลุ่มงานกิจการนักเรียน');
  const [sig2Name, setSig2Name] = useState(settings.signatory2_name || '');

  const [sig3Title, setSig3Title] = useState(settings.signatory3_title || 'ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)');
  const [sig3Name, setSig3Name] = useState(settings.signatory3_name || '');

  // Synchronize when settings change or modal opens
  useEffect(() => {
    if (isOpen) {
      setSig1Title(settings.signatory1_title || 'ครูประจำชั้น ป.5/1');
      setSig1Name(settings.signatory1_name || '');
      setSig2Title(settings.signatory2_title || 'หัวหน้ากลุ่มงานกิจการนักเรียน');
      setSig2Name(settings.signatory2_name || '');
      setSig3Title(settings.signatory3_title || 'ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)');
      setSig3Name(settings.signatory3_name || '');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      signatory1_title: sig1Title.trim() || 'ครูประจำชั้น ป.5/1',
      signatory1_name: sig1Name.trim(),
      signatory2_title: sig2Title.trim() || 'หัวหน้ากลุ่มงานกิจการนักเรียน',
      signatory2_name: sig2Name.trim(),
      signatory3_title: sig3Title.trim() || 'ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)',
      signatory3_name: sig3Name.trim()
    });

    showToast('บันทึกข้อมูลและชื่อผู้ลงนามในกระดาษรายงานเรียบร้อยแล้ว', 'success');
    onClose();
  };

  const handleResetToDefault = () => {
    setSig1Title('ครูประจำชั้น ป.5/1');
    setSig1Name('');
    setSig2Title('หัวหน้ากลุ่มงานกิจการนักเรียน');
    setSig2Name('');
    setSig3Title('ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)');
    setSig3Name('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <PenTool className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">กำหนดและแก้ไขชื่อผู้ลงนามในกระดาษรายงาน</h3>
              <p className="text-[11px] text-emerald-100/90">
                ข้อมูลที่จะปรากฏในส่วนลงนามท้ายเอกสารรายงานและสั่งพิมพ์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>คำแนะนำ:</strong> สามารถระบุทั้งตำแหน่งและชื่อ-สกุลของผู้ลงนามได้ตามต้องการ{' '}
              <span className="text-emerald-700">(หากเว้นว่างช่องชื่อ-สกุล ระบบจะแสดงเส้นประ .................... เพื่อให้ลงชื่อและเขียนชื่อด้วยลายมือ)</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Signatory 1: ครูประจำชั้น */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>ผู้ลงนามที่ 1: ครูประจำชั้น</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่ง (เช่น ครูประจำชั้น ป.5/1)
                  </label>
                  <input
                    type="text"
                    required
                    value={sig1Title}
                    onChange={(e) => setSig1Title(e.target.value)}
                    placeholder="เช่น ครูประจำชั้น ป.5/1"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล (เว้นว่าง = เส้นประ)
                  </label>
                  <input
                    type="text"
                    value={sig1Name}
                    onChange={(e) => setSig1Name(e.target.value)}
                    placeholder="เช่น นายสมชาย สดใส"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Signatory 2: หัวหน้ากลุ่มงานกิจการนักเรียน */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>ผู้ลงนามที่ 2: หัวหน้ากลุ่มงานกิจการนักเรียน</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    required
                    value={sig2Title}
                    onChange={(e) => setSig2Title(e.target.value)}
                    placeholder="เช่น หัวหน้ากลุ่มงานกิจการนักเรียน"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล (เว้นว่าง = เส้นประ)
                  </label>
                  <input
                    type="text"
                    value={sig2Name}
                    onChange={(e) => setSig2Name(e.target.value)}
                    placeholder="เช่น นางสาวดวงใจ สอนดี"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Signatory 3: ผู้อำนวยการโรงเรียน */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Building className="w-4 h-4 text-amber-600" />
                <span>ผู้ลงนามที่ 3: ผู้อำนวยการโรงเรียน</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    required
                    value={sig3Title}
                    onChange={(e) => setSig3Title(e.target.value)}
                    placeholder="เช่น ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล (เว้นว่าง = เส้นประ)
                  </label>
                  <input
                    type="text"
                    value={sig3Name}
                    onChange={(e) => setSig3Name(e.target.value)}
                    placeholder="เช่น นายประสิทธิ์ พัฒนาการ"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview of Signatures */}
          <div className="mt-4 p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/30">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
              ตัวอย่างการแสดงผลจริงท้ายกระดาษรายงาน:
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-[11px] bg-white p-4 rounded-lg border border-slate-100 shadow-2xs">
              <div>
                <div className="text-slate-400 mb-2">ลงชื่อ ......................................</div>
                <div className="font-bold text-slate-900">
                  ( {sig1Name.trim() ? sig1Name.trim() : '......................................'} )
                </div>
                <div className="text-slate-600 text-[10px] mt-0.5">{sig1Title || 'ครูประจำชั้น ป.5/1'}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-2">ลงชื่อ ......................................</div>
                <div className="font-bold text-slate-900">
                  ( {sig2Name.trim() ? sig2Name.trim() : '......................................'} )
                </div>
                <div className="text-slate-600 text-[10px] mt-0.5">{sig2Title || 'หัวหน้ากลุ่มงานกิจการนักเรียน'}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-2">ลงชื่อ ......................................</div>
                <div className="font-bold text-slate-900">
                  ( {sig3Name.trim() ? sig3Name.trim() : '......................................'} )
                </div>
                <div className="text-slate-600 text-[10px] mt-0.5">{sig3Title || 'ผู้อำนวยการโรงเรียน'}</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกข้อมูลผู้ลงนาม</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
