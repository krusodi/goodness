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
      icon: '',
      textClass: 'text-sky-700 font-semibold',
      bgLight: 'bg-sky-50',
      borderClass: 'border-sky-200',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      chipInactive: 'bg-sky-50/50 text-slate-800 border-sky-200 hover:border-sky-400 hover:bg-sky-100/60 shadow-2xs',
      chipActive: 'bg-sky-600 text-white border-sky-700 shadow-xs ring-2 ring-sky-400',
      avatarClass: 'bg-sky-100 text-sky-700 border border-sky-200',
      noBadgeClass: 'bg-sky-100 text-sky-800 border border-sky-200 font-bold',
      rowClass: 'hover:bg-sky-50/40'
    };
  }
  if (gender === 'female') {
    return {
      label: 'หญิง',
      icon: '',
      textClass: 'text-rose-700 font-semibold',
      bgLight: 'bg-pink-50',
      borderClass: 'border-pink-200',
      badgeClass: 'bg-pink-50 text-rose-700 border-pink-200',
      chipInactive: 'bg-pink-50/50 text-slate-800 border-pink-200 hover:border-pink-400 hover:bg-pink-100/60 shadow-2xs',
      chipActive: 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400',
      avatarClass: 'bg-pink-100 text-rose-700 border border-pink-200',
      noBadgeClass: 'bg-pink-100 text-rose-800 border border-pink-200 font-bold',
      rowClass: 'hover:bg-pink-50/40'
    };
  }
  return {
    label: 'ทั่วไป',
    icon: '',
    textClass: 'text-slate-800 font-semibold',
    bgLight: 'bg-slate-50',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    chipInactive: 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-2xs',
    chipActive: 'bg-slate-700 text-white border-slate-800 shadow-xs',
    avatarClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    noBadgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    rowClass: 'hover:bg-slate-50'
  };
};
