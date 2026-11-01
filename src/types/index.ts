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
}

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
