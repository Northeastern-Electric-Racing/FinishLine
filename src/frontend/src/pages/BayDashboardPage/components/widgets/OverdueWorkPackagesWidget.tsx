/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { CalendarMonth, CheckCircleOutlineOutlined, Construction, ErrorOutline, Work } from '@mui/icons-material';
import { BayDashboardWidgetSize, BayDashboardWidgetType, UserPreview, WbsNumber, wbsPipe } from 'shared';
import NERWidget from '../../../../components/NERWidget';
import { BayDashboardWidgetProps, bayDashboardWidgetDisplayNames } from '../../../../utils/bay-dashboard.utils';
import { datePipe, fullNamePipe, projectWbsPipe } from '../../../../utils/pipes';
import { daysOverdue } from '../../../../utils/datetime.utils';

// everything is sized in cqw so the widget scales the same on the TV and in the Admin Tools preview
const NER_RED = '#ef4244';
const MAX_CARDS = 4;
const MAX_BLOCKERS = 2;

/**
 * Only what the widget needs to display an overdue work package
 */
export interface OverdueWorkPackageWidgetItem {
  wbsNum: WbsNumber;
  name: string;
  projectName: string;
  blockedBy: { wbsNum: WbsNumber; name: string }[];
  lead?: UserPreview;
  manager?: UserPreview;
  endDate: Date;
}

// TODO: replace with the public overdue work packages endpoint once the backend has it
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const sampleOverdueWorkPackages: OverdueWorkPackageWidgetItem[] = [
  {
    wbsNum: { carNumber: 1, projectNumber: 4, workPackageNumber: 2 },
    name: 'Battery Box Machining',
    projectName: 'Accumulator',
    blockedBy: [
      { wbsNum: { carNumber: 1, projectNumber: 4, workPackageNumber: 1 }, name: 'Battery Box Design Review' },
      { wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 3 }, name: 'Frame Mounting Points' },
      { wbsNum: { carNumber: 1, projectNumber: 7, workPackageNumber: 1 }, name: 'Cell Procurement' }
    ],
    lead: { userId: '1', firstName: 'Joe', lastName: 'Shmoe' },
    manager: { userId: '2', firstName: 'Jane', lastName: 'Doe' },
    endDate: daysAgo(12)
  },
  {
    wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 5 },
    name: 'Rear Suspension Assembly',
    projectName: 'Suspension',
    blockedBy: [{ wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 4 }, name: 'Upright Manufacturing' }],
    lead: { userId: '3', firstName: 'Alex', lastName: 'Kim' },
    manager: { userId: '4', firstName: 'Sam', lastName: 'Rivera' },
    endDate: daysAgo(5)
  },
  {
    wbsNum: { carNumber: 1, projectNumber: 9, workPackageNumber: 1 },
    name: 'Wiring Harness Layout',
    projectName: 'Low Voltage',
    blockedBy: [],
    lead: { userId: '5', firstName: 'Taylor', lastName: 'Nguyen' },
    manager: { userId: '6', firstName: 'Jordan', lastName: 'Lee' },
    endDate: daysAgo(1)
  },
  {
    wbsNum: { carNumber: 1, projectNumber: 5, workPackageNumber: 3 },
    name: 'Motor Controller Integration',
    projectName: 'Powertrain',
    blockedBy: [{ wbsNum: { carNumber: 1, projectNumber: 5, workPackageNumber: 2 }, name: 'Inverter Bench Testing' }],
    lead: { userId: '7', firstName: 'Morgan', lastName: 'Patel' },
    manager: { userId: '8', firstName: 'Casey', lastName: 'Brooks' },
    endDate: daysAgo(20)
  },
  {
    wbsNum: { carNumber: 1, projectNumber: 3, workPackageNumber: 6 },
    name: 'Brake Pedal Bracket Redesign',
    projectName: 'Brakes',
    blockedBy: [
      { wbsNum: { carNumber: 1, projectNumber: 3, workPackageNumber: 5 }, name: 'Pedal Box Mounting' },
      { wbsNum: { carNumber: 1, projectNumber: 3, workPackageNumber: 2 }, name: 'Master Cylinder Selection' },
      { wbsNum: { carNumber: 1, projectNumber: 6, workPackageNumber: 1 }, name: 'Firewall Clearance Check' }
    ],
    lead: { userId: '9', firstName: 'Riley', lastName: 'Chen' },
    manager: { userId: '10', firstName: 'Avery', lastName: 'Okafor' },
    endDate: daysAgo(8)
  }
];

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

