import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDesignPresetId } from '@/hooks/useDesignPreset';
import { applyDesignPreset } from '@/lib/designPresets';

/**
 * Áp dụng bộ giao diện (design preset) được chọn trong /admin/design.
 * Màu sắc của preset do ColorThemeApplier xử lý để tránh ghi đè lẫn nhau.
 */
const DesignPresetApplier = () => {
  const { data: presetId } = useDesignPresetId();
  const { pathname } = useLocation();

  useEffect(() => {
    if (presetId) applyDesignPreset(presetId);
  }, [presetId]);

  useEffect(() => {
    document.body.classList.toggle('is-admin', pathname.startsWith('/admin'));
  }, [pathname]);

  return null;
};

export default DesignPresetApplier;
