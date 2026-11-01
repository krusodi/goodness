import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TOP3_COLOR_PRESETS, Top3ColorPreset } from '../types';
import { Palette, Check, Sparkles, Trophy, X, RotateCcw, ArrowRight } from 'lucide-react';

interface Top3ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Top3ColorModal: React.FC<Top3ColorModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'preset' | 'gradient' | 'solid'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('emerald');
  const [customStart, setCustomStart] = useState<string>('#064e3b');
  const [customEnd, setCustomEnd] = useState<string>('#022c22');
  const [customSolid, setCustomSolid] = useState<string>('#064e3b');

  // Initialize from current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(settings.top3_bg_type || 'preset');
      setSelectedPreset(settings.top3_bg_preset || 'emerald');
      setCustomStart(settings.top3_bg_color || '#064e3b');
      setCustomEnd(settings.top3_bg_color_end || '#022c22');
      setCustomSolid(settings.top3_bg_color || '#064e3b');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  // Compute live preview style
  const getPreviewStyle = (): React.CSSProperties => {
    if (activeTab === 'solid') {
      return { backgroundColor: customSolid };
    }
    if (activeTab === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${customStart} 0%, ${customEnd} 100%)`
      };
    }
    const found = TOP3_COLOR_PRESETS.find((p) => p.id === selectedPreset) || TOP3_COLOR_PRESETS[0];
    return {
      background: `linear-gradient(135deg, ${found.fromColor} 0%, ${found.toColor} 100%)`
    };
  };

  const handleSave = () => {
    if (activeTab === 'preset') {
      const presetObj = TOP3_COLOR_PRESETS.find((p) => p.id === selectedPreset) || TOP3_COLOR_PRESETS[0];
      updateSettings({
        top3_bg_type: 'preset',
        top3_bg_preset: selectedPreset,
        top3_bg_color: presetObj.fromColor,
        top3_bg_color_end: presetObj.toColor
      });
      showToast(`บันทึกสีพื้นหลัง Top 3 "${presetObj.name}" เรียบร้อยแล้ว`, 'success');
    } else if (activeTab === 'gradient') {
      updateSettings({
        top3_bg_type: 'gradient',
        top3_bg_color: customStart,
        top3_bg_color_end: customEnd
      });
      showToast('บันทึกสีพื้นหลังแบบไล่ระดับ (Gradient) เรียบร้อยแล้ว', 'success');
    } else {
      updateSettings({
        top3_bg_type: 'solid',
        top3_bg_color: customSolid
      });
      showToast('บันทึกสีพื้นหลังแบบสีเดี่ยว เรียบร้อยแล้ว', 'success');
    }
    onClose();
  };

  const handleResetToDefault = () => {
    setActiveTab('preset');
    setSelectedPreset('emerald');
    setCustomStart('#064e3b');
    setCustomEnd('#022c22');
    setCustomSolid('#064e3b');
    updateSettings({
      top3_bg_type: 'preset',
      top3_bg_preset: 'emerald',
      top3_bg_color: '#064e3b',
      top3_bg_color_end: '#022c22'
    });
    showToast('คืนค่าสีพื้นหลัง Top 3 เป็นเขียวมรกตมาตรฐานแล้ว', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Palette className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">ตั้งค่าสีพื้นหลัง สุดยอดคนดีประจำชั้น (Top 3)</h2>
              <p className="text-xs text-emerald-100">ปรับแต่งสีพื้นหลังการ์ดจัดอันดับ Top 3 ได้ตามต้องการ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Live Preview Card */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ตัวอย่างการแสดงผลจริง (Live Preview)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {activeTab === 'preset'
                  ? TOP3_COLOR_PRESETS.find((p) => p.id === selectedPreset)?.name
                  : activeTab === 'gradient'
                  ? `${customStart} → ${customEnd}`
                  : customSolid}
              </span>
            </div>

            <div
              style={getPreviewStyle()}
              className="rounded-xl p-4 text-white shadow-md relative overflow-hidden transition-all duration-300 border border-white/15"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold">สุดยอดคนดีประจำชั้น (Top 3)</span>
                </div>
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/20 font-medium">
                  คะแนนรวมตลอดเดือน
                </span>
              </div>

              {/* Mini Podium Simulation */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                  <div className="text-lg">🥈</div>
                  <div className="text-[11px] font-bold text-white truncate">อันดับ 2</div>
                  <div className="text-[10px] text-emerald-200 mt-0.5">32 คะแนน</div>
                </div>
                <div className="bg-amber-400/20 rounded-lg p-2 border border-amber-300/40 transform -translate-y-1 shadow-xs">
                  <div className="text-xl">🥇</div>
                  <div className="text-[11px] font-extrabold text-amber-300 truncate">อันดับ 1</div>
                  <div className="text-[10px] text-amber-200 font-bold mt-0.5">45 คะแนน</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                  <div className="text-lg">🥉</div>
                  <div className="text-[11px] font-bold text-white truncate">อันดับ 3</div>
                  <div className="text-[10px] text-emerald-200 mt-0.5">28 คะแนน</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'preset'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎨 ชุดสีสำเร็จรูป ({TOP3_COLOR_PRESETS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gradient')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'gradient'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌈 ไล่เฉดสีเอง (Gradient)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('solid')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'solid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⬛ สีเดี่ยว (Solid)
            </button>
          </div>

          {/* Mode 1: Presets */}
          {activeTab === 'preset' && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">เลือกชุดสีที่เข้ากับบรรยากาศห้องเรียน:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TOP3_COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${preset.fromColor}, ${preset.toColor})`
                        }}
                        className="w-8 h-8 rounded-lg shrink-0 shadow-xs flex items-center justify-center text-white"
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {preset.fromColor}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Custom Gradient */}
          {activeTab === 'gradient' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Color */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    สีเริ่มต้น (Gradient Start)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shadow-xs"
                    />
                    <input
                      type="text"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* End Color */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    สีสิ้นสุด (Gradient End)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shadow-xs"
                    />
                    <input
                      type="text"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Gradient Ideas */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">คู่สียอดนิยม:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'เขียวมิ้นต์-มรกต', start: '#047857', end: '#064e3b' },
                    { label: 'น้ำเงินนีออน', start: '#1e3a8a', end: '#0f172a' },
                    { label: 'ม่วง-ชมพูค่ำ', start: '#4c1d95', end: '#831843' },
                    { label: 'ทอง-น้ำตาลหิน', start: '#78350f', end: '#1c1917' },
                    { label: 'แดงไวน์เบอร์กันดี', start: '#881337', end: '#31102b' }
                  ].map((pair, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomStart(pair.start);
                        setCustomEnd(pair.end);
                      }}
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <span
                        style={{ background: `linear-gradient(90deg, ${pair.start}, ${pair.end})` }}
                        className="w-3 h-3 rounded-full inline-block border border-white/50"
                      />
                      <span>{pair.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Custom Solid Color */}
          {activeTab === 'solid' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  เลือกสีเดี่ยว (Solid Color)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customSolid}
                    onChange={(e) => setCustomSolid(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-xs"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={customSolid}
                      onChange={(e) => setCustomSolid(e.target.value)}
                      placeholder="#064e3b"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">ระบุรหัสสีแบบ HEX เช่น #064e3b, #1e1b4b, #111827</p>
                  </div>
                </div>
              </div>

              {/* Quick Solid Swatches */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">สีเดี่ยวยอดนิยม:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'เขียวเข้ม', color: '#064e3b' },
                    { label: 'น้ำเงินเข้ม', color: '#1e3a8a' },
                    { label: 'ม่วงเข้ม', color: '#4c1d95' },
                    { label: 'เทาเข้มหรู', color: '#1e293b' },
                    { label: 'ดำสนิท', color: '#09090b' },
                    { label: 'แดงเลือดหมู', color: '#7f1d1d' }
                  ].map((sw, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomSolid(sw.color)}
                      className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span
                        style={{ backgroundColor: sw.color }}
                        className="w-3.5 h-3.5 rounded-full inline-block border border-slate-300"
                      />
                      <span>{sw.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 hover:underline order-2 sm:order-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>คืนค่าเขียวมรกตเริ่มต้น</span>
          </button>

          <div className="flex items-center gap-2 order-1 sm:order-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกสีพื้นหลัง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