const InfoPill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
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

const BlockerLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: '1cqw', minWidth: 0 }}>
    <Box sx={{ width: '0.7cqw', height: '0.7cqw', borderRadius: '50%', bgcolor: 'white', flexShrink: 0 }} />
    <Typography noWrap sx={{ fontSize: '1.9cqw', lineHeight: 1.2, minWidth: 0 }}>
      {children}
    </Typography>
  </Box>
);

const OverdueWorkPackageItem: React.FC<{ wp: OverdueWorkPackageWidgetItem }> = ({ wp }) => {
  const numDaysOverdue = daysOverdue(new Date(wp.endDate));
  const hiddenBlockers = wp.blockedBy.length - MAX_BLOCKERS;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        maxHeight: '24cqw',
        display: 'flex',
        flexDirection: 'column',
        p: '2.5cqw',
        pt: '1.5cqw',
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
          <InfoPill icon={<CalendarMonth />} label={datePipe(new Date(wp.endDate))} />
        </Stack>
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '2cqw', flex: 1, minHeight: 0 }}>
        <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden', mt: '0.5cqw' }}>
          <Typography noWrap sx={{ fontSize: '3.2cqw', fontWeight: 'bold', lineHeight: 1.2 }}>
            {wbsPipe(wp.wbsNum)} - {wp.name}
          </Typography>
          <Typography sx={{ fontSize: '1.9cqw', lineHeight: 1.2, mt: '1cqw', mb: '0.5cqw', textDecoration: 'underline' }}>
            Blocked By:
          </Typography>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {wp.blockedBy.length === 0 ? (
              <BlockerLine>No Blockers</BlockerLine>
            ) : (
              wp.blockedBy.slice(0, MAX_BLOCKERS).map((blocker) => (
                <BlockerLine key={wbsPipe(blocker.wbsNum)}>
                  {wbsPipe(blocker.wbsNum)} - {blocker.name}
                  {blocker === wp.blockedBy[MAX_BLOCKERS - 1] && hiddenBlockers > 0 && (
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
  workPackages?: OverdueWorkPackageWidgetItem[];
  isLoading?: boolean;
  isError?: boolean;
}

/**
 * The large overdue work packages list, most overdue first.
 * Shows as many as fit and a count of the rest, since nobody can scroll the TV.
 */
export const OverdueWorkPackagesWidgetView: React.FC<OverdueWorkPackagesWidgetViewProps> = ({
  workPackages,
  isLoading,
  isError
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

  const sorted = [...workPackages].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  const hiddenCount = sorted.length - MAX_CARDS;

  return (
    <Stack sx={{ flex: 1, minHeight: 0, gap: '1.2cqw', mt: '1cqw' }}>
      {sorted.slice(0, MAX_CARDS).map((wp) => (
        <OverdueWorkPackageItem key={wbsPipe(wp.wbsNum)} wp={wp} />
      ))}
      {hiddenCount > 0 && (
        <Typography sx={{ fontSize: '2.4cqw', color: 'white', opacity: 0.8, textAlign: 'center' }}>
          +{hiddenCount} more overdue
        </Typography>
      )}
    </Stack>
  );
};

/**
 * Overdue work packages on the bay dashboard. Only the large size is built so far, the others are still a placeholder frame
 */
const OverdueWorkPackagesWidget: React.FC<BayDashboardWidgetProps> = ({ size }) => {
  return (
    <NERWidget size={size} title={bayDashboardWidgetDisplayNames[BayDashboardWidgetType.OVERDUE_WORK_PACKAGES]}>
      {size === BayDashboardWidgetSize.LARGE && <OverdueWorkPackagesWidgetView workPackages={sampleOverdueWorkPackages} />}
    </NERWidget>
  );
};

export default OverdueWorkPackagesWidget;
