import {
  Student,
  BehaviorRecord,
  AttendanceRecord,
  UserAccount,
  AppSettings,
  TeachingPeriodTimes,
  TeachingSchedule,
  PRESET_MERIT_BEHAVIORS,
  PRESET_DEMERIT_BEHAVIORS
} from '../types';

export const DEFAULT_TEACHING_PERIOD_TIMES: TeachingPeriodTimes = {
  p1: '08:30 - 09:30',
  p2: '09:30 - 10:30',
  p3: '10:30 - 11:30',
  lunch: '11:30 - 12:30',
  p4: '12:30 - 13:30',
  p5: '13:30 - 14:30',
  p6: '14:30 - 15:30',
  lunchLabel: 'พักกลางวัน',
  lunchPosition: 'after_3'
};

export const DEFAULT_TEACHING_SCHEDULE: TeachingSchedule = {
  title: 'ตารางคาบสอน ประจำสัปดาห์ ชั้น ป.5/1',
  periodTimes: DEFAULT_TEACHING_PERIOD_TIMES,
  cells: {
    mon_1: { subject: 'ภาษาไทย', room: 'ป.5/1', color: 'amber' },
    mon_2: { subject: 'คณิตศาสตร์', room: 'ป.5/1', color: 'sky' },
    mon_3: { subject: 'วิทยาศาสตร์ฯ', room: 'ป.5/1', color: 'emerald' },
    mon_4: { subject: 'สังคมศึกษาฯ', room: 'ป.5/1', color: 'purple' },
    mon_5: { subject: 'ภาษาอังกฤษ', room: 'ป.5/1', color: 'rose' },
    mon_6: { subject: 'แนะแนว / โฮมรูม', room: 'ป.5/1', color: 'teal' },
    tue_1: { subject: 'คณิตศาสตร์', room: 'ป.5/1', color: 'sky' },
    tue_2: { subject: 'ภาษาไทย', room: 'ป.5/1', color: 'amber' },
    tue_3: { subject: 'ภาษาอังกฤษ', room: 'ป.5/1', color: 'rose' },
    tue_4: { subject: 'ประวัติศาสตร์', room: 'ป.5/1', color: 'purple' },
    tue_5: { subject: 'สุขศึกษาและพลศึกษา', room: 'สนาม', color: 'emerald' },
    tue_6: { subject: 'ศิลปะ', room: 'ป.5/1', color: 'indigo' },
    wed_1: { subject: 'วิทยาศาสตร์ฯ', room: 'ห้องวิทย์', color: 'emerald' },
    wed_2: { subject: 'คณิตศาสตร์', room: 'ป.5/1', color: 'sky' },
    wed_3: { subject: 'ภาษาไทย', room: 'ป.5/1', color: 'amber' },
    wed_4: { subject: 'วิทยาการคำนวณ', room: 'ห้องคอม', color: 'indigo' },
    wed_5: { subject: 'ลูกเสือ - เนตรนารี', room: 'สนาม', color: 'teal' },
    wed_6: { subject: 'กิจกรรมพัฒนาผู้เรียน', room: 'ป.5/1', color: 'slate' },
    thu_1: { subject: 'ภาษาอังกฤษ', room: 'ป.5/1', color: 'rose' },
    thu_2: { subject: 'ภาษาไทย', room: 'ป.5/1', color: 'amber' },
    thu_3: { subject: 'คณิตศาสตร์', room: 'ป.5/1', color: 'sky' },
    thu_4: { subject: 'การงานอาชีพ', room: 'ป.5/1', color: 'teal' },
    thu_5: { subject: 'สังคมศึกษาฯ', room: 'ป.5/1', color: 'purple' },
    thu_6: { subject: 'ชุมนุม', room: 'ป.5/1', color: 'indigo' },
    fri_1: { subject: 'คณิตศาสตร์', room: 'ป.5/1', color: 'sky' },
    fri_2: { subject: 'วิทยาศาสตร์ฯ', room: 'ป.5/1', color: 'emerald' },
    fri_3: { subject: 'ภาษาไทย', room: 'ป.5/1', color: 'amber' },
    fri_4: { subject: 'ภาษาอังกฤษ', room: 'ป.5/1', color: 'rose' },
    fri_5: { subject: 'หน้าที่พลเมือง', room: 'ป.5/1', color: 'purple' },
    fri_6: { subject: 'ซ่อมเสริม / คุณธรรม', room: 'ป.5/1', color: 'teal' }
  }
};

export const INITIAL_SETTINGS: AppSettings = {
  system_name: 'ระบบบันทึกความดีนักเรียน ป.5/1',
  system_description: 'ระบบสนับสนุนการพัฒนาคุณธรรม จริยธรรม และวินัยเชิงบวกตามหลักสูตรการศึกษาขั้นพื้นฐาน',
  school_name: 'โรงเรียนบ้านยะบะ(อุปการวิทยา)',
  academic_year: '2569',
  academic_years: ['2570', '2569', '2568', '2567'],
  academic_term: '1',
  bg_color: '#f0fdf4',
  surface_color: '#ffffff',
  text_color: '#14532d',
  primary_color: '#16a34a',
  secondary_color: '#22c55e',
  font_size: 16,
  top3_bg_type: 'preset',
  top3_bg_preset: 'emerald',
  top3_bg_color: '#064e3b',
  top3_bg_color_end: '#022c22',
  signatory1_title: 'ครูประจำชั้น ป.5/1',
  signatory1_name: '',
  signatory2_title: 'หัวหน้ากลุ่มงานกิจการนักเรียน',
  signatory2_name: '',
  signatory3_title: 'ผู้อำนวยการโรงเรียนบ้านยะบะ(อุปการวิทยา)',
  signatory3_name: '',
  merit_behaviors: [...PRESET_MERIT_BEHAVIORS],
  demerit_behaviors: [...PRESET_DEMERIT_BEHAVIORS],
  teaching_schedule: DEFAULT_TEACHING_SCHEDULE
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_admin',
    type: 'user',
    username: 'Admin',
    password: 'kruyb', // requested in prompt: Admin / kruyb
    role: 'admin',
    name: 'ผู้ดูแลระบบ (Admin)',
    created_at: Date.now() - 30 * 86400000,
    is_default_admin: true
  },
  {
    id: 'user_teacher_1',
    type: 'user',
    username: 'kru_somchai',
    password: '123',
    role: 'user',
    name: 'ครูสมชาย สว่างจิตต์ (ครูประจำชั้น ป.5/1)',
    created_at: Date.now() - 25 * 86400000
  }
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_RECORDS: BehaviorRecord[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
