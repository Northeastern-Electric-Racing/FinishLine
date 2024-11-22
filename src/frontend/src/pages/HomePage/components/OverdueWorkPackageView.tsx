import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import WorkPackageCard from './WorkPackageCard';
import { PAGE_GRID_HEIGHT } from '../../../components/PageLayout';
import { WorkPackage } from 'shared';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

interface OverdueWorkPackagesViewProps {
  workPackages: WorkPackage[];
}

const NoOverdueWPsDisplay: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 128 }} />}
      heading={'Great Job Team!'}
      message={'Your team has no overdue work packages!'}
    />
  );
};

const OverdueWorkPackagesView: React.FC<OverdueWorkPackagesViewProps> = ({ workPackages }) => {
  const theme = useTheme();
  const isEmpty = workPackages.length === 0;
  return (
    <Box sx={{ position: 'relative', mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          top: -50,
          width: '75%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: theme.palette.background.paper,
          padding: 4,
          borderRadius: 2,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: theme.palette.primary.main
        }}
      >
        <Typography variant="h4" align="center">
          Overdue Work Packages
        </Typography>
      </Box>
      <Card
        sx={{
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            height: '20px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.error.dark,
            borderRadius: '20px',
            border: '6px solid transparent',
            backgroundClip: 'content-box'
          },
          height: '100%',
          my: 2,
          background: theme.palette.background.paper,
          borderWidth: 2,
          borderColor: theme.palette.primary.main
        }}
        variant="outlined"
      >
        <CardContent
          sx={{
            height: isEmpty ? `calc(${PAGE_GRID_HEIGHT}vh - 200px)` : `100%`,
            maxHeight: `calc(${PAGE_GRID_HEIGHT}vh - 200px)`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Stack spacing={2} mt={isEmpty ? 12 : 8}>
            {isEmpty ? <NoOverdueWPsDisplay /> : workPackages.map((wp) => <WorkPackageCard wp={wp} />)}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverdueWorkPackagesView;
