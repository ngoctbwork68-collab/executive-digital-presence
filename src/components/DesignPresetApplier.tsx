import { useEffect } from 'react';
import { useDesignPresetId } from '@/hooks/useDesignPreset';
import { applyDesignPreset } from '@/lib/designPresets';

/**
 * Áp dụng bộ giao diện (layout preset) được chọn trong /admin/design.
 * Màu sắc của preset do ColorThemeApplier xử lý để tránh ghi đè lẫn nhau.
 */
const DesignPresetApplier = () => {
  const { data: presetId } = useDesignPresetId();

  useEffect(() => {
    if (presetId) applyDesignPreset(presetId);
  }, [presetId]);

  return null;
};

export default DesignPresetApplier;
