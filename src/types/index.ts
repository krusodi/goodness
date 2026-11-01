export type RecordType = 'student' | 'merit' | 'demerit' | 'user';
export type UserRole = 'admin' | 'user';
export type BehaviorCategory = 'merit' | 'demerit';

export interface Student {
  id: string;
  student_no: number;
  student_name: string;
  student_class: string;
  created_at: number;
}

export interface BehaviorRecord {
  id: string;
  type: 'merit' | 'demerit';
  category: BehaviorCategory;
  student_id: string;
  student_no: number;
  student_name: string;
  student_class: string;
  behavior: string;
  score: number; // 1-100
  record_date: string; // YYYY-MM-DD
  record_time: string; // HH:MM
  recorded_by: string; // Teacher or Admin name
  created_at: number;
}

export interface UserAccount {
  id: string;
  type: 'user';
  username: string;
  password: string;
  role: UserRole;
  name: string;
  created_at: number;
  is_default_admin?: boolean;
}

export interface AppSettings {
  system_name: string;
  school_name: string;
  academic_year: string;
  academic_years?: string[];
  academic_term: string;
  bg_color: string;
  surface_color: string;
  text_color: string;
  primary_color: string;
  secondary_color: string;
  font_size: number;
  top3_bg_type?: 'preset' | 'gradient' | 'solid';
  top3_bg_preset?: string;
  top3_bg_color?: string;
  top3_bg_color_end?: string;
  signatory1_title?: string;
  signatory1_name?: string;
  signatory2_title?: string;
  signatory2_name?: string;
  signatory3_title?: string;
  signatory3_name?: string;
}

export interface Top3ColorPreset {
  id: string;
  name: string;
  fromColor: string;
  toColor: string;
  glowColor: string;
  badgeClass: string;
}

export const TOP3_COLOR_PRESETS: Top3ColorPreset[] = [
  {
    id: 'emerald',
    name: 'เขียวมรกต (ค่าเริ่มต้น)',
    fromColor: '#064e3b', // emerald-900
    toColor: '#022c22', // emerald-950
    glowColor: 'rgba(16, 185, 129, 0.15)',
    badgeClass: 'bg-emerald-800/60 text-emerald-200 border-emerald-700/50'
  },
  {
    id: 'indigo',
    name: 'น้ำเงินครามสง่างาม (Royal Indigo)',
    fromColor: '#1e1b4b', // indigo-950
    toColor: '#0f172a', // slate-900
    glowColor: 'rgba(99, 102, 241, 0.2)',
    badgeClass: 'bg-indigo-800/60 text-indigo-200 border-indigo-700/50'
  },
  {
    id: 'ocean',
    name: 'น้ำเงินมหาสมุทร (Ocean Blue)',
    fromColor: '#0c4a6e', // sky-900
    toColor: '#172554', // blue-950
    glowColor: 'rgba(14, 165, 233, 0.2)',
    badgeClass: 'bg-sky-800/60 text-sky-200 border-sky-700/50'
  },
  {
    id: 'purple',
    name: 'ม่วงราชาพรีเมียม (Royal Purple)',
    fromColor: '#3b0764', // purple-950
    toColor: '#1e1b4b', // indigo-950
    glowColor: 'rgba(168, 85, 247, 0.2)',
    badgeClass: 'bg-purple-800/60 text-purple-200 border-purple-700/50'
  },
  {
    id: 'rose',
    name: 'แดงทับทิมหรูหรา (Ruby Crimson)',
    fromColor: '#4c0519', // rose-950
    toColor: '#1c1917', // stone-900
    glowColor: 'rgba(244, 63, 94, 0.2)',
    badgeClass: 'bg-rose-800/60 text-rose-200 border-rose-700/50'
  },
  {
    id: 'amber',
    name: 'ทองอำพันประกาย (Golden Amber)',
    fromColor: '#451a03', // amber-950
    toColor: '#1c1917', // stone-900
    glowColor: 'rgba(245, 158, 11, 0.2)',
    badgeClass: 'bg-amber-800/60 text-amber-200 border-amber-700/50'
  },
  {
    id: 'dark',
    name: 'ดำคาร์บอนโมเดิร์น (Midnight Black)',
    fromColor: '#0f172a', // slate-900
    toColor: '#000000', // black
    glowColor: 'rgba(255, 255, 255, 0.1)',
    badgeClass: 'bg-slate-800/80 text-slate-200 border-slate-700/50'
  },
  {
    id: 'teal',
    name: 'เขียวน้ำทะเลลึก (Deep Teal)',
    fromColor: '#134e4a', // teal-900
    toColor: '#022c22', // emerald-950
    glowColor: 'rgba(20, 184, 166, 0.2)',
    badgeClass: 'bg-teal-800/60 text-teal-200 border-teal-700/50'
  },
  {
    id: 'sunset',
    name: 'อาทิตย์อัสดง (Sunset Twilight)',
    fromColor: '#581c87', // purple-900
    toColor: '#831843', // pink-900
    glowColor: 'rgba(236, 72, 153, 0.2)',
    badgeClass: 'bg-pink-800/60 text-pink-200 border-pink-700/50'
  }
];

