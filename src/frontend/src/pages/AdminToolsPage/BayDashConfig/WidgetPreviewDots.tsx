/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, ButtonBase } from '@mui/material';

interface WidgetPreviewDotsProps {
  widgetCount: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Dots along the bottom of a slot in the preview, one per stacked widget, with the shown widget's dot filled.
 * Nothing is shown for a slot with fewer than two widgets. Dots only shown on hover.
 */
const WidgetPreviewDots: React.FC<WidgetPreviewDotsProps> = ({ widgetCount, activeIndex, onSelect }) => {
  if (widgetCount < 2) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '1cqw',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1cqw',
        zIndex: 1,
        opacity: 0,
        transition: 'opacity 0.2s',
        '*:hover > &': { opacity: 1 }
      }}
    >
      {Array.from({ length: widgetCount }, (_, index) => (
        <ButtonBase
          key={index}
          aria-label={`Show widget ${index + 1} of ${widgetCount}`}
          aria-current={index === activeIndex}
          onClick={() => onSelect(index)}
          sx={{
            width: '1.5cqw',
            height: '1.5cqw',
            borderRadius: '50%',
            bgcolor: index === activeIndex ? 'black' : 'grey.400'
          }}
        />
      ))}
    </Box>
  );
};

export default WidgetPreviewDots;
