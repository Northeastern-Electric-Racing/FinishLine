/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { PublicBayDashboardCalendarEvent } from 'shared';
import { formatEventTimeOnDay } from '../../../../utils/bay-dashboard-calendar.utils';

interface CalendarEventCardProps {
  event: PublicBayDashboardCalendarEvent;
  day: Date;
  dense?: boolean;
}

/**
 * A single calendar event, colored with its calendar's color.
 */
const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ event, day, dense = false }) => {
  const { title, location, colorHexCode } = event;
  const time = formatEventTimeOnDay(event, day);

  const titleSize = dense ? '2.8cqw' : '3.4cqw';
  const detailSize = dense ? '1.8cqw' : '2.2cqw';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2cqw',
        minWidth: 0,
        px: '2.5cqw',
        py: dense ? '1.1cqw' : '1.5cqw',
        borderRadius: '2cqw',
        bgcolor: colorHexCode,
        color: 'white'
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ color: 'inherit', fontSize: titleSize, lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography noWrap sx={{ color: 'inherit', fontSize: detailSize }}>
          {time}
        </Typography>
        {location && (
          <Typography noWrap sx={{ color: 'inherit', fontSize: detailSize }}>
            {location}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CalendarEventCard;
