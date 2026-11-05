import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Student,
  BehaviorRecord,
  AttendanceRecord,
  AttendanceStatus,
  UserAccount,
  AppSettings,
  StudentScoreSummary,
  UserRole,
  PRESET_MERIT_BEHAVIORS,
  PRESET_DEMERIT_BEHAVIORS
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_RECORDS,
  INITIAL_ATTENDANCE
} from '../data/initialData';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const STORAGE_KEYS = {
  SETTINGS: 'merit_system_settings_v1',
  USERS: 'merit_system_users_v1',
  STUDENTS: 'merit_system_students_v1',
  RECORDS: 'merit_system_records_v1',
  ATTENDANCE: 'merit_system_attendance_v1',
  CURRENT_USER: 'merit_system_current_user_v1'
};

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  
  users: UserAccount[];
  currentUser: UserAccount | null;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  addUser: (data: { username: string; password: string; role: UserRole; name: string }) => { success: boolean; message?: string };
  updateUserPassword: (userId: string, newPass: string) => { success: boolean; message?: string };
  updateUserProfile: (userId: string, data: { name: string; username?: string }) => { success: boolean; message?: string };
  deleteUser: (userId: string) => { success: boolean; message?: string };
  
  students: Student[];
  addStudent: (data: { student_no: number; student_name: string; student_class: string }) => { success: boolean; message?: string };
  updateStudent: (id: string, data: { student_no: number; student_name: string; student_class: string }) => { success: boolean; message?: string };
  deleteStudent: (id: string) => { success: boolean; message?: string };
  bulkAddStudents: (list: Array<{ student_no: number; student_name: string; student_class: string }>) => { count: number };
  
  records: BehaviorRecord[];
  addMeritBatch: (studentIds: string[], behavior: string, score: number, record_date: string, record_time: string) => boolean;
  addDemeritBatch: (studentIds: string[], behavior: string, score: number, record_date: string, record_time: string) => boolean;
  updateRecord: (id: string, updates: Partial<BehaviorRecord>) => boolean;
  deleteRecord: (id: string) => boolean;
  
  // Attendance records & actions
  attendanceRecords: AttendanceRecord[];
  setStudentAttendance: (studentId: string, status: AttendanceStatus, date: string, note?: string) => Promise<boolean>;
  markAllPresent: (date: string, studentClass?: string) => Promise<number>;
  resetDayAttendance: (date: string, studentClass?: string) => Promise<number>;
  deleteDayAttendance: (date: string, studentClass?: string, customToastMsg?: string) => Promise<number>;

  // Data management
  clearMerits: () => void;
  clearDemerits: () => void;
  clearAttendance: () => void;
  clearAllData: () => void;
  resetToDemo: () => void;
  exportJSON: () => void;
  importJSON: (jsonStr: string) => { success: boolean; message: string };
  
  // Summaries & calculations
  getSummaries: (monthFilter?: string, yearFilter?: string) => StudentScoreSummary[];
  
  // Academic years
  academicYears: string[];
  addAcademicYear: (year: string) => { success: boolean; message?: string };
  updateAcademicYear: (oldYear: string, newYear: string) => { success: boolean; message?: string };
  deleteAcademicYear: (year: string) => { success: boolean; message?: string };
  academicYearModalOpen: boolean;
  setAcademicYearModalOpen: (open: boolean) => void;

  // Standard Behaviors Management (21 Standard Items)
  meritBehaviors: string[];
  demeritBehaviors: string[];
  addMeritBehavior: (name: string) => { success: boolean; message?: string };
  updateMeritBehavior: (oldName: string, newName: string) => { success: boolean; message?: string };
  deleteMeritBehavior: (name: string) => { success: boolean; message?: string };
  resetMeritBehaviors: () => void;
  addDemeritBehavior: (name: string) => { success: boolean; message?: string };
  updateDemeritBehavior: (oldName: string, newName: string) => { success: boolean; message?: string };
  deleteDemeritBehavior: (name: string) => { success: boolean; message?: string };
  resetDemeritBehaviors: () => void;
  behaviorModalOpen: boolean;
  setBehaviorModalOpen: (open: boolean) => void;
  behaviorModalTab: 'merit' | 'demerit';
  setBehaviorModalTab: (tab: 'merit' | 'demerit') => void;

  // Top 3 Customization Modal
  top3ColorModalOpen: boolean;
  setTop3ColorModalOpen: (open: boolean) => void;

  // Cloud & Firebase status
  isFirebaseConnected: boolean;
  firebaseProjectId: string;
  
  // Navigation / UI State
  activeTab: 'dashboard' | 'attendance' | 'students' | 'merit' | 'demerit' | 'reports' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'attendance' | 'students' | 'merit' | 'demerit' | 'reports' | 'admin') => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasAdmin = parsed.some((u: UserAccount) => u.username.toLowerCase() === 'admin');
        if (!hasAdmin) {
          return [...INITIAL_USERS, ...parsed];
        }
        return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // Behavior Records
  const [records, setRecords] = useState<BehaviorRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  // Firebase connection state
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const firebaseProjectId = firebaseConfig.projectId || 'goodness-8a88d';
  const hasSeededRef = useRef<boolean>(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'students' | 'merit' | 'demerit' | 'reports' | 'admin'>('dashboard');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [academicYearModalOpen, setAcademicYearModalOpen] = useState(false);
  const [top3ColorModalOpen, setTop3ColorModalOpen] = useState(false);
  const [behaviorModalOpen, setBehaviorModalOpen] = useState(false);
  const [behaviorModalTab, setBehaviorModalTab] = useState<'merit' | 'demerit'>('merit');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  // 1. Initial Connection Test & Firestore Listeners
  useEffect(() => {
    let unsubscribeStudents: (() => void) | null = null;
    let unsubscribeRecords: (() => void) | null = null;
    let unsubscribeAttendance: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;
    let unsubscribeUsers: (() => void) | null = null;

    const setupFirestore = async () => {
      const ok = await testConnection();
      setIsFirebaseConnected(ok);

      // Listen to Students collection (Real-time sync)
      const studentsPath = 'students';
      unsubscribeStudents = onSnapshot(
        collection(db, studentsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Student[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as Student);
            });
            list.sort((a, b) => a.student_no - b.student_no);
            setStudents(list);
            try {
              localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
            } catch (e) {
              console.warn(e);
            }
          } else {
            // If cloud snapshot is empty, check local cache first before assuming empty
            try {
              const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
              if (saved) {
                const parsed: Student[] = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setStudents(parsed);
                  // Safely upload local students to Firestore so cloud has the data
                  const batch = writeBatch(db);
                  parsed.forEach((st) => batch.set(doc(db, 'students', st.id), st));
                  batch.commit().catch((err) => console.warn('Sync local students to cloud note:', err));
                  return;
                }
              }
            } catch {
              // ignore
            }
            setStudents([]);
          }
        },
        (error) => {
          console.warn('Firestore students listener warning:', error);
        }
      );

      // Listen to Records collection (Real-time sync)
      const recordsPath = 'records';
      unsubscribeRecords = onSnapshot(
        collection(db, recordsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: BehaviorRecord[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as BehaviorRecord);
            });
            list.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
            setRecords(list);
            try {
              localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(list));
            } catch (e) {
              console.warn(e);
            }
          } else {
            // If cloud snapshot is empty, check local cache first before assuming empty
            try {
              const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
              if (saved) {
                const parsed: BehaviorRecord[] = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setRecords(parsed);
                  // Safely upload local records to Firestore so cloud has the data
                  const batch = writeBatch(db);
                  parsed.forEach((rec) => batch.set(doc(db, 'records', rec.id), rec));
                  batch.commit().catch((err) => console.warn('Sync local records to cloud note:', err));
                  return;
                }
              }
            } catch {
              // ignore
            }
            setRecords([]);
          }
        },
        (error) => {
          console.warn('Firestore records listener warning:', error);
        }
      );

      // Listen to Settings document
      const settingsPath = 'settings/global';
      unsubscribeSettings = onSnapshot(
        doc(db, 'settings', 'global'),
        (snapshot) => {
          if (snapshot.exists()) {
            setSettings((prev) => ({ ...prev, ...(snapshot.data() as AppSettings) }));
          }
        },
        (error) => {
          console.warn('Firestore settings listener warning:', error);
        }
      );

      // Listen to Users collection
      const usersPath = 'users';
      unsubscribeUsers = onSnapshot(
        collection(db, usersPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: UserAccount[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as UserAccount);
            });
            // Ensure hardcoded Admin always exists
            const hasAdmin = list.some((u) => u.username.toLowerCase() === 'admin');
            if (!hasAdmin) {
              setUsers([...INITIAL_USERS, ...list]);
            } else {
              setUsers(list);
            }
          }
        },
        (error) => {
          console.warn('Firestore users listener warning:', error);
        }
      );

      // Listen to Attendance collection (Real-time sync)
      const attendancePath = 'attendance';
      unsubscribeAttendance = onSnapshot(
        collection(db, attendancePath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AttendanceRecord[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as AttendanceRecord);
            });
            setAttendanceRecords(list);
            try {
              localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(list));
            } catch (e) {
              console.warn(e);
            }
          } else {
            try {
              const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
              if (saved) {
                const parsed: AttendanceRecord[] = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setAttendanceRecords(parsed);
                  const batch = writeBatch(db);
                  parsed.forEach((att) => batch.set(doc(db, 'attendance', att.id), att));
                  batch.commit().catch((err) => console.warn('Sync local attendance note:', err));
                  return;
                }
              }
            } catch {
              // ignore
            }
            setAttendanceRecords([]);
          }
        },
        (error) => {
          console.warn('Firestore attendance listener warning:', error);
        }
      );
    };

    setupFirestore().catch((err) => {
      console.warn('Firestore setup note:', err);
    });

    return () => {
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeRecords) unsubscribeRecords();
      if (unsubscribeAttendance) unsubscribeAttendance();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Sync state to localStorage for offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      document.documentElement.style.setProperty('--app-bg', settings.bg_color);
      document.documentElement.style.setProperty('--app-surface', settings.surface_color);
      document.documentElement.style.setProperty('--app-text', settings.text_color);
      document.documentElement.style.setProperty('--app-primary', settings.primary_color);
      document.documentElement.style.setProperty('--app-secondary', settings.secondary_color);
      document.documentElement.style.setProperty('--app-font-size', `${settings.font_size}px`);
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error(e);
    }
  }, [attendanceRecords]);

  // Auth operations
  const login = (username: string, password: string) => {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // Check against users
    const matched = users.find(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.password === trimmedPass
    );

    if (matched) {
      setCurrentUser(matched);
      showToast(`ยินดีต้อนรับ ${matched.name}`, 'success');
      setLoginModalOpen(false);
      return { success: true };
    }

    // Direct fallback for hardcoded default Admin: Admin / kruyb
    if (trimmedUser.toLowerCase() === 'admin' && trimmedPass === 'kruyb') {
      const adminAcc: UserAccount = {
        id: 'user_admin',
        type: 'user',
        username: 'Admin',
        password: 'kruyb',
        role: 'admin',
        name: 'ผู้ดูแลระบบ (Admin)',
        created_at: Date.now(),
        is_default_admin: true
      };
      setCurrentUser(adminAcc);
      showToast('ยินดีต้อนรับ ผู้ดูแลระบบ (Admin)', 'success');
      setLoginModalOpen(false);
      return { success: true };
    }

    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Admin ค่าเริ่มต้น: Admin / kruyb)' };
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  const addUser = ({ username, password, role, name }: { username: string; password: string; role: UserRole; name: string }) => {
    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      return { success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      return { success: false, message: 'ชื่อผู้ใช้นี้มีในระบบแล้ว' };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      type: 'user',
      username: cleanUser,
      password: password.trim(),
      role,
      name: name.trim() || cleanUser,
      created_at: Date.now()
    };

    setUsers((prev) => [...prev, newUser]);
    // Save to Firestore
    setDoc(doc(db, 'users', newUser.id), newUser).catch((err) => {
      console.warn('Firestore write user note:', err);
    });

    showToast(`เพิ่มผู้ใช้ "${newUser.name}" เรียบร้อยแล้ว`, 'success');
    return { success: true };
  };

  const updateUserPassword = (userId: string, newPass: string) => {
    if (!newPass.trim()) {
      return { success: false, message: 'รหัสผ่านต้องไม่ว่างเปล่า' };
    }
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'ไม่พบผู้ใช้ในระบบ' };
    }

    const updatedUser: UserAccount = { ...target, password: newPass.trim() };

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    // Update in Firestore
    setDoc(doc(db, 'users', userId), updatedUser, { merge: true }).catch((err) => {
      console.warn('Firestore update password note:', err);
    });

    showToast(`เปลี่ยนรหัสผ่านของ "${target.name}" สำเร็จ`, 'success');
    return { success: true };
  };

  const updateUserProfile = (userId: string, data: { name: string; username?: string }) => {
    const cleanName = data.name.trim();
    if (!cleanName) {
      return { success: false, message: 'กรุณากรอกชื่อ - นามสกุล' };
    }
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'ไม่พบผู้ใช้ในระบบ' };
    }

    let updatedUsername = target.username;
    if (data.username && data.username.trim()) {
      const cleanUser = data.username.trim();
      if (cleanUser.toLowerCase() !== target.username.toLowerCase()) {
        if (users.some((u) => u.id !== userId && u.username.toLowerCase() === cleanUser.toLowerCase())) {
          return { success: false, message: 'ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาเลือกชื่ออื่น' };
        }
      }
      updatedUsername = cleanUser;
    }

    const updatedUser: UserAccount = {
      ...target,
      name: cleanName,
      username: updatedUsername
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    // Save to Firestore
    setDoc(doc(db, 'users', userId), updatedUser, { merge: true }).catch((err) => {
      console.warn('Firestore update user profile note:', err);
    });

    showToast(`แก้ไขข้อมูลของ "${cleanName}" เรียบร้อยแล้ว`, 'success');
    return { success: true };
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'ไม่พบผู้ใช้' };
    if (currentUser && currentUser.id === userId) {
      return { success: false, message: 'ไม่สามารถลบบัญชีที่กำลังเข้าสู่ระบบอยู่ได้' };
    }
    const adminCount = users.filter((u) => u.role === 'admin').length;
    if (target.role === 'admin' && adminCount <= 1) {
      return { success: false, message: 'ไม่สามารถลบได้ เนื่องจากต้องมีผู้ดูแลระบบ (Admin) อย่างน้อย 1 บัญชี' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // Delete in Firestore
    deleteDoc(doc(db, 'users', userId)).catch((err) => {
      console.warn('Firestore delete user note:', err);
    });

    showToast(`ลบผู้ใช้ "${target.name}" เรียบร้อย`, 'success');
    return { success: true };
  };

  // Student management
  const addStudent = (data: { student_no: number; student_name: string; student_class: string }) => {
    if (!data.student_name.trim()) {
      return { success: false, message: 'กรุณากรอกชื่อ-สกุลนักเรียน' };
    }
    const newStudent: Student = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_no: Number(data.student_no) || students.length + 1,
      student_name: data.student_name.trim(),
      student_class: data.student_class.trim() || 'ป.5/1',
      created_at: Date.now()
    };

    const updated = [...students, newStudent].sort((a, b) => a.student_no - b.student_no);
    setStudents(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Write to Firestore
    setDoc(doc(db, 'students', newStudent.id), newStudent).catch((err) => {
      console.warn('Firestore save student note:', err);
    });

    showToast(`เพิ่มนักเรียน "${newStudent.student_name}" สำเร็จ`, 'success');
    return { success: true };
  };

  const updateStudent = (id: string, data: { student_no: number; student_name: string; student_class: string }) => {
    const updatedStudent = {
      student_no: Number(data.student_no) || 1,
      student_name: data.student_name.trim(),
      student_class: data.student_class.trim()
    };

    const updated = students
      .map((s) => (s.id === id ? { ...s, ...updatedStudent } : s))
      .sort((a, b) => a.student_no - b.student_no);
    setStudents(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Update in Firestore
    updateDoc(doc(db, 'students', id), updatedStudent).catch((err) => {
      console.warn('Firestore update student note:', err);
    });

    // Also update student names across existing records
    setRecords((prev) => {
      const updatedRecs = prev.map((r) =>
        r.student_id === id
          ? {
              ...r,
              student_no: updatedStudent.student_no,
              student_name: updatedStudent.student_name,
              student_class: updatedStudent.student_class
            }
          : r
      );
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updatedRecs));
      } catch (e) {
        console.warn(e);
      }
      return updatedRecs;
    });

    // Also update student info in attendance records
    setAttendanceRecords((prev) => {
      const updatedAtt = prev.map((a) =>
        a.student_id === id
          ? {
              ...a,
              student_no: updatedStudent.student_no,
              student_name: updatedStudent.student_name,
              student_class: updatedStudent.student_class
            }
          : a
      );
      try {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedAtt));
      } catch (e) {
        console.warn(e);
      }
      return updatedAtt;
    });

    showToast('แก้ไขข้อมูลนักเรียนเรียบร้อย', 'success');
    return { success: true };
  };

  const deleteStudent = (id: string) => {
    const st = students.find((s) => s.id === id);
    const updated = students.filter((s) => s.id !== id);
    const updatedRecs = records.filter((r) => r.student_id !== id);
    const updatedAtt = attendanceRecords.filter((a) => a.student_id !== id);
    setStudents(updated);
    setRecords(updatedRecs);
    setAttendanceRecords(updatedAtt);
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updatedRecs));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedAtt));
    } catch (e) {
      console.warn(e);
    }

    // Delete in Firestore
    deleteDoc(doc(db, 'students', id)).catch((err) => {
      console.warn('Firestore delete student note:', err);
    });

    showToast(`ลบนักเรียน "${st?.student_name || ''}" เรียบร้อยแล้ว`, 'info');
    return { success: true };
  };

  const bulkAddStudents = (list: Array<{ student_no: number; student_name: string; student_class: string }>) => {
    const valid = list.filter((item) => item.student_name.trim().length > 0);
    if (valid.length === 0) return { count: 0 };

    const newItems: Student[] = valid.map((item, index) => ({
      id: `std_${Date.now()}_${index}`,
      student_no: Number(item.student_no) || index + 1,
      student_name: item.student_name.trim(),
      student_class: item.student_class.trim() || 'ป.5/1',
      created_at: Date.now()
    }));

    const updated = [...students, ...newItems].sort((a, b) => a.student_no - b.student_no);
    setStudents(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Batch write to Firestore
    try {
      const batch = writeBatch(db);
      newItems.forEach((st) => {
        batch.set(doc(db, 'students', st.id), st);
      });
      batch.commit().catch((err) => {
        console.warn('Firestore batch add note:', err);
      });
    } catch (e) {
      console.warn('Bulk write error:', e);
    }

    showToast(`นำเข้านักเรียนทั้งหมด ${newItems.length} คน เรียบร้อยแล้ว`, 'success');
    return { count: newItems.length };
  };

  // Behavior batch recording
  const addMeritBatch = (
    studentIds: string[],
    behavior: string,
    score: number,
    record_date: string,
    record_time: string
  ) => {
    if (!studentIds.length || !behavior.trim()) return false;
    const recordedBy = currentUser ? currentUser.name : 'ผู้บันทึก';

    const newRecords: BehaviorRecord[] = studentIds.map((sid) => {
      const student = students.find((s) => s.id === sid);
      return {
        id: `rec_m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'merit',
        category: 'merit',
        student_id: sid,
        student_no: student ? student.student_no : 0,
        student_name: student ? student.student_name : 'ไม่ระบุ',
        student_class: student ? student.student_class : 'ป.5/1',
        behavior: behavior.trim(),
        score: Math.max(1, Math.min(100, Number(score) || 5)),
        record_date,
        record_time,
        recorded_by: recordedBy,
        created_at: Date.now()
      };
    });

    const updated = [...newRecords, ...records];
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Batch write to Firestore
    try {
      const batch = writeBatch(db);
      newRecords.forEach((rec) => {
        batch.set(doc(db, 'records', rec.id), rec);
      });
      batch.commit().catch((err) => {
        console.warn('Firestore batch merit note:', err);
      });
    } catch (e) {
      console.warn('Batch merit error:', e);
    }

    showToast(`บันทึกความดีให้นักเรียน ${newRecords.length} คน เรียบร้อย ⭐ (+${score} คะแนน)`, 'success');
    return true;
  };

  const addDemeritBatch = (
    studentIds: string[],
    behavior: string,
    score: number,
    record_date: string,
    record_time: string
  ) => {
    if (!studentIds.length || !behavior.trim()) return false;
    const recordedBy = currentUser ? currentUser.name : 'ผู้บันทึก';

    const newRecords: BehaviorRecord[] = studentIds.map((sid) => {
      const student = students.find((s) => s.id === sid);
      return {
        id: `rec_d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'demerit',
        category: 'demerit',
        student_id: sid,
        student_no: student ? student.student_no : 0,
        student_name: student ? student.student_name : 'ไม่ระบุ',
        student_class: student ? student.student_class : 'ป.5/1',
        behavior: behavior.trim(),
        score: Math.max(1, Math.min(100, Number(score) || 5)),
        record_date,
        record_time,
        recorded_by: recordedBy,
        created_at: Date.now()
      };
    });

    const updated = [...newRecords, ...records];
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Batch write to Firestore
    try {
      const batch = writeBatch(db);
      newRecords.forEach((rec) => {
        batch.set(doc(db, 'records', rec.id), rec);
      });
      batch.commit().catch((err) => {
        console.warn('Firestore batch demerit note:', err);
      });
    } catch (e) {
      console.warn('Batch demerit error:', e);
    }

    showToast(`บันทึกการหักคะแนนนักเรียน ${newRecords.length} คน เรียบร้อย ⚠️ (-${score} คะแนน)`, 'info');
    return true;
  };

  const updateRecord = (id: string, updates: Partial<BehaviorRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );

    // Update in Firestore
    updateDoc(doc(db, 'records', id), updates).catch((err) => {
      console.warn('Firestore update record note:', err);
    });

    showToast('แก้ไขข้อมูลบันทึกสำเร็จ', 'success');
    return true;
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));

    // Delete in Firestore
    deleteDoc(doc(db, 'records', id)).catch((err) => {
      console.warn('Firestore delete record note:', err);
    });

    showToast('ลบรายการบันทึกเรียบร้อย', 'info');
    return true;
  };

  // Attendance operations
  const setStudentAttendance = async (
    studentId: string,
    status: AttendanceStatus,
    date: string,
    note?: string
  ): Promise<boolean> => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return false;
    const recordId = `${date}_${student.id}`;
    const recordedBy = currentUser ? currentUser.name : 'ครูประจำชั้น';
    const now = Date.now();

    const existing = attendanceRecords.find((r) => r.id === recordId);
    const updatedRecord: AttendanceRecord = {
      id: recordId,
      date,
      student_id: student.id,
      student_no: student.student_no,
      student_name: student.student_name,
      student_class: student.student_class,
      status,
      note: note !== undefined ? note : (existing?.note || ''),
      recorded_by: recordedBy,
      created_at: existing?.created_at || now,
      updated_at: now
    };

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === recordId);
      let next: AttendanceRecord[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updatedRecord;
      } else {
        next = [...prev, updatedRecord];
      }
      try {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    try {
      await setDoc(doc(db, 'attendance', recordId), updatedRecord);
    } catch (err) {
      console.warn('Firestore setStudentAttendance error:', err);
    }
    return true;
  };

  const markAllPresent = async (date: string, studentClass?: string): Promise<number> => {
    const targetStudents = studentClass && studentClass !== 'all'
      ? students.filter((s) => s.student_class === studentClass)
      : students;

    if (targetStudents.length === 0) {
      showToast('ไม่พบรายชื่อนักเรียนในห้องที่เลือก', 'info');
      return 0;
    }

    const recordedBy = currentUser ? currentUser.name : 'ครูประจำชั้น';
    const now = Date.now();
    const newRecords: AttendanceRecord[] = [];

    targetStudents.forEach((st) => {
      const recordId = `${date}_${st.id}`;
      const existing = attendanceRecords.find((r) => r.id === recordId);
      newRecords.push({
        id: recordId,
        date,
        student_id: st.id,
        student_no: st.student_no,
        student_name: st.student_name,
        student_class: st.student_class,
        status: 'present',
        note: existing?.note || '',
        recorded_by: recordedBy,
        created_at: existing?.created_at || now,
        updated_at: now
      });
    });

    const newIds = new Set(newRecords.map((r) => r.id));
    setAttendanceRecords((prev) => {
      const remaining = prev.filter((r) => !newIds.has(r.id));
      const next = [...remaining, ...newRecords];
      try {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    try {
      const batch = writeBatch(db);
      newRecords.forEach((rec) => {
        batch.set(doc(db, 'attendance', rec.id), rec);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore markAllPresent error:', err);
    }

    showToast(`บันทึก "มาเรียนทั้งหมด" (${newRecords.length} คน) เรียบร้อย ✅`, 'success');
    return newRecords.length;
  };

  const resetDayAttendance = async (date: string, studentClass?: string): Promise<number> => {
    return deleteDayAttendance(date, studentClass, 'รีเซ็ตสถานะเช็คชื่อวันที่เลือกเรียบร้อยแล้ว');
  };

  const deleteDayAttendance = async (
    date: string,
    studentClass?: string,
    customToastMsg?: string
  ): Promise<number> => {
    const targetStudents = studentClass && studentClass !== 'all'
      ? students.filter((s) => s.student_class === studentClass)
      : students;
    const targetStudentIdSet = new Set(targetStudents.map((s) => s.id));

    const toDelete = attendanceRecords.filter((rec) => {
      if (rec.date !== date) return false;
      if (studentClass && studentClass !== 'all') {
        return targetStudentIdSet.has(rec.student_id) || rec.student_class === studentClass;
      }
      return true;
    });

    if (toDelete.length === 0) {
      showToast('ยังไม่มีข้อมูลการเช็คชื่อในวันที่เลือก', 'info');
      return 0;
    }

    const toDeleteIds = new Set(toDelete.map((r) => r.id));
    setAttendanceRecords((prev) => {
      const remaining = prev.filter((r) => !toDeleteIds.has(r.id));
      try {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(remaining));
      } catch (e) {
        console.warn(e);
      }
      return remaining;
    });

    try {
      const batch = writeBatch(db);
      toDelete.forEach((rec) => {
        batch.delete(doc(db, 'attendance', rec.id));
      });
      await batch.commit();
    } catch (err) {
      console.warn('Firestore deleteDayAttendance error:', err);
    }

    showToast(
      customToastMsg || `ลบข้อมูลการเช็คชื่อวันที่ ${date} (${toDelete.length} คน) เรียบร้อยแล้ว`,
      'info'
    );
    return toDelete.length;
  };

  // Data management
  const clearMerits = () => {
    const toKeep = records.filter((r) => r.category !== 'merit');
    const toDelete = records.filter((r) => r.category === 'merit');
    setRecords(toKeep);

    try {
      const batch = writeBatch(db);
      toDelete.forEach((r) => {
        batch.delete(doc(db, 'records', r.id));
      });
      batch.commit().catch(() => {});
    } catch (e) {
      console.warn(e);
    }

    showToast('ล้างบันทึกความดีทั้งหมดเรียบร้อยแล้ว', 'info');
  };

  const clearDemerits = () => {
    const toKeep = records.filter((r) => r.category !== 'demerit');
    const toDelete = records.filter((r) => r.category === 'demerit');
    setRecords(toKeep);

    try {
      const batch = writeBatch(db);
      toDelete.forEach((r) => {
        batch.delete(doc(db, 'records', r.id));
      });
      batch.commit().catch(() => {});
    } catch (e) {
      console.warn(e);
    }

    showToast('ล้างบันทึกหักคะแนนทั้งหมดเรียบร้อยแล้ว', 'info');
  };

  const clearAttendance = async () => {
    setAttendanceRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      const attSnap = await getDocs(collection(db, 'attendance'));
      if (!attSnap.empty) {
        const batch = writeBatch(db);
        attSnap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn(e);
    }
    showToast('ล้างข้อมูลการเช็คชื่อทั้งหมดเรียบร้อยแล้ว', 'info');
  };

  const clearAllData = async () => {
    setRecords([]);
    setStudents([]);
    setAttendanceRecords([]);

    try {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.RECORDS);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    } catch {
      // ignore
    }

    try {
      const stdSnap = await getDocs(collection(db, 'students'));
      const recSnap = await getDocs(collection(db, 'records'));
      const attSnap = await getDocs(collection(db, 'attendance'));
      if (!stdSnap.empty || !recSnap.empty || !attSnap.empty) {
        const batch = writeBatch(db);
        stdSnap.forEach((s) => batch.delete(s.ref));
        recSnap.forEach((r) => batch.delete(r.ref));
        attSnap.forEach((a) => batch.delete(a.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn('Clear all error:', e);
    }

    showToast('ล้างข้อมูลนักเรียน บันทึกคะแนน และข้อมูลเช็คชื่อทั้งหมดแล้ว', 'error');
  };

  const resetToDemo = () => {
    setStudents([]);
    setRecords([]);
    setAttendanceRecords([]);
    setUsers(INITIAL_USERS);
    setSettings(INITIAL_SETTINGS);

    try {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.RECORDS);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    } catch {
      // ignore
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'settings', 'global'), INITIAL_SETTINGS);
      batch.commit().catch(() => {});
    } catch (e) {
      console.warn(e);
    }

    showToast('รีเซ็ตระบบเป็นค่าเริ่มต้น (ไม่มีข้อมูลตัวอย่าง) เรียบร้อยแล้ว', 'success');
  };

  const exportJSON = () => {
    const backupData = {
      version: '1.1',
      exported_at: new Date().toISOString(),
      school_name: settings.school_name,
      settings,
      users: users.map((u) => ({ ...u, password: '***' })), // mask passwords in export
      students,
      records,
      attendance: attendanceRecords
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ban_yaba_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('สำรองข้อมูล JSON เรียบร้อยแล้ว', 'success');
  };

  const importJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.students && !parsed.records && !parsed.attendance) {
        return { success: false, message: 'รูปแบบไฟล์ JSON ไม่ถูกต้อง ไม่พบข้อมูลนักเรียน บันทึก หรือการเช็คชื่อ' };
      }

      if (Array.isArray(parsed.students)) {
        setStudents(parsed.students);
        try {
          const batch = writeBatch(db);
          parsed.students.forEach((st: Student) => batch.set(doc(db, 'students', st.id), st));
          batch.commit().catch(() => {});
        } catch (e) {
          console.warn(e);
        }
      }

      if (Array.isArray(parsed.records)) {
        setRecords(parsed.records);
        try {
          const batch = writeBatch(db);
          parsed.records.forEach((rec: BehaviorRecord) => batch.set(doc(db, 'records', rec.id), rec));
          batch.commit().catch(() => {});
        } catch (e) {
          console.warn(e);
        }
      }

      if (Array.isArray(parsed.attendance)) {
        setAttendanceRecords(parsed.attendance);
        try {
          const batch = writeBatch(db);
          parsed.attendance.forEach((att: AttendanceRecord) => batch.set(doc(db, 'attendance', att.id), att));
          batch.commit().catch(() => {});
        } catch (e) {
          console.warn(e);
        }
      }

      if (parsed.settings) {
        setSettings((prev) => ({ ...prev, ...parsed.settings }));
        setDoc(doc(db, 'settings', 'global'), parsed.settings).catch(() => {});
      }

      showToast('นำเข้าข้อมูลสำเร็จ', 'success');
      return { success: true, message: 'นำเข้าข้อมูลเรียบร้อยแล้ว' };
    } catch {
      return { success: false, message: 'ไฟล์ JSON มีไวยากรณ์ผิดพลาด ไม่สามารถประมวลผลได้' };
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      setDoc(doc(db, 'settings', 'global'), updated).catch(() => {});
      return updated;
    });
    showToast('บันทึกการตั้งค่าเรียบร้อยแล้ว', 'success');
  };

  const resetSettings = () => {
    setSettings(INITIAL_SETTINGS);
    setDoc(doc(db, 'settings', 'global'), INITIAL_SETTINGS).catch(() => {});
    showToast('รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นแล้ว', 'info');
  };

  // Academic year management
  const academicYears = (settings.academic_years && settings.academic_years.length > 0)
    ? settings.academic_years
    : ['2570', '2569', '2568', '2567'];

  const addAcademicYear = (year: string) => {
    const trimmed = year.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณาระบุปีการศึกษา' };
    }
    const current = settings.academic_years || ['2570', '2569', '2568', '2567'];
    if (current.includes(trimmed)) {
      return { success: false, message: `มีปีการศึกษา ${trimmed} อยู่ในระบบแล้ว` };
    }
    const updated = [trimmed, ...current].sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      return b.localeCompare(a);
    });

    updateSettings({ academic_years: updated });
    showToast(`เพิ่มปีการศึกษา ${trimmed} สำเร็จ`, 'success');
    return { success: true };
  };

  const updateAcademicYear = (oldYear: string, newYear: string) => {
    const trimmed = newYear.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณาระบุปีการศึกษาใหม่' };
    }
    const current = settings.academic_years || ['2570', '2569', '2568', '2567'];
    if (trimmed !== oldYear && current.includes(trimmed)) {
      return { success: false, message: `มีปีการศึกษา ${trimmed} อยู่ในระบบแล้ว` };
    }
    const updated = current.map((y) => (y === oldYear ? trimmed : y));
    const newSettings: Partial<AppSettings> = { academic_years: updated };
    if (settings.academic_year === oldYear) {
      newSettings.academic_year = trimmed;
    }
    updateSettings(newSettings);
    showToast(`แก้ไขปีการศึกษา ${oldYear} เป็น ${trimmed} เรียบร้อย`, 'success');
    return { success: true };
  };

  const deleteAcademicYear = (year: string) => {
    const current = settings.academic_years || ['2570', '2569', '2568', '2567'];
    if (current.length <= 1) {
      return { success: false, message: 'ไม่สามารถลบได้ เนื่องจากต้องมีปีการศึกษาอย่างน้อย 1 รายการ' };
    }
    const updated = current.filter((y) => y !== year);
    const newSettings: Partial<AppSettings> = { academic_years: updated };
    if (settings.academic_year === year) {
      newSettings.academic_year = updated[0];
    }
    updateSettings(newSettings);
    showToast(`ลบปีการศึกษา ${year} เรียบร้อย`, 'info');
    return { success: true };
  };

  // Standard behaviors (21 items) management
  const meritBehaviors = (settings.merit_behaviors && settings.merit_behaviors.length > 0)
    ? settings.merit_behaviors
    : PRESET_MERIT_BEHAVIORS;

  const demeritBehaviors = (settings.demerit_behaviors && settings.demerit_behaviors.length > 0)
    ? settings.demerit_behaviors
    : PRESET_DEMERIT_BEHAVIORS;

  const addMeritBehavior = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณาระบุชื่อพฤติกรรมความดี' };
    }
    if (meritBehaviors.includes(trimmed)) {
      return { success: false, message: 'มีรายการพฤติกรรมนี้อยู่ในรายการแล้ว' };
    }
    const updated = [...meritBehaviors, trimmed];
    updateSettings({ merit_behaviors: updated });
    showToast(`เพิ่มพฤติกรรมความดี "${trimmed}" สำเร็จ`, 'success');
    return { success: true };
  };

  const updateMeritBehavior = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณาระบุชื่อพฤติกรรมใหม่' };
    }
    if (trimmed !== oldName && meritBehaviors.includes(trimmed)) {
      return { success: false, message: 'มีรายการพฤติกรรมนี้อยู่ในรายการแล้ว' };
    }
    const updated = meritBehaviors.map((b) => (b === oldName ? trimmed : b));
    updateSettings({ merit_behaviors: updated });
    showToast(`แก้ไขพฤติกรรมความดีเรียบร้อย`, 'success');
    return { success: true };
  };

  const deleteMeritBehavior = (name: string) => {
    if (meritBehaviors.length <= 1) {
      return { success: false, message: 'ไม่สามารถลบได้ ต้องมีอย่างน้อย 1 รายการ' };
    }
    const updated = meritBehaviors.filter((b) => b !== name);
    updateSettings({ merit_behaviors: updated });
    showToast(`ลบพฤติกรรมความดี "${name}" เรียบร้อย`, 'info');
    return { success: true };
  };

  const resetMeritBehaviors = () => {
    updateSettings({ merit_behaviors: [...PRESET_MERIT_BEHAVIORS] });
    showToast('รีเซ็ตรายการพฤติกรรมความดีเป็น 21 รายการมาตรฐานแล้ว', 'info');
  };

  const addDemeritBehavior = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณาระบุชื่อพฤติกรรมที่หักคะแนน' };
    }
    if (demeritBehaviors.includes(trimmed)) {
      return { success: false, message: 'มีรายการพฤติกรรมนี้อยู่ในรายการแล้ว' };
    }
    const updated = [...demeritBehaviors, trimmed];
    updateSettings({ demerit_behaviors: updated });
    showToast(`เพิ่มพฤติกรรมหักคะแนน "${trimmed}" สำเร็จ`, 'success');
    return { success: true };
  };

  const updateDemeritBehavior = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return { success: false, message: 'กรุณาระบุชื่อพฤติกรรมใหม่' };
    }
    if (trimmed !== oldName && demeritBehaviors.includes(trimmed)) {
      return { success: false, message: 'มีรายการพฤติกรรมนี้อยู่ในรายการแล้ว' };
    }
    const updated = demeritBehaviors.map((b) => (b === oldName ? trimmed : b));
    updateSettings({ demerit_behaviors: updated });
    showToast(`แก้ไขพฤติกรรมหักคะแนนเรียบร้อย`, 'success');
    return { success: true };
  };

  const deleteDemeritBehavior = (name: string) => {
    if (demeritBehaviors.length <= 1) {
      return { success: false, message: 'ไม่สามารถลบได้ ต้องมีอย่างน้อย 1 รายการ' };
    }
    const updated = demeritBehaviors.filter((b) => b !== name);
    updateSettings({ demerit_behaviors: updated });
    showToast(`ลบพฤติกรรมหักคะแนน "${name}" เรียบร้อย`, 'info');
    return { success: true };
  };

  const resetDemeritBehaviors = () => {
    updateSettings({ demerit_behaviors: [...PRESET_DEMERIT_BEHAVIORS] });
    showToast('รีเซ็ตรายการพฤติกรรมหักคะแนนเป็น 21 รายการมาตรฐานแล้ว', 'info');
  };

  // Summaries calculation (Leaderboard calculation)
  const getSummaries = (monthFilter?: string, yearFilter?: string): StudentScoreSummary[] => {
    return students.map((student) => {
      // Filter records
      const studentRecords = records.filter((rec) => {
        if (rec.student_id !== student.id && rec.student_no !== student.student_no) {
          return false;
        }

        if (monthFilter && monthFilter !== 'all') {
          const recMonth = rec.record_date.split('-')[1];
          if (recMonth !== monthFilter) return false;
        }

        if (yearFilter && yearFilter !== 'all') {
          const recYear = rec.record_date.split('-')[0];
          const recBuddhistYear = (parseInt(recYear, 10) + 543).toString();
          if (recBuddhistYear !== yearFilter && recYear !== yearFilter) return false;
        }

        return true;
      });

      const merit_records = studentRecords.filter((r) => r.category === 'merit');
      const demerit_records = studentRecords.filter((r) => r.category === 'demerit');

      const merit_score = merit_records.reduce((sum, r) => sum + r.score, 0);
      const demerit_score = demerit_records.reduce((sum, r) => sum + r.score, 0);
      const net_score = merit_score - demerit_score;

      return {
        student,
        merit_score,
        demerit_score,
        net_score,
        merit_count: merit_records.length,
        demerit_count: demerit_records.length,
        total_records: studentRecords.length,
        rank: 1
      };
    })
    .sort((a, b) => {
      if (b.net_score !== a.net_score) {
        return b.net_score - a.net_score;
      }
      return a.student.student_no - b.student.student_no;
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        academicYears,
        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
        academicYearModalOpen,
        setAcademicYearModalOpen,
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
        behaviorModalOpen,
        setBehaviorModalOpen,
        behaviorModalTab,
        setBehaviorModalTab,
        top3ColorModalOpen,
        setTop3ColorModalOpen,
        users,
        currentUser,
        login,
        logout,
        addUser,
        updateUserPassword,
        updateUserProfile,
        deleteUser,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkAddStudents,
        records,
        addMeritBatch,
        addDemeritBatch,
        updateRecord,
        deleteRecord,
        attendanceRecords,
        setStudentAttendance,
        markAllPresent,
        resetDayAttendance,
        deleteDayAttendance,
        clearAttendance,
        clearMerits,
        clearDemerits,
        clearAllData,
        resetToDemo,
        exportJSON,
        importJSON,
        getSummaries,
        isFirebaseConnected,
        firebaseProjectId,
        activeTab,
        setActiveTab,
        loginModalOpen,
        setLoginModalOpen,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
