import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { useHistory } from 'react-router-dom';
import {
  GanttTask,
  isHighlightedChangeOnGanttTask,
  RequestEventChange,
  transformWorkPackageToGanttTask
} from '../../../../utils/gantt.utils';
import { routes } from '../../../../utils/routes';
import { wbsPipe } from 'shared';
import {
  ganttTaskBarBackgroundStyles,
  ganttTaskBarContainerStyles,
  taskNameContainerStyles,
  webKitBoxContainerStyles,
  webKitBoxStyles
} from './GanttTaskBarDisplayStyles';
import { CSSProperties } from 'react';
import { ArcherElement } from 'react-archer';

interface GanttTaskBarDisplayProps {
  days: Date[];
  task: GanttTask;
  isProject: boolean;
  handleOnMouseOver: (e: React.MouseEvent, task: GanttTask) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  showWorkPackages?: boolean;
  highlightedChange?: RequestEventChange;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
}

const GanttTaskBarDisplay = ({
  days,
  task,
  isProject,
  handleOnMouseOver,
  handleOnMouseLeave,
  onWorkPackageToggle,
  showWorkPackages,
  highlightedChange,
  getStartCol,
  getEndCol
}: GanttTaskBarDisplayProps) => {
  const theme = useTheme();
  const history = useHistory();

  const ganttTaskBarHoverDetectionBoxStyles: CSSProperties = {
    gridColumnStart: getStartCol(task.start),
    gridColumnEnd: getEndCol(task.end),
    height: '2rem',
    border: highlightedChange ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: 'pointer',
    gridRow: 1,
    zIndex: 1
  };

  const ganttTaskBarDetailsBoxStyles: CSSProperties = {
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
  };

  const ganttTaskBarWorkPackageOverlayStyles = (child: GanttTask): CSSProperties => {
    return {
      gridColumnStart: getStartCol(child.start),
      gridColumnEnd: getEndCol(child.end),
      height: '2rem',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '0.25rem',
      backgroundColor: child.styles ? child.styles.backgroundColor : grey[700],
      cursor: 'pointer',
      gridRow: 1,
      zIndex: 2
    };
  };

  const highlightedChangeBoxStyles = (highlightedChange: RequestEventChange): CSSProperties => {
    console.log('highlightedChange', highlightedChange);
    return {
      paddingTop: '2px',
      paddingLeft: '5px',
      gridColumnStart: getStartCol(highlightedChange.newStart),
      gridColumnEnd: getEndCol(highlightedChange.newEnd),
      height: '2rem',
      border: `1px solid ${theme.palette.text.primary}`,
      borderRadius: '0.25rem',
      backgroundColor: '#ef4345',
      cursor: 'pointer',
      gridRow: 1,
      zIndex: 6
    };
  };

  return (
    <div id={task.teamName + wbsPipe(task)} style={ganttTaskBarContainerStyles()}>
      <Box sx={ganttTaskBarBackgroundStyles(days.length)}>
        <ArcherElement
          id={task.teamName + wbsPipe(task)}
          relations={task.blocking.map((blocking) => {
            return {
              targetId: task.teamName + wbsPipe(blocking),
              targetAnchor: 'left',
              sourceAnchor: 'right',
              style: { strokeDasharray: '5,5', noCurves: true, endMarker: false }
            };
          })}
        >
          <div
            style={ganttTaskBarHoverDetectionBoxStyles}
            onMouseOver={(e) => handleOnMouseOver(e, task)}
            onMouseLeave={handleOnMouseLeave}
            onClick={() => history.push(`${routes.PROJECTS}/${task.id}`)}
          >
            <Box sx={webKitBoxContainerStyles()}>
              <Box sx={webKitBoxStyles()} />
            </Box>
          </div>
        </ArcherElement>
        <div
          style={ganttTaskBarDetailsBoxStyles}
          onMouseOver={(e) => handleOnMouseOver(e, task)}
          onMouseLeave={handleOnMouseLeave}
          onClick={!isProject ? () => history.push(`${routes.PROJECTS}/${task.id}`) : undefined}
        >
          {isProject && (
            <IconButton onClick={onWorkPackageToggle} sx={{ marginRight: '-15px', marginLeft: '-5px' }}>
              {showWorkPackages ? (
                <ArrowDropDownIcon fontSize="large" />
              ) : (
                <ArrowDropDownIcon fontSize="large" sx={{ transform: `rotate(270deg)` }} />
              )}
            </IconButton>
          )}
          <Typography variant="body1" sx={taskNameContainerStyles(task)} onClick={onWorkPackageToggle}>
            {task.name}
          </Typography>
        </div>
        {isProject &&
          task.allWorkPackages.map((workPackage) => {
            const child = transformWorkPackageToGanttTask(workPackage, task.teamName, task.allWorkPackages);
            return (
              <div
                style={ganttTaskBarWorkPackageOverlayStyles(child)}
                onMouseOver={(e) => handleOnMouseOver(e, child)}
                onMouseLeave={handleOnMouseLeave}
                onClick={() => history.push(`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`)}
              />
            );
          })}
        {highlightedChange && isHighlightedChangeOnGanttTask(highlightedChange, task) && (
          <div id="proposedChange" style={highlightedChangeBoxStyles(highlightedChange)}>
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
    </div>
  );
};

export default GanttTaskBarDisplay;
