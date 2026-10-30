export type Gender = 'male' | 'female' | 'other';

/**
 * Detects gender from Thai student name prefix or content
 * ด.ช. / เด็กชาย / นาย -> male
 * ด.ญ. / เด็กหญิง / นางสาว / น.ส. -> female
 */
export const getStudentGender = (name: string = ''): Gender => {
  const trimmed = name.trim();
  if (
    trimmed.startsWith('ด.ช.') ||
    trimmed.startsWith('ด.ช ') ||
    trimmed.startsWith('เด็กชาย') ||
    trimmed.startsWith('นาย')
  ) {
    return 'male';
  }
  if (
    trimmed.startsWith('ด.ญ.') ||
    trimmed.startsWith('ด.ญ ') ||
    trimmed.startsWith('เด็กหญิง') ||
    trimmed.startsWith('นางสาว') ||
    trimmed.startsWith('น.ส.') ||
    trimmed.startsWith('น.ส ')
  ) {
    return 'female';
  }
  return 'other';
};

export const getGenderStyles = (gender: Gender) => {
  if (gender === 'male') {
    return {
      label: 'ชาย',
      icon: '👦',
      textClass: 'text-sky-700',
      bgLight: 'bg-sky-50',
      borderClass: 'border-sky-200',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      chipInactive: 'bg-sky-50/60 text-sky-900 border-sky-200 hover:bg-sky-100/60',
      chipActive: 'bg-sky-600 text-white border-sky-700 shadow-xs ring-1 ring-sky-500',
      avatarClass: 'bg-sky-100 text-sky-700 border-sky-200',
      noBadgeClass: 'bg-sky-100 text-sky-800'
    };
  }
  if (gender === 'female') {
    return {
      label: 'หญิง',
      icon: '👧',
      textClass: 'text-rose-600',
      bgLight: 'bg-pink-50',
      borderClass: 'border-pink-200',
      badgeClass: 'bg-pink-50 text-rose-700 border-pink-200',
      chipInactive: 'bg-pink-50/60 text-pink-950 border-pink-200 hover:bg-pink-100/60',
      chipActive: 'bg-rose-600 text-white border-rose-700 shadow-xs ring-1 ring-rose-500',
      avatarClass: 'bg-pink-100 text-rose-700 border-pink-200',
      noBadgeClass: 'bg-pink-100 text-rose-800'
    };
  }
  return {
    label: 'ทั่วไป',
    icon: '🧑',
    textClass: 'text-slate-700',
    bgLight: 'bg-slate-50',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    chipInactive: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
    chipActive: 'bg-slate-700 text-white border-slate-800 shadow-xs',
    avatarClass: 'bg-slate-100 text-slate-700 border-slate-200',
    noBadgeClass: 'bg-slate-100 text-slate-800'
  };
};
