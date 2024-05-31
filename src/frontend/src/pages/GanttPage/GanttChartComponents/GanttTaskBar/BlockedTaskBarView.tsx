import {
  GANTT_CHART_GAP_SIZE,
  GANTT_CHART_CELL_SIZE,
  RequestEventChange,
  transformWorkPackageToGanttTask
} from '../../../../utils/gantt.utils';
import { Box, Typography, useTheme } from '@mui/material';
import { dateToString } from '../../../../utils/datetime.utils';
import { routes } from '../../../../utils/routes';
import { useHistory } from 'react-router-dom';
import { WbsNumber, wbsPipe } from 'shared';
import { useSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { projectWbsPipe } from '../../../../utils/pipes';

const BlockedGanttTaskView = ({
  days,
  teamName,
  getStartCol,
  getEndCol,
  wbsNumber,
  handleOnMouseOver,
  handleOnMouseLeave,
  onWorkPackageToggle,
  highlightedChange,
  getNewWorkPackageNumber
}: {
  days: Date[];
  wbsNumber: WbsNumber;
  teamName: string;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  highlightedChange?: RequestEventChange;
  getNewWorkPackageNumber: (projectId: string) => number;
}) => {
  const { isLoading, data, isError, error } = useSingleWorkPackage(wbsNumber);
  const theme = useTheme();
  const history = useHistory();

  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} />;

  const task = transformWorkPackageToGanttTask(data, teamName, []);

  return (
    <>
      <Box style={{ position: 'relative', width: '100%', marginTop: 10 }}>
        <Box
          sx={{
            display: 'grid',
            gap: GANTT_CHART_GAP_SIZE,
            gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${days.length}, minmax(${GANTT_CHART_CELL_SIZE}, 1fr))`,
            width: '100%'
          }}
        >
          <div
            style={{
              gridColumnStart: getStartCol(task.start),
              gridColumnEnd: getEndCol(task.end),
              height: '2rem',
              border: highlightedChange ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
              borderRadius: '0.25rem',
              backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
              cursor: 'pointer',
              gridRow: 1,
              zIndex: 1
            }}
            onMouseOver={handleOnMouseOver}
            onMouseLeave={handleOnMouseLeave}
            onClick={() => history.push(`${`${routes.PROJECTS}/${task.id}`}`)}
          >
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'visible'
              }}
            >
              <Box
                style={{
                  padding: '0.25rem',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                  userSelect: 'none'
                }}
              />
            </Box>
          </div>
          <div
            style={{
              gridRow: 1,
              zIndex: 3,
              gridColumnStart: getStartCol(task.start),
              gridColumnEnd: getEndCol(task.end),
              display: 'flex',
              alignItems: 'center',
              marginTop: undefined,
              marginBottom: undefined,
              cursor: 'pointer',
              width: '100%'
            }}
            onMouseOver={handleOnMouseOver}
            onMouseLeave={handleOnMouseLeave}
          >
            <Typography
              variant="body1"
              sx={{
                color: task.styles ? task.styles.color : '#ffffff',
                px: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              onClick={onWorkPackageToggle}
            >
              {task.name}
            </Typography>
          </div>
          {highlightedChange && wbsPipe(highlightedChange.element.wbsNum) === wbsPipe(data.wbsNum) && (
            <div
              id="proposedChange"
              style={{
                paddingTop: '2px',
                paddingLeft: '5px',
                gridColumnStart: days.findIndex((day) => dateToString(day) === dateToString(highlightedChange.newStart)) + 1,
                gridColumnEnd:
                  days.findIndex((day) => dateToString(day) === dateToString(highlightedChange.newEnd)) === -1
                    ? days.length + 1
                    : days.findIndex((day) => dateToString(day) === dateToString(highlightedChange.newEnd)) + 2,
                height: '2rem',
                border: `1px solid ${theme.palette.text.primary}`,
                borderRadius: '0.25rem',
                backgroundColor: '#ef4345',
                cursor: 'pointer',
                gridRow: 1,
                zIndex: 6
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: task.styles ? task.styles.color : '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {task.name}
              </Typography>
            </div>
          )}
        </Box>
      </Box>
      {task.blocking.map((wbsNum) => {
        return (
          <BlockedGanttTaskView
            key={wbsPipe(wbsNum)}
            days={days}
            wbsNumber={wbsNum}
            teamName={teamName}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            handleOnMouseOver={handleOnMouseOver}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={
              highlightedChange && projectWbsPipe(highlightedChange.element.wbsNum) === projectWbsPipe(data.wbsNum)
                ? highlightedChange
                : undefined
            }
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        );
      })}
    </>
  );
};

export default BlockedGanttTaskView;
