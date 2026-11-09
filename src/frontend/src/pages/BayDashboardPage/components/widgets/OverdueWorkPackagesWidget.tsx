/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { CalendarMonth, CheckCircleOutlineOutlined, Construction, ErrorOutline, Work } from '@mui/icons-material';
import { BayDashboardWidgetSize, BayDashboardWidgetType, PublicBayDashboardOverdueWorkPackage, wbsPipe } from 'shared';
import NERWidget from '../../../../components/NERWidget';
import { useGetBayDashboardOverdueWorkPackages } from '../../../../hooks/bay-dashboard.hooks';
import { BayDashboardWidgetProps, bayDashboardWidgetDisplayNames } from '../../../../utils/bay-dashboard.utils';
import { datePipe, fullNamePipe, projectWbsPipe } from '../../../../utils/pipes';
import OverdueWorkPackageCard, { InfoPill, NER_RED } from './OverdueWorkPackageCard';

const MAX_CARDS = 4;
const MAX_BLOCKERS = 2;
// the medium widget shows two cards side by side, like the medium calendar's events
const MEDIUM_MAX_CARDS = 2;

const StateMessage: React.FC<{ icon: React.ReactNode; heading: string; message?: string }> = ({
  icon,
  heading,
  message
}) => (
  <Stack
    sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: '1.5cqw', color: 'white', textAlign: 'center' }}
  >
    {icon}
    <Typography sx={{ fontSize: '4.5cqw', fontWeight: 'bold' }}>{heading}</Typography>
    {message && <Typography sx={{ fontSize: '2.6cqw', opacity: 0.8 }}>{message}</Typography>}
  </Stack>
);

const BlockerLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: '1cqw', minWidth: 0 }}>
    <Box sx={{ width: '0.7cqw', height: '0.7cqw', borderRadius: '50%', bgcolor: 'white', flexShrink: 0 }} />
    <Typography noWrap sx={{ fontSize: '1.9cqw', lineHeight: 1.2, minWidth: 0 }}>
      {children}
    </Typography>
  </Box>
);

const OverdueWorkPackageItem: React.FC<{
  wp: PublicBayDashboardOverdueWorkPackage;
  maxBlockers?: number;
  compact?: boolean;
}> = ({ wp, maxBlockers = MAX_BLOCKERS, compact = false }) => {
  const numDaysOverdue = wp.daysOverdue;
  const hiddenBlockers = wp.blockedBy.length - maxBlockers;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '10cqw',
        maxHeight: '30cqw',
        display: 'flex',
        flexDirection: 'column',
        p: '2.5cqw',
        pt: '1.5cqw',
        pb: compact ? '1.5cqw' : '2.5cqw',
        borderRadius: '2.5cqw',
        bgcolor: '#000000',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: '1cqw', mb: '0.2cqw' }}>
        <Typography noWrap sx={{ fontSize: '2.1cqw', lineHeight: 1.2, color: NER_RED, fontWeight: 'bold', minWidth: 0 }}>
          {projectWbsPipe(wp.wbsNum)} - {wp.projectName}
        </Typography>
        <Stack direction="row" sx={{ gap: '0.8cqw', flexShrink: 0 }}>
          <InfoPill icon={<Construction />} label={fullNamePipe(wp.lead)} />
          <InfoPill icon={<Work />} label={fullNamePipe(wp.manager)} />
          <InfoPill icon={<CalendarMonth />} label={datePipe(wp.endDate)} />
        </Stack>
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '2cqw', flex: 1, minHeight: 0 }}>
        <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden', mt: '0.5cqw' }}>
          <Typography noWrap sx={{ fontSize: '3.2cqw', fontWeight: 'bold', lineHeight: 1.2 }}>
            {wbsPipe(wp.wbsNum)} - {wp.name}
          </Typography>
          <Typography sx={{ fontSize: '1.9cqw', lineHeight: 1.2, mt: '1cqw', mb: '1cqw', textDecoration: 'underline' }}>
            Blocked By:
          </Typography>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {wp.blockedBy.length === 0 ? (
              <BlockerLine>No Blockers</BlockerLine>
            ) : (
              wp.blockedBy.slice(0, maxBlockers).map((blocker) => (
                <BlockerLine key={wbsPipe(blocker.wbsNum)}>
                  {wbsPipe(blocker.wbsNum)} - {blocker.name}
                  {blocker === wp.blockedBy[maxBlockers - 1] && hiddenBlockers > 0 && (
                    <Box component="span" sx={{ opacity: 0.7, ml: '2cqw' }}>
                      +{hiddenBlockers} more
                    </Box>
                  )}
                </BlockerLine>
              ))
            )}
          </Box>
        </Box>

        <Stack sx={{ alignItems: 'flex-end', justifyContent: 'flex-end', flexShrink: 0, maxWidth: '45%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1cqw', color: NER_RED, whiteSpace: 'nowrap' }}>
            <Typography sx={{ fontSize: '6.5cqw', fontWeight: 'bold', lineHeight: 1 }}>{numDaysOverdue}</Typography>
            <Stack>
              <Typography sx={{ fontSize: '2.8cqw', lineHeight: 1.1 }}>{numDaysOverdue === 1 ? 'Day' : 'Days'}</Typography>
              <Typography sx={{ fontSize: '2.8cqw', lineHeight: 1.1 }}>Overdue</Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

