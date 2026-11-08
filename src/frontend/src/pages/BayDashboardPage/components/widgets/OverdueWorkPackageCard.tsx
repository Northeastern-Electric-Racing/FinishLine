/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Stack, Typography } from '@mui/material';
import { CalendarMonth, Construction } from '@mui/icons-material';
import { wbsPipe } from 'shared';
import { datePipe, fullNamePipe, projectWbsPipe } from '../../../../utils/pipes';
import { daysOverdue } from '../../../../utils/datetime.utils';
import type { OverdueWorkPackageWidgetItem } from './OverdueWorkPackagesWidget';

// everything is sized in cqw so the widget scales the same on the TV and in the Admin Tools preview
export const NER_RED = '#ef4244';

export const InfoPill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6cqw',
      px: '1.2cqw',
      py: '0.4cqw',
      borderRadius: '2cqw',
      bgcolor: 'rgba(255, 255, 255, 0.15)',
      color: 'white',
      whiteSpace: 'nowrap',
      '& svg': { fontSize: '2.2cqw' }
    }}
  >
    {icon}
    <Typography sx={{ fontSize: '1.8cqw' }}>{label}</Typography>
  </Box>
);

/**
 * One overdue work package in the medium widget, shown beside the others the way the medium calendar shows its events.
 * It has no blocked by list, the rest of the large card's details are kept.
 */
const OverdueWorkPackageCard: React.FC<{ wp: OverdueWorkPackageWidgetItem }> = ({ wp }) => {
  const numDaysOverdue = daysOverdue(new Date(wp.endDate));

  return (
    <Box
      sx={{
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5cqw',
        px: '2.5cqw',
        py: '1cqw',
        borderRadius: '2.5cqw',
        bgcolor: '#000000',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: '1cqw', minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: '2cqw', lineHeight: 1.2, color: NER_RED, fontWeight: 'bold', minWidth: 0 }}>
          {projectWbsPipe(wp.wbsNum)} - {wp.projectName}
        </Typography>
        <InfoPill icon={<CalendarMonth />} label={datePipe(new Date(wp.endDate))} />
      </Stack>
      <Typography noWrap sx={{ fontSize: '2.4cqw', fontWeight: 'bold', lineHeight: 1.2 }}>
        {wbsPipe(wp.wbsNum)} - {wp.name}
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: '1cqw' }}>
        <Stack direction="row" sx={{ gap: '0.8cqw', flexWrap: 'wrap', minWidth: 0 }}>
          <InfoPill icon={<Construction />} label={fullNamePipe(wp.lead)} />
        </Stack>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8cqw',
            color: NER_RED,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            mr: '-1cqw'
          }}
        >
          <Typography sx={{ fontSize: '5.2cqw', fontWeight: 'bold', lineHeight: 1 }}>{numDaysOverdue}</Typography>
          <Stack>
            <Typography sx={{ fontSize: '2.2cqw', lineHeight: 1.1 }}>{numDaysOverdue === 1 ? 'Day' : 'Days'}</Typography>
            <Typography sx={{ fontSize: '2.2cqw', lineHeight: 1.1 }}>Overdue</Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default OverdueWorkPackageCard;
