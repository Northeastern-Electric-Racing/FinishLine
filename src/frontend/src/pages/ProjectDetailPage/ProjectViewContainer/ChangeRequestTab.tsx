import { Box, Grid, Typography, useTheme } from '@mui/material';
import { ChangeRequest, Project, equalsWbsNumber } from 'shared';
import { useAllChangeRequests } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import ChangeRequestDetailCard from '../../../components/ChangeRequestDetailCard';

const CRTab = ({ project }: { project: Project }) => {
  const { data: changeRequests, isError: crIsError, isLoading: crIsLoading, error: crError } = useAllChangeRequests();
  const theme = useTheme();
  if (crIsLoading || !changeRequests) return <LoadingIndicator />;
  if (crIsError) return <ErrorPage message={crError?.message} />;

  const wbsNum = project.wbsNum;
  const currentDate = new Date();

  const crUnreviewed = changeRequests
    .filter((cr: ChangeRequest) => !cr.dateReviewed && equalsWbsNumber(wbsNum, cr.wbsNum))
    .sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());

  const crApproved = changeRequests
    .filter(
      (cr: ChangeRequest) =>
        cr.dateReviewed &&
        cr.accepted &&
        equalsWbsNumber(wbsNum, cr.wbsNum) &&
        currentDate.getTime() - cr.dateReviewed.getTime() <= 1000 * 60 * 60 * 24 * 5
    )
    .sort((a, b) => (a.dateReviewed && b.dateReviewed ? b.dateReviewed.getTime() - a.dateReviewed.getTime() : 0));

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
    <Box>
      {renderChangeRequests('My Un-reviewed Change Requests', crUnreviewed, 'No un-reviewed change requests')}
      {renderChangeRequests('My Recently Approved Change Requests', crApproved, 'No recently approved change requests')}
    </Box>
  );
};
export default CRTab;
