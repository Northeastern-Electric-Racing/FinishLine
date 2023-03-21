import { Construction, Work } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CircularProgressProps,
  Link,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { wbsPipe, WorkPackage } from 'shared';
import { datePipe, fullNamePipe, projectWbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
  return (
    <Box
      sx={{ position: 'relative', display: 'inline-flex', width: '40px', alignItems: 'center', justifyContent: 'center' }}
    >
      <CircularProgress variant="determinate" {...props} />
      <div
        style={{
          position: 'absolute',
          display: 'flex'
        }}
      >
        <Typography variant="caption" component="div" color="text.primary">{`${Math.round(props.value)}%`}</Typography>
      </div>
    </Box>
  );
}

const WorkPackageCard = ({ wp }: { wp: WorkPackage }) => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 'fit-content',
        mr: 3,
        background: theme.palette.background.default
      }}
    >
      <CardContent sx={{ padding: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography fontWeight={'regular'} variant="subtitle2" noWrap>
              <Link color={'text.primary'} component={RouterLink} to={`${routes.PROJECTS}/${projectWbsPipe(wp.wbsNum)}`}>
                {projectWbsPipe(wp.wbsNum)} - {wp.projectName}
              </Link>
            </Typography>
            <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`} noWrap>
              <Typography fontWeight={'regular'} variant="h5">
                {wbsPipe(wp.wbsNum)} - {wp.name}
              </Typography>
            </Link>
            <Typography fontWeight={'regular'} fontSize={20} variant="h6" noWrap>
              {datePipe(wp.startDate) + ' ⟝ ' + wp.duration + ' wks ⟞ ' + datePipe(wp.endDate)}
            </Typography>
          </Box>
          <Box sx={{ marginLeft: 2 }}>
            <Typography variant="subtitle1" noWrap>
              {wp.timelineStatus}
            </Typography>
            <Box textAlign={'right'} sx={{ marginTop: 1 }}>
              <CircularProgressWithLabel variant="determinate" value={wp.progress} />
            </Box>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ marginTop: 1 }}>
          <Chip
            sx={{ marginTop: 1, marginRight: 2 }}
            icon={<Construction />}
            label={fullNamePipe(wp.projectLead)}
            size="medium"
          />
          <Chip sx={{ marginTop: 1 }} icon={<Work />} label={fullNamePipe(wp.projectManager)} size="medium" />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WorkPackageCard;
