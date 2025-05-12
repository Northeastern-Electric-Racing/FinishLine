import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box, Stack, useTheme } from '@mui/system';
import { Grid, FormGroup, FormControlLabel, Typography, Link } from '@mui/material';
import { useMemo, useState } from 'react';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { isAtLeastRank, PartPreview, Project, rankUserRole, wbsPipe } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import CommonMistakes from './CommonMistakes';
import PartDisplay from '../../../PartPage/PartPageComponents/PartDisplay';
import { usePartsFromProject } from '../../../../hooks/part-review.hooks';
import ErrorPage from '../../../ErrorPage';
import { Link as RouterLink } from 'react-router-dom';
import PartReviewFAQs from './PartReviewFAQs';
import CreateMenu from './PartReviewComponents/PartFormModels/CreateMenu';

const PartsReviewPage = ({ project }: { project: Project }) => {
  const theme = useTheme();
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });
  const { data: parts, isLoading, isError, error } = usePartsFromProject(wbsPipe(project.wbsNum));

  const partsForMeToReview = useMemo(() => {
    return parts?.filter(
      (part) =>
        part.reviewRequests.some((request) => request.reviewerRequested.userId === currentUser.userId) &&
        (part.status === 'READY_FOR_REVIEW' || part.status === 'IN_REVIEW')
    );
  }, [parts, currentUser]);

  const myPartsUnderReview = useMemo(() => {
    return parts?.filter(
      (part) => part.assignees.some((assignee) => assignee.userId === currentUser.userId) && part.status !== 'APPROVED'
    );
  }, [parts, currentUser]);

  const allPartsUnderReview = useMemo(() => {
    return parts?.filter((part) => part.status !== 'APPROVED');
  }, [parts]);

  const contentAmount = useMemo(() => {
    const nonEmptyCount = [partsForMeToReview, myPartsUnderReview, allPartsUnderReview].filter(
      (partArr) => partArr?.length !== 0
    ).length;
    if (nonEmptyCount === 3) return 'compact';
    if (nonEmptyCount === 2) return 'standard';
    return 'full';
  }, [partsForMeToReview, myPartsUnderReview, allPartsUnderReview]);

  if (isLoading || !parts) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const PartsDisplay = (parts: PartPreview[] | undefined, title: string) => {
    if (!parts) return null;
    return (
      <Grid item xs={12} md={contentAmount === 'full' ? 12 : contentAmount === 'standard' ? 6 : 4}>
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
        <Box
          sx={{
            overflow: 'auto',
            bgcolor: 'grey.800',
            borderRadius: 2
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mx={3} mt={1}>
            <Typography sx={{ fontSize: '12px' }} mb={1} width={'175px'}>
              Part Name
            </Typography>
            {contentAmount !== 'compact' && (
              <Typography sx={{ fontSize: '12px' }} mb={1}>
                Assignee(s)
              </Typography>
            )}
            {contentAmount !== 'compact' && (
              <Typography sx={{ fontSize: '12px' }} mb={1}>
                Reviewer(s)
              </Typography>
            )}
            {contentAmount === 'full' && (
              <Typography sx={{ fontSize: '12px' }} mb={1}>
                Latest Submission Form
              </Typography>
            )}
            {contentAmount === 'full' && (
              <Typography sx={{ fontSize: '12px' }} mb={1}>
                Latest Review Form
              </Typography>
            )}
            <Typography sx={{ fontSize: '12px' }} mb={1}>
              Review Status
            </Typography>
          </Box>

          <Box
            sx={{
              height: '30vh',
              overflow: 'auto',
              bgcolor: 'grey.900',
              p: 1,
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: '8px',
                position: 'absolute',
                right: 0
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.primary.main,
                borderRadius: '4px',
                border: '2px solid transparent',
                backgroundClip: 'content-box'
              }
            }}
          >
            <Stack>
              {parts?.map((part) => (
                <PartDisplay index={part.index} wbsNum={wbsPipe(project.wbsNum)} contentAmount={contentAmount}></PartDisplay>
              ))}
            </Stack>
          </Box>
        </Box>
      </Grid>
    );
  };

  return (
    <Box>
      <Grid container spacing={3} width="100%">
        {partsForMeToReview?.length !== 0 &&
          PartsDisplay(partsForMeToReview, `Parts for me to Review (${partsForMeToReview?.length})`)}
        {myPartsUnderReview?.length !== 0 &&
          PartsDisplay(myPartsUnderReview, `My Parts Under Review (${myPartsUnderReview?.length})`)}
        {allPartsUnderReview?.length !== 0 &&
          isAtLeastRank('LEADERSHIP', currentUser.role) &&
          PartsDisplay(allPartsUnderReview, `All Parts Under Review (${allPartsUnderReview?.length})`)}
      </Grid>

      <CreateMenu wbsNum={project.wbsNum} partsInProject={parts} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              label="View Submission Guide?"
              control={
                <NERSwitch
                  sx={{ m: 1 }}
                  checked={showSubmissionGuide}
                  onChange={() => setShowSubmissionGuide(!showSubmissionGuide)}
                />
              }
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          {/* The guide should be toggled off by default for admins, heads, and leads and toggled on for all other roles */}
          {showSubmissionGuide ? (
            <Grid item container direction="column" spacing={3} sx={{ paddingTop: '10px' }}>
              <Typography variant="h4" sx={{ pl: 2 }}>
                Submission Guide
              </Typography>

              <Grid container spacing={3} sx={{ paddingTop: '10px' }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ pl: 2 }}>
                    Sample Drawing
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <PartReviewFAQs />
                    <CommonMistakes />
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <LoadingIndicator /> /* Loading indicator will be replaced by a grid of all the part cards */
          )}
          {/* temporary test component to show that parts are being displayed */}
          <Stack>
            Parts for this project:
            {parts.map((part, _index) => (
              <Box>
                <Link component={RouterLink} to={`/projects/${wbsPipe(project.wbsNum)}/part/${part.index}`}>
                  index:{part.index}, commonName: {part.commonName}, status: {part.status}
                </Link>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
