import type { CustomColors } from './colorThemes';

export interface DesignPresetFonts {
  heading: string;
  body: string;
  googleFontsUrl: string;
}

export interface DesignPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  swatches: string[];
  /** null = giữ nguyên bảng màu đang chọn trong Cài đặt */
  colors: CustomColors | null;
  /** null = giữ nguyên bộ font đang chọn trong Cài đặt */
  fonts: DesignPresetFonts | null;
  radius: string;
  traits: string[];
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'classic',
    name: 'Hiện tại (Classic)',
    tagline: 'Giao diện gốc của website',
    description:
      'Giữ nguyên bảng màu, font và bo góc bạn đang chọn ở mục Cài đặt. Không ghi đè bất cứ điều gì.',
    swatches: ['#1e2a4a', '#d4a017', '#f6f7f9', '#ffffff'],
    colors: null,
    fonts: null,
    radius: '0.5rem',
    traits: ['Thẻ bo tròn, đổ bóng mềm', 'Tiêu đề đậm hiện đại', 'Hiệu ứng nâng nhẹ khi hover'],
  },
  {
    id: 'architect',
    name: 'Kiến trúc tối giản',
    tagline: 'Architectural Executive Minimal',
    description:
      'Nền kem ấm, chữ serif thanh mảnh cỡ lớn, đường kẻ vàng 1px, thẻ vuông góc gần như phẳng. Rất nhiều khoảng trắng.',
    swatches: ['#0f172a', '#c5a059', '#fdfcfb', '#ffffff'],
    colors: { primary: '#0f172a', secondary: '#c5a059', accent: '#c5a059', bg: '#fdfcfb' },
    fonts: {
      heading: "'Cormorant Garamond', 'Lora', Georgia, serif",
      body: "'Inter', system-ui, sans-serif",
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&subset=vietnamese&display=swap',
    },
    radius: '0rem',
    traits: ['Góc vuông, viền hairline', 'Serif nhẹ cỡ lớn', 'Bỏ đổ bóng, dùng đường kẻ'],
  },
  {
    id: 'archival',
    name: 'Niên giám xa xỉ',
    tagline: 'Archival Luxury Editorial',
    description:
      'Navy sâu và vàng đồng, tiêu đề serif nghiêng, khối tối tương phản mạnh, chữ nhỏ giãn cách rộng kiểu niên giám.',
    swatches: ['#0a192f', '#c5a059', '#fdfcfb', '#1a202c'],
    colors: { primary: '#0a192f', secondary: '#c5a059', accent: '#c5a059', bg: '#fdfcfb' },
    fonts: {
      heading: "'Cormorant Garamond', 'Lora', Georgia, serif",
      body: "'Montserrat', system-ui, sans-serif",
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600;700&subset=vietnamese&display=swap',
    },
    radius: '0.125rem',
    traits: ['Tương phản sáng/tối mạnh', 'Serif nghiêng trang trọng', 'Nhãn chữ hoa giãn rộng'],
  },
  {
    id: 'editorial',
    name: 'Tạp chí điều hành',
    tagline: 'Executive Editorial',
    description:
      'Nền giấy ngà, navy mực in và vàng đồng, tiêu đề Playfair Display, các mục ngăn nhau bằng đường kẻ ngang mảnh.',
    swatches: ['#0a1128', '#b8860b', '#fcfbf7', '#ffffff'],
    colors: { primary: '#0a1128', secondary: '#b8860b', accent: '#b8860b', bg: '#fcfbf7' },
    fonts: {
      heading: "'Playfair Display', 'Lora', Georgia, serif",
      body: "'Inter', system-ui, sans-serif",
      googleFontsUrl:
        'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&subset=vietnamese&display=swap',
    },
    radius: '0.25rem',
    traits: ['Đường kẻ ngang phân mục', 'Tiêu đề Playfair cỡ lớn', 'Ảnh grayscale, hover hiện màu'],
  },
];

export const DEFAULT_DESIGN_PRESET_ID = 'classic';

export const getDesignPresetById = (id?: string | null): DesignPreset =>
  DESIGN_PRESETS.find((p) => p.id === id) || DESIGN_PRESETS[0];

let presetFontLink: HTMLLinkElement | null = null;

const applyPresetFonts = (fonts: DesignPresetFonts) => {
  const existing =
    presetFontLink || (document.querySelector('link[data-design-preset-font]') as HTMLLinkElement | null);
  if (existing) {
    if (existing.href !== fonts.googleFontsUrl) existing.href = fonts.googleFontsUrl;
    presetFontLink = existing;
  } else {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fonts.googleFontsUrl;
    link.setAttribute('data-design-preset-font', 'true');
    document.head.appendChild(link);
    presetFontLink = link;
  }
  const root = document.documentElement;
  root.style.setProperty('--font-heading', fonts.heading);
  root.style.setProperty('--font-body', fonts.body);
};

/**
 * Gắn thuộc tính data-design-preset lên <html> (CSS trong index.css sẽ đọc)
 * và ghi đè font / bo góc nếu preset có định nghĩa.
 */
export const applyDesignPreset = (presetId: string) => {
  const preset = getDesignPresetById(presetId);
  const root = document.documentElement;
  root.setAttribute('data-design-preset', preset.id);
  root.style.setProperty('--radius', preset.radius);
  if (preset.fonts) applyPresetFonts(preset.fonts);
};
