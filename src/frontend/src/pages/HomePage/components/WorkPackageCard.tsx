import { Construction, Work } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CircularProgressProps,
  Grid,
  Link,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { wbsPipe, WorkPackage } from 'shared';
import { datePipe, fullNamePipe, projectWbsPipe, wbsNamePipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { daysOverdue } from '../../../utils/datetime.utils';
import { useGetManyWorkPackages } from '../../../hooks/work-packages.hooks';
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

const WorkPackageCard = ({ wp }: { wp: WorkPackage }) => {
  const theme = useTheme();
  const { data: blockedByWps, isLoading } = useGetManyWorkPackages(wp.blockedBy);
  const numDaysOverdue = daysOverdue(new Date(wp.endDate));
  const isOverdue = numDaysOverdue > 0;
  if (isLoading || !blockedByWps) return <LoadingIndicator />;

  const WpChipDisplay = ({ wp, isOverdue }: { wp: WorkPackage; isOverdue: boolean }) => {
    const chipSize = isOverdue ? 'small' : 'medium';
    return (
      <Stack
        direction="row"
        sx={{
          flexWrap: 'wrap',
          justifyContent: isOverdue ? 'end' : 'start',
          gap: 1
        }}
      >
        <Chip icon={<Construction />} label={fullNamePipe(wp.lead)} size={chipSize} />
        <Chip icon={<Work />} label={fullNamePipe(wp.manager)} size={chipSize} />
        <Chip icon={<Work />} label={'TEAM'} size={chipSize} />
      </Stack>
    );
  };

  return (
    <Card
      variant="outlined"
      sx={{
        minHeight: 'fit-content',
        minWidth: 'fit-content',
        mr: 3,
        background: theme.palette.background.default
      }}
    >
      <CardContent sx={{ padding: 2 }}>
        <Grid container>
          <Grid item xs={isOverdue ? 8 : 12} md={isOverdue ? 6 : 12}>
            <Stack spacing={1}>
              <Typography fontWeight={'regular'} variant="h5" noWrap>
                <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`} noWrap>
                  {wbsPipe(wp.wbsNum)} - {wp.name}
                </Link>
              </Typography>
              <Typography fontWeight={'regular'} variant="subtitle2" noWrap>
                <Link color={'text.primary'} component={RouterLink} to={`${routes.PROJECTS}/${projectWbsPipe(wp.wbsNum)}`}>
                  {projectWbsPipe(wp.wbsNum)} - {wp.projectName}
                </Link>
              </Typography>
              {!isOverdue && (
                <Typography fontWeight={'regular'} fontSize={20} variant="h6" noWrap>
                  {datePipe(wp.startDate) + ' ⟝ ' + wp.duration + ' wks ⟞ ' + datePipe(wp.endDate)}
                </Typography>
              )}
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
                      <Typography fontWeight="regular" fontSize={16} variant="h6" noWrap>
                        {wbsNamePipe(wp)}
                      </Typography>
                    </li>
                  ))
                )}
              </ul>
              {!isOverdue && <WpChipDisplay wp={wp} isOverdue={isOverdue} />}
            </Stack>
          </Grid>
          {isOverdue && (
            <Grid item xs={4} md={6}>
              <Stack
                direction={'column'}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'end',
                  height: '100%'
                }}
              >
                <WpChipDisplay wp={wp} isOverdue={isOverdue} />
                <Box
                  sx={{
                    display: 'flex',
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
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WorkPackageCard;
