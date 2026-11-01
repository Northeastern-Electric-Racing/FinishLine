/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography, Card, useTheme } from '@mui/material';
import {
  formatColumnLabel,
  formatGroupLabel,
  GanttScale,
  getColumnWidthPx,
  getHeaderGroups,
  isCurrentColumn
} from '../../../../utils/gantt.utils';
import { useEffect, useRef } from 'react';

interface GanttChartTimelineProps {
  scale: GanttScale;
}

export function GanttChartTimeline({ scale }: GanttChartTimelineProps) {
  const theme = useTheme();
  const currentColumnRef = useRef<HTMLDivElement>();

  // re-center on today whenever the window changes
  useEffect(() => {
    if (currentColumnRef.current) {
      currentColumnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [scale.timeWindow]);

  return (
    <Box
      sx={{
        pl: 2,
        pb: 1,
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.background.default,
        zIndex: 5,
        width: 'fit-content'
      }}
    >
      <Box sx={{ display: 'flex', width: scale.widthPx }}>
        {getHeaderGroups(scale).map((group) => (
          <Box
            key={group.start.toISOString()}
            sx={{
              width: group.widthPx,
              flexShrink: 0,
              height: '2rem',
              lineHeight: '1rem',
              px: 0.5,
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              {formatGroupLabel(group.start, scale.headerGroupUnit)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', width: scale.widthPx }}>
        {scale.columns.map((column) => {
          const isCurrent = isCurrentColumn(column, scale.columnUnit);
          return (
            <Box
              key={column.toISOString()}
              ref={isCurrent ? currentColumnRef : null}
              sx={{
                width: getColumnWidthPx(column, scale.columnUnit, scale.pixelsPerDay),
                flexShrink: 0,
                px: '2px'
              }}
            >
              <Card
                sx={{
                  display: 'flex',
                  backgroundColor: isCurrent ? theme.palette.info.main : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '0.25rem',
                  height: '1.75rem',
                  overflow: 'hidden'
                }}
              >
                <Typography noWrap>{formatColumnLabel(column, scale.columnUnit)}</Typography>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
