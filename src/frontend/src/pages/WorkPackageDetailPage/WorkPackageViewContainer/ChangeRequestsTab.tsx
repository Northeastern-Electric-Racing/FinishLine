import { ChangeRequest, WorkPackage } from 'shared';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import ChangeRequestDetailCard from '../../../components/ChangeRequestDetailCard';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { projectWbsPipe } from '../../../utils/pipes';
interface ChangeRequestsTabProps {
  workPackage: WorkPackage;
  dependencies: WorkPackage[];
}

const ChangeRequestsTab: React.FC<ChangeRequestsTabProps> = ({ workPackage, dependencies }) => {
  const theme = useTheme();
  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  const currentDate = new Date();

  if (crIsLoading || !changeRequests) return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;

  const crUnreviewed = changeRequests
    ? changeRequests
        .filter((cr: ChangeRequest) => !cr.dateReviewed && projectWbsPipe(cr.wbsNum) === projectWbsPipe(workPackage.wbsNum))
        .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime())
    : [];

  const crApproved = changeRequests
    ? changeRequests
        .filter(
          (cr: ChangeRequest) =>
            cr.dateReviewed &&
            cr.accepted &&
            currentDate.getTime() - cr.dateReviewed.getTime() <= 1000 * 60 * 60 * 24 * 5 &&
            projectWbsPipe(cr.wbsNum) === projectWbsPipe(workPackage.wbsNum)
        )
        .sort((a, b) => (a.dateReviewed && b.dateReviewed ? b.dateReviewed.getTime() - a.dateReviewed.getTime() : 0))
    : [];

  const displayCRCards = (crList: ChangeRequest[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'auto',
        justifyContent: 'flex-start',
        '&::-webkit-scrollbar': {
          height: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {crList.map((cr: ChangeRequest) => (
        <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
      ))}
    </Box>
  );

  const renderChangeRequests = (title: string, crList: ChangeRequest[], emptyMessage: string) => {
    return (
      <>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {crList.length > 0 ? (
          <Grid container>{displayCRCards(crList)}</Grid>
        ) : (
          <Typography gutterBottom>{emptyMessage}</Typography>
        )}
      </>
    );
  };
  return (
    <>
      <Grid
        sx={{
          mt: 3
        }}
      >
        <Grid
          sx={{
            mb: 3
          }}
        >
          {renderChangeRequests('Un-reviewed Change Requests', crUnreviewed, 'No un-reviewed change requests')}
        </Grid>
        {renderChangeRequests('Recently Approved Change Requests', crApproved, 'No recently approved change requests')}
      </Grid>
    </>
  );
};

export default ChangeRequestsTab;
