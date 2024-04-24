/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Card, Tooltip, Typography } from '@mui/material';
import { WbsElementStatus, WorkPackageStage } from 'shared';
import { GanttWorkPackageStageColorPipe, GanttWorkPackageTextColorPipe } from '../../../utils/gantt.utils';
import { WbsElementStatusTextPipe, WorkPackageStageTextPipe } from '../../../utils/enum-pipes';

const LEGEND_POPUPS_MAP = new Map<WorkPackageStage, JSX.Element>();

Object.values(WorkPackageStage).map((stage) =>
  LEGEND_POPUPS_MAP.set(
    stage,
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        px: 2,
        py: 1
      }}
    >
      {
        // map through all the Wbs Element Statuses
        Object.values(WbsElementStatus).map((status) => {
          return (
            <Box
              sx={{
                backgroundColor: GanttWorkPackageStageColorPipe(stage, status),
                height: '2rem',
                width: '8rem',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="body1" sx={{ color: GanttWorkPackageTextColorPipe(stage) }}>
                {WbsElementStatusTextPipe(status)}
              </Typography>
            </Box>
          );
        })
      }
    </Card>
  )
);

const GanttChartColorLegend = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        gap: 1,
        overflowX: 'scroll',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE and Edge
      }}
    >
      {
        // map through all the WP Stages
        Object.values(WorkPackageStage).map((stage) => {
          return (
            <Box
              sx={{
                background: `linear-gradient(90deg, ${GanttWorkPackageStageColorPipe(
                  stage,
                  WbsElementStatus.Inactive
                )} 0%, ${GanttWorkPackageStageColorPipe(
                  stage,
                  WbsElementStatus.Active
                )} 50%, ${GanttWorkPackageStageColorPipe(stage, WbsElementStatus.Complete)} 100%)`,
                display: 'flex',
                flexDirection: 'column',
                height: '2rem',
                width: '8.25rem',
                borderRadius: 1,
                justifyContent: 'center',
                alignItems: 'center',
                px: 1
              }}
            >
              <Tooltip
                title={LEGEND_POPUPS_MAP.get(stage)}
                slotProps={{
                  tooltip: { sx: { background: 'transparent', width: 'fit-content' } }
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: GanttWorkPackageTextColorPipe(stage), overflow: 'hidden', textWrap: 'nowrap' }}
                >
                  {WorkPackageStageTextPipe(stage)}
                </Typography>
              </Tooltip>
            </Box>
          );
        })
      }
    </Box>
  );
};

export default GanttChartColorLegend;
