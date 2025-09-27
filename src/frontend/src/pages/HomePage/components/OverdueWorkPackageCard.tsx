import { Construction, Work, CalendarMonth } from '@mui/icons-material';
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
import { datePipe, fullNamePipe, projectWbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { useGetManyWorkPackages } from '../../../hooks/work-packages.hooks';
import { daysOverdue } from '../../../utils/datetime.utils';
import LoadingIndicator from '../../../components/LoadingIndicator';

export const CircularProgressWithLabel = (props: CircularProgressProps & { value: number }) => {
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
};

const OverdueWorkPackageCard = ({ wp }: { wp: WorkPackage }) => {
  const theme = useTheme();
  const { data: blockedByWps, isLoading } = useGetManyWorkPackages(wp.blockedBy);
  const numDaysOverdue = daysOverdue(new Date(wp.endDate));
  if (isLoading || !blockedByWps) return <LoadingIndicator />;
  return (
    <Card
      variant="outlined"
      sx={{
        minHeight: 'fit-content',
        width: '100%',
        mr: 3,
        background: theme.palette.background.default
      }}
    >
      <CardContent sx={{ padding: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
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
            <Typography fontWeight="regular" fontSize={16} variant="h6" noWrap sx={{ textDecoration: 'underline' }}>
              Blocked By:
            </Typography>
            <ul style={{ marginTop: 0 }}>
              {blockedByWps.length === 0 ? (
                <li>
                  <Typography fontWeight="regular" fontSize={16} variant="h6" noWrap>
                    No Blockers
                  </Typography>
                </li>
              ) : (
                blockedByWps.map((wp) => (
                  <li key={wp.id}>
                    <Typography fontWeight={'regular'} variant="subtitle2" noWrap>
                      <Link component={RouterLink} to={`${routes.PROJECTS}/${projectWbsPipe(wp.wbsNum)}`}>
                        {projectWbsPipe(wp.wbsNum)} - {wp.projectName}
                      </Link>
                    </Typography>
                  </li>
                ))
              )}
            </ul>
          </Box>
          <Stack>
            <Stack
              direction="row"
              sx={{
                flexWrap: 'wrap',
                justifyContent: 'end',
                gap: 1
              }}
            >
              <Chip icon={<Construction />} label={fullNamePipe(wp.lead)} size={'small'} />
              <Chip icon={<Work />} label={fullNamePipe(wp.manager)} size={'small'} />
              <Chip icon={<CalendarMonth />} label={datePipe(new Date(wp.endDate))} size={'small'} />
            </Stack>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                gap: 1
              }}
            >
              <Typography
                variant={'h5'}
                color={theme.palette.primary.main}
                sx={{
                  fontSize: 72
                }}
              >
                {numDaysOverdue}
              </Typography>
              <Stack spacing={0}>
                <Typography variant={'h5'} color={theme.palette.primary.main} sx={{ marginBottom: -1, fontSize: 32 }}>
                  Days
                </Typography>
                <Typography variant={'h5'} color={theme.palette.primary.main} sx={{ fontSize: 32 }}>
                  Overdue
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OverdueWorkPackageCard;
