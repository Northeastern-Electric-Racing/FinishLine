/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Card, Tooltip, Typography } from '@mui/material';
import { DesignReviewStatus, TaskStatus, WbsElementStatus, WorkPackageStage } from 'shared';
import {
  ganttDesignReviewStatusColorPipe,
  ganttTaskColorPipe,
  ganttWorkPackageStageColorPipe,
  GanttWorkPackageTextColor
} from '../../../utils/gantt.utils';
import {
  DesignReviewStatusTextPipe,
  TaskStatusTextPipe,
  WbsElementStatusTextPipe,
  WorkPackageStageTextPipe
} from '../../../utils/enum-pipes';
import { grey } from '@mui/material/colors';

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
        Object.values(WbsElementStatus).map((status) => {
          return (
            <Box
              sx={{
                backgroundColor: ganttWorkPackageStageColorPipe(stage, status),
                height: '2rem',
                width: '8rem',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="body1" sx={{ color: GanttWorkPackageTextColor }}>
                {WbsElementStatusTextPipe(status)}
              </Typography>
            </Box>
          );
        })
      }
    </Card>
  )
);

const DesignReviewToolTipPopUp = () => {
  return (
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
        [DesignReviewStatus.UNCONFIRMED, DesignReviewStatus.SCHEDULED].map((status) => {
          return (
            <Box
              sx={{
                backgroundColor: ganttDesignReviewStatusColorPipe(status),
                height: '2rem',
                width: '8rem',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="body1" sx={{ color: 'white' }}>
                {DesignReviewStatusTextPipe(status)}
              </Typography>
            </Box>
          );
        })
      }
    </Card>
  );
};

const TaskToolTopPopUp = () => {
  return (
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
        [TaskStatus.IN_BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((status) => {
          return (
            <Box
              sx={{
                backgroundColor: ganttTaskColorPipe(status),
                height: '2rem',
                width: '8rem',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography variant="body1" sx={{ color: 'white' }}>
                {TaskStatusTextPipe(status)}
              </Typography>
            </Box>
          );
        })
      }
    </Card>
  );
};

const GanttChartColorLegend = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        gap: 0.9,
        overflowX: 'scroll',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE and Edge
      }}
    >
      {
        Object.values(WorkPackageStage).map((stage) => {
          return (
            <Box
              sx={{
                background: ganttWorkPackageStageColorPipe(stage, WbsElementStatus.Active),
                display: 'flex',
                flexDirection: 'column',
                height: '2rem',
                width: '8.25rem',
                borderRadius: 1,
                justifyContent: 'center',
                alignItems: 'center',
                px: 0.8
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
                  sx={{ color: GanttWorkPackageTextColor, overflow: 'hidden', textWrap: 'nowrap' }}
                >
                  {WorkPackageStageTextPipe(stage)}
                </Typography>
              </Tooltip>
            </Box>
          );
        })
      }
      <Box
        sx={{
          background: ganttTaskColorPipe(TaskStatus.IN_PROGRESS),
          display: 'flex',
          flexDirection: 'column',
          height: '2rem',
          width: '8.25rem',
          borderRadius: 1,
          justifyContent: 'center',
          alignItems: 'center',
          px: 0.8
        }}
      >
        <Tooltip
          title={<TaskToolTopPopUp />}
          slotProps={{
            tooltip: { sx: { background: 'transparent', width: 'fit-content' } }
          }}
        >
          <Typography variant="body2" sx={{ color: 'white', overflow: 'hidden', textWrap: 'nowrap' }}>
            Task
          </Typography>
        </Tooltip>
      </Box>
      <Box
        sx={{
          background: ganttDesignReviewStatusColorPipe(DesignReviewStatus.CONFIRMED),
          display: 'flex',
          flexDirection: 'column',
          height: '2rem',
          width: '8.25rem',
          borderRadius: 1,
          justifyContent: 'center',
          alignItems: 'center',
          px: 0.8
        }}
      >
        <Tooltip
          title={<DesignReviewToolTipPopUp />}
          slotProps={{
            tooltip: { sx: { background: 'transparent', width: 'fit-content' } }
          }}
        >
          <Typography variant="body2" sx={{ color: 'white', overflow: 'hidden', textWrap: 'nowrap' }}>
            Design Review
          </Typography>
        </Tooltip>
      </Box>
      <Box
        sx={{
          background: grey[500],
          display: 'flex',
          flexDirection: 'column',
          height: '2rem',
          width: '8.25rem',
          borderRadius: 1,
          justifyContent: 'center',
          alignItems: 'center',
          px: 0.8
        }}
      >
        <Typography variant="body2" sx={{ color: 'white', overflow: 'hidden', textWrap: 'nowrap' }}>
          None
        </Typography>
      </Box>
    </Box>
  );
};

export default GanttChartColorLegend;
