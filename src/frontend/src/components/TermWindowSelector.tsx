/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ACCENT = '#ef4345';

export interface TermOption {
  key: string;
  shortLabel: string;
}

interface TermWindowSelectorProps {
  // every available term, oldest first
  terms: TermOption[];
  // index of the first term in the window
  start: number;
  visibleCount: number;
  onChange: (start: number) => void;
}

/**
 * Row of term chips (newest first) with arrows, used to pick a window of consecutive terms.
 * Terms inside the current window are outlined; clicking a chip makes it the newest term in the window.
 */
const TermWindowSelector: React.FC<TermWindowSelectorProps> = ({ terms, start, visibleCount, onChange }) => {
  const maxStart = Math.max(0, terms.length - visibleCount);
  const selectTerm = (index: number) => onChange(Math.max(0, Math.min(index - visibleCount + 1, maxStart)));

  return (
    <Box display="flex" alignItems="center">
      <Box display="flex" alignItems="center" flexWrap="wrap">
        {[...terms].reverse().map((term) => {
          const index = terms.indexOf(term);
          const inWindow = index >= start && index < start + visibleCount;
          return (
            <Chip
              key={term.key}
              label={term.shortLabel}
              size="small"
              clickable
              onClick={() => selectTerm(index)}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                backgroundColor: 'transparent',
                border: `1px solid ${inWindow ? ACCENT : 'transparent'}`
              }}
            />
          );
        })}
      </Box>
      <IconButton
        size="small"
        sx={{ color: 'white' }}
        aria-label="older-terms"
        disabled={start === 0}
        onClick={() => onChange(Math.max(0, start - 1))}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        size="small"
        sx={{ color: 'white' }}
        aria-label="newer-terms"
        disabled={start >= maxStart}
        onClick={() => onChange(Math.min(maxStart, start + 1))}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default TermWindowSelector;
