import {
  GANTT_CHART_GAP_SIZE,
  GANTT_CHART_CELL_SIZE,
  GanttTaskData,
  RequestEventChange
} from '../../../../utils/gantt.utils';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { dateToString } from '../../../../utils/datetime.utils';
import { routes } from '../../../../utils/routes';
import { useHistory } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const GanttTaskBarView = ({
  days,
  event,
  getStartCol,
  getEndCol,
  isProject,
  handleOnMouseOver,
  handleOnMouseLeave,
  onWorkPackageToggle,
  showWorkPackages,
  highlightedChange
}: {
  days: Date[];
  event: GanttTaskData;
  getStartCol: (event: GanttTaskData) => number;
  getEndCol: (event: GanttTaskData) => number;
  isProject: boolean;
  handleOnMouseOver: (e: React.MouseEvent) => void;
  handleOnMouseLeave: () => void;
  onWorkPackageToggle?: () => void;
  showWorkPackages?: boolean;
  highlightedChange?: RequestEventChange;
}) => {
  const theme = useTheme();
  const history = useHistory();

  return (
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
            gridColumnStart: getStartCol(event),
            gridColumnEnd: getEndCol(event),
            height: '2rem',
            border: highlightedChange ? `1px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
            borderRadius: '0.25rem',
            backgroundColor: event.styles ? event.styles.backgroundColor : theme.palette.background.paper,
            cursor: 'pointer',
            gridRow: 1,
            zIndex: 1
          }}
          onMouseOver={handleOnMouseOver}
          onMouseLeave={handleOnMouseLeave}
          onClick={() => history.push(`${`${routes.PROJECTS}/${event.id}`}`)}
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
            gridColumnStart: getStartCol(event),
            gridColumnEnd: getEndCol(event),
            display: 'flex',
            alignItems: 'center',
            marginTop: isProject ? '-10px' : undefined,
            marginBottom: isProject ? '-10px' : undefined,
            cursor: 'pointer',
            width: isProject ? 'fit-content' : '100%'
          }}
          onMouseOver={handleOnMouseOver}
          onMouseLeave={handleOnMouseLeave}
          onClick={!isProject ? () => history.push(`${`${routes.PROJECTS}/${event.id}`}`) : undefined}
        >
          {isProject && (
            <IconButton onClick={onWorkPackageToggle} sx={{ marginRight: '-15px', marginLeft: '-5px' }}>
              {showWorkPackages ? <ArrowDropDownIcon fontSize="large" /> : <ArrowRightIcon fontSize="large" />}
            </IconButton>
          )}
          <Typography
            variant="body1"
            sx={{
              color: event.styles ? event.styles.color : '#ffffff',
              px: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            onClick={onWorkPackageToggle}
          >
            {event.name}
          </Typography>
        </div>
        {event.workPackages.map((child) => {
          return (
            <div
              style={{
                gridColumnStart: getStartCol(child),
                gridColumnEnd: getEndCol(child),
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
              onClick={() => history.push(`${`${routes.PROJECTS}/${event.id}`}`)}
            />
          );
        })}
        {highlightedChange && (
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
                color: event.styles ? event.styles.color : '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {highlightedChange.name}
            </Typography>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default GanttTaskBarView;