export interface StudentScoreSummary {
  student: Student;
  merit_score: number;
  demerit_score: number;
  net_score: number;
  merit_count: number;
  demerit_count: number;
  rank: number;
}

// 21 Preset Merit Behaviors
export const PRESET_MERIT_BEHAVIORS: string[] = [
  'มาเรียนตรงเวลา',
  'แต่งกายเรียบร้อย',
  'ช่วยเหลือเพื่อน',
  'ตั้งใจเรียน',
  'ทำการบ้านครบ',
  'รักษาความสะอาด',
  'มีมารยาทดี',
  'เข้าแถวเคารพธงชาติ',
  'ร่วมกิจกรรม',
  'มีน้ำใจ',
  'ซื่อสัตย์สุจริต',
  'รับผิดชอบหน้าที่',
  'เก็บของหายได้คืน',
  'ดูแลทรัพย์สินโรงเรียน',
  'เป็นผู้นำที่ดี',
  'อ่านหนังสือ',
  'ช่วยงานครู',
  'ประหยัดอดออม',
  'กล้าแสดงออก',
  'มีวินัย',
  'เคารพกติกา'
];

// 21 Preset Demerit Behaviors
export const PRESET_DEMERIT_BEHAVIORS: string[] = [
  'มาเรียนสาย',
  'ไม่ส่งการบ้าน',
  'แต่งกายไม่เรียบร้อย',
  'คุยในห้องเรียน',
  'ไม่ตั้งใจเรียน',
  'ทะเลาะกับเพื่อน',
  'พูดจาไม่สุภาพ',
  'ไม่เข้าแถว',
  'ขาดเรียน',
  'ทิ้งขยะไม่เป็นที่',
  'ใช้โทรศัพท์ในห้องเรียน',
  'ไม่รับผิดชอบหน้าที่',
  'ทำลายทรัพย์สินโรงเรียน',
  'รังแกเพื่อน',
  'โกหก',
  'ลอกการบ้าน',
  'หนีเรียน',
  'เล่นรุนแรง',
  'ไม่เชื่อฟังครู',
  'กินขนมในห้องเรียน',
  'ส่งเสียงดัง'
];

export const THAI_MONTHS = [
  { value: '01', label: 'มกราคม' },
  { value: '02', label: 'กุมภาพันธ์' },
  { value: '03', label: 'มีนาคม' },
  { value: '04', label: 'เมษายน' },
  { value: '05', label: 'พฤษภาคม' },
  { value: '06', label: 'มิถุนายน' },
  { value: '07', label: 'กรกฎาคม' },
  { value: '08', label: 'สิงหาคม' },
  { value: '09', label: 'กันยายน' },
  { value: '10', label: 'ตุลาคม' },
  { value: '11', label: 'พฤศจิกายน' },
  { value: '12', label: 'ธันวาคม' }
];
