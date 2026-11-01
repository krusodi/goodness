import { AppSettings, TOP3_COLOR_PRESETS, Top3ColorPreset } from '../types';

export interface Top3StyleConfig {
  backgroundStyle: React.CSSProperties;
  glowColor: string;
  badgeClass: string;
}

export function getTop3Style(settings: AppSettings): Top3StyleConfig {
  const bgType = settings.top3_bg_type || 'preset';

  if (bgType === 'solid') {
    const color = settings.top3_bg_color || '#064e3b';
    return {
      backgroundStyle: { backgroundColor: color },
      glowColor: 'rgba(255, 255, 255, 0.12)',
      badgeClass: 'bg-white/15 text-white border-white/20'
    };
  }

  if (bgType === 'gradient') {
    const fromColor = settings.top3_bg_color || '#064e3b';
    const toColor = settings.top3_bg_color_end || '#022c22';
    return {
      backgroundStyle: {
        background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`
      },
      glowColor: 'rgba(255, 255, 255, 0.15)',
      badgeClass: 'bg-white/15 text-white border-white/20'
    };
  }

  // Preset
  const presetId = settings.top3_bg_preset || 'emerald';
  const found = TOP3_COLOR_PRESETS.find((p) => p.id === presetId) || TOP3_COLOR_PRESETS[0];

  return {
    backgroundStyle: {
      background: `linear-gradient(135deg, ${found.fromColor} 0%, ${found.toColor} 100%)`
    },
    glowColor: found.glowColor,
    badgeClass: found.badgeClass
  };
}
