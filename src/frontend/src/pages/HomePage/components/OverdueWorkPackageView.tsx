import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import WorkPackageCard from './WorkPackageCard';
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
    <Box sx={{ position: 'relative', mt: 5, height: '90%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          top: -40,
          width: '75%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: theme.palette.background.paper,
          padding: 2,
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
            mt: isEmpty ? 0 : 4,
            height: '100%'
          }}
        >
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
              height: '100%',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '20px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.primary.main,
                borderRadius: '20px',
                border: '6px solid transparent',
                backgroundClip: 'content-box'
              },
              scrollbarWidth: 'auto',
              scrollbarColor: `${theme.palette.primary.main} transparent`
            }}
          >
            {isEmpty ? <NoOverdueWPsDisplay /> : workPackages.map((wp) => <WorkPackageCard wp={wp} />)}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverdueWorkPackagesView;
