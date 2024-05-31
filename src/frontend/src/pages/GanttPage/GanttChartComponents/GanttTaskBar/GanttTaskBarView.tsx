import {
  GANTT_CHART_GAP_SIZE,
  GANTT_CHART_CELL_SIZE,
  RequestEventChange,
  transformWorkPackageToGanttTask,
  GanttTask
} from '../../../../utils/gantt.utils';
import { Box, Collapse, IconButton, Typography, useTheme } from '@mui/material';
import { dateToString } from '../../../../utils/datetime.utils';
import { routes } from '../../../../utils/routes';
import { useHistory } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import GanttTaskBar from './GanttTaskBar';
import BlockedGanttTaskView from './BlockedTaskBarView';
import { wbsPipe } from 'shared';
import { grey } from '@mui/material/colors';
import { projectWbsPipe } from '../../../../utils/pipes';

const GanttTaskBarView = ({
  days,
  task,
  getStartCol,
  getEndCol,
  isProject,
  handleOnMouseOver,
  handleOnMouseLeave,
  onWorkPackageToggle,
  showWorkPackages,
  highlightedChange,
  getNewWorkPackageNumber
}: {
  days: Date[];
  task: GanttTask;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  isProject: boolean;
  handleOnMouseOver: (e: React.MouseEvent) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  showWorkPackages?: boolean;
  highlightedChange?: RequestEventChange;
  getNewWorkPackageNumber: (projectId: string) => number;
}) => {
  const theme = useTheme();
  const history = useHistory();

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
              marginTop: isProject ? '-10px' : undefined,
              marginBottom: isProject ? '-10px' : undefined,
              cursor: 'pointer',
              width: isProject ? 'fit-content' : '100%'
            }}
            onMouseOver={handleOnMouseOver}
            onMouseLeave={handleOnMouseLeave}
            onClick={!isProject ? () => history.push(`${`${routes.PROJECTS}/${task.id}`}`) : undefined}
          >
            {isProject && (
              <IconButton onClick={onWorkPackageToggle} sx={{ marginRight: '-15px', marginLeft: '-5px' }}>
                {showWorkPackages ? <ArrowDropDownIcon fontSize="large" /> : <ArrowRightIcon fontSize="large" />}
              </IconButton>
            )}
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
          {!highlightedChange &&
            isProject &&
            task.totalWorkPackages.map((workPackage) => {
              const child = transformWorkPackageToGanttTask(workPackage, task.teamName, task.totalWorkPackages);
              return (
                <div
                  style={{
                    gridColumnStart: getStartCol(child.start),
                    gridColumnEnd: getEndCol(child.end),
                    height: '2rem',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '0.25rem',
                    backgroundColor: child.styles ? child.styles.backgroundColor : grey[700],
                    cursor: 'pointer',
                    gridRow: 1,
                    zIndex: 2
                  }}
                  onMouseOver={handleOnMouseOver}
                  onMouseLeave={handleOnMouseLeave}
                  onClick={() => history.push(`${`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}`)}
                />
              );
            })}
          {highlightedChange &&
            wbsPipe(highlightedChange.element.wbsNum) ===
              wbsPipe({
                carNumber: task.carNumber,
                projectNumber: task.projectNumber,
                workPackageNumber: task.workPackageNumber
              }) && (
              <div
                id="proposedChange"
                style={{
                  paddingTop: '2px',
                  paddingLeft: '5px',
                  gridColumnStart:
                    wbsPipe(highlightedChange.element.wbsNum) ===
                    wbsPipe({ carNumber: task.carNumber, projectNumber: task.projectNumber, workPackageNumber: 0 })
                      ? days.findIndex((day) => dateToString(day) === dateToString(highlightedChange.newStart)) + 1
                      : getStartCol(task.start),
                  gridColumnEnd:
                    wbsPipe(highlightedChange.element.wbsNum) ===
                    wbsPipe({ carNumber: task.carNumber, projectNumber: task.projectNumber, workPackageNumber: 0 })
                      ? days.findIndex((day) => dateToString(day) === dateToString(highlightedChange.newEnd)) === -1
                        ? days.length + 1
                        : days.findIndex((day) => dateToString(day) === dateToString(highlightedChange.newEnd)) + 2
                      : getEndCol(task.end),
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
      <Collapse in={showWorkPackages}>
        {task.unblockedWorkPackages.map((workPackage) => {
          return (
            <GanttTaskBar
              key={workPackage.id}
              days={days}
              task={transformWorkPackageToGanttTask(workPackage, task.teamName, task.totalWorkPackages)}
              isEditMode={false}
              createChange={() => {}}
              handleOnMouseOver={handleOnMouseOver}
              handleOnMouseLeave={handleOnMouseLeave}
              highlightedChange={highlightedChange}
              getNewWorkPackageNumber={getNewWorkPackageNumber}
            />
          );
        })}
      </Collapse>
      {task.blocking.map((wbsNum) => {
        return (
          <BlockedGanttTaskView
            key={wbsPipe(wbsNum)}
            days={days}
            wbsNumber={wbsNum}
            teamName={task.teamName}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            handleOnMouseOver={handleOnMouseOver}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={
              highlightedChange && projectWbsPipe(highlightedChange.element.wbsNum) === projectWbsPipe(wbsNum)
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

export default GanttTaskBarView;