interface OverdueWorkPackagesWidgetViewProps {
  workPackages?: PublicBayDashboardOverdueWorkPackage[];
  isLoading?: boolean;
  isError?: boolean;
  size?: BayDashboardWidgetSize;
}

/**
 * The large overdue work packages list, most overdue first.
 * Shows as many as fit and a count of the rest, since nobody can scroll the TV.
 */
export const OverdueWorkPackagesWidgetView: React.FC<OverdueWorkPackagesWidgetViewProps> = ({
  workPackages,
  isLoading,
  isError,
  size
}) => {
  if (isError) {
    return (
      <StateMessage
        icon={<ErrorOutline sx={{ fontSize: '12cqw', color: NER_RED }} />}
        heading="Couldn't load overdue work packages"
        message="Trying again soon"
      />
    );
  }

  if (isLoading || !workPackages) {
    return (
      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size="10cqw" sx={{ color: NER_RED }} />
      </Stack>
    );
  }

  if (workPackages.length === 0) {
    return (
      <StateMessage
        icon={<CheckCircleOutlineOutlined sx={{ fontSize: '16cqw', color: '#4caf50' }} />}
        heading="Great Job Team!"
        message="There are no overdue work packages"
      />
    );
  }

  if (size === BayDashboardWidgetSize.MEDIUM) {
    const shown = workPackages.slice(0, MEDIUM_MAX_CARDS);
    const hidden = workPackages.length - shown.length;
    return (
      <Box sx={{ mt: '1cqw' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${shown.length}, 1fr)`, gap: '2cqw' }}>
          {shown.length === 1 ? (
            <OverdueWorkPackageItem wp={shown[0]} maxBlockers={1} compact />
          ) : (
            shown.map((wp) => <OverdueWorkPackageCard key={wbsPipe(wp.wbsNum)} wp={wp} />)
          )}
        </Box>
        {hidden > 0 && (
          <Typography sx={{ fontSize: '2.2cqw', color: 'white', opacity: 0.8, mt: '0cqw', textAlign: 'center' }}>
            +{hidden} more
          </Typography>
        )}
      </Box>
    );
  }

  const hiddenCount = workPackages.length - MAX_CARDS;

  return (
    <Stack sx={{ flex: 1, minHeight: 0, gap: '1.2cqw', mt: '1cqw' }}>
      {workPackages.slice(0, MAX_CARDS).map((wp) => (
        <OverdueWorkPackageItem key={wbsPipe(wp.wbsNum)} wp={wp} />
      ))}
      {hiddenCount > 0 && (
        <Typography sx={{ fontSize: '2.4cqw', color: 'white', opacity: 0.8, textAlign: 'center' }}>
          +{hiddenCount} more
        </Typography>
      )}
    </Stack>
  );
};

/**
 * Overdue work packages on the bay dashboard.
 */
const OverdueWorkPackagesWidget: React.FC<BayDashboardWidgetProps> = ({ size, slug }) => {
  const { data: workPackages, isLoading, isError } = useGetBayDashboardOverdueWorkPackages(slug);

  return (
    <NERWidget size={size} title={bayDashboardWidgetDisplayNames[BayDashboardWidgetType.OVERDUE_WORK_PACKAGES]}>
      {slug && (
        <OverdueWorkPackagesWidgetView
          workPackages={workPackages}
          isLoading={isLoading}
          isError={isError && workPackages === undefined}
          size={size}
        />
      )}
    </NERWidget>
  );
};

export default OverdueWorkPackagesWidget;
