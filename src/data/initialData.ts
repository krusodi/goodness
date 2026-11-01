import { Student, BehaviorRecord, UserAccount, AppSettings } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  system_name: 'ระบบบันทึกความดีนักเรียน ป.5/1',
  school_name: 'โรงเรียนบ้านยะบะ(อุปการวิทยา)',
  academic_year: '2569',
  academic_term: '1',
  bg_color: '#f0fdf4',
  surface_color: '#ffffff',
  text_color: '#14532d',
  primary_color: '#16a34a',
  secondary_color: '#22c55e',
  font_size: 16
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

