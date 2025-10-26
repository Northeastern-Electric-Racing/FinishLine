import { Typography, Breadcrumbs, Grid, Box } from '@mui/material';
import { Part, validateWBS, wbsPipe } from 'shared';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useSinglePart } from '../../hooks/part-review.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useEffect, useState } from 'react';
import PDFViewer from './PartPageComponents/PdfDisplay';
import { useCurrentUser } from '../../hooks/users.hooks';
import PartSubmissionDetails from './PartPageComponents/PartSubmissionDetails';
import PartOverview from './PartPageComponents/PartOverview';
import PartHistoryView from './PartPageComponents/PartHistoryView';
import ReviewSidebar from './PartPageComponents/ReviewPage';
import PartActionsMenu from './PartPageComponents/PartActionsMenu';

const PartPage: React.FC = () => {
  interface ParamTypes {
    wbsNum: string;
    indexNum: string;
  }
  const { wbsNum, indexNum } = useParams<ParamTypes>();
  //location and history to maintain url with params for submission and review index
  const location = useLocation();
  const history = useHistory();

  const user = useCurrentUser();

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectIsError,
    error: projectError
  } = useSingleProject(validateWBS(wbsNum));

  const {
    data: part,
    isLoading: partLoading,
    isError: partIsError,
    error: partError
  } = useSinglePart(wbsNum, parseInt(indexNum));

  const [subIndex, setSubIndex] = useState<number>(0);
  const [reviewIndex, setReviewIndex] = useState<number>(-1);

  //used to track pages to be displayed. An "isolated" review is one that has fileIds,
  //and therefore is displayed on its own page seperate from the submission
  const [partWithIsolatedReviews, setPartWithIsolatedReviews] = useState<Part>();

  useEffect(() => {
    if (!part) return;
    //Same as part but only with reviews that either have fileIds or are in progress
    setPartWithIsolatedReviews({
      ...part,
      submissions: part.submissions.map((submission) => {
        return {
          ...submission,
          reviews: submission.reviews.filter((review) => {
            return review.fileIds.length > 0 || !review.completedAt;
          })
        };
      })
    });
  }, [part]);

  //if the url parameters are not valid, set default values. If they are use those
  useEffect(() => {
    if (!partWithIsolatedReviews) return;
    const searchParams = new URLSearchParams(location.search);
    const submissionParam = searchParams.get('submissionIndex');
    const reviewParam = searchParams.get('reviewIndex');

    //indices will refer to the part with isolated reviews
    setSubIndex(partWithIsolatedReviews.submissions.length - 1);
    if (
      partWithIsolatedReviews.submissions.length > 0 &&
      partWithIsolatedReviews.submissions[partWithIsolatedReviews.submissions.length - 1].reviews.length > 0
    ) {
      setReviewIndex(partWithIsolatedReviews.submissions[partWithIsolatedReviews.submissions.length - 1].reviews.length - 1);
    } else {
      setReviewIndex(-1);
    }

    if (submissionParam !== null) {
      const parsedSubIndex = parseInt(submissionParam);
      if (
        !isNaN(parsedSubIndex) &&
        parsedSubIndex >= 0 &&
        parsedSubIndex <= partWithIsolatedReviews.submissions.length - 1
      ) {
        setSubIndex(parsedSubIndex);
        setReviewIndex(-1);
        if (reviewParam !== null) {
          const parsedReviewIndex = parseInt(reviewParam);
          if (
            !isNaN(parsedReviewIndex) &&
            parsedReviewIndex >= -1 &&
            parsedReviewIndex <= partWithIsolatedReviews.submissions[parsedSubIndex].reviews.length - 1
          ) {
            setReviewIndex(parsedReviewIndex);
          }
        }
      }
    }
  }, [partWithIsolatedReviews, location.search, user]);

  if (projectLoading || !project || partLoading || !part || !partWithIsolatedReviews) return <LoadingIndicator />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (partIsError) return <ErrorPage message={partError?.message} />;

  //updates the url params
  const updateURL = (newSubIndex: number, newReviewIndex: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('submissionIndex', newSubIndex.toString());
    if (newReviewIndex !== -1) {
      searchParams.set('reviewIndex', newReviewIndex.toString());
    } else {
      searchParams.delete('reviewIndex');
    }
    history.replace(`${location.pathname}?${searchParams.toString()}`);
  };

  //generic to load in place of pdf. Used to display parts with no submissions
  const pdfLoading = (child: JSX.Element) => {
    return (
      <Box
        sx={{
          width: '75vh',
          height: '75vh',
          border: 2,
          borderColor: 'grey.50',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'grey.500'
        }}
      >
        <Box
          style={{
            display: 'grid',
            placeItems: 'center',
            height: '75vh'
          }}
        >
          {child}
        </Box>
      </Box>
    );
  };

  //is there a next submission / review to go to
  const hasNext = () => {
    return !(
      subIndex === partWithIsolatedReviews.submissions.length - 1 &&
      reviewIndex === partWithIsolatedReviews.submissions[subIndex].reviews.length - 1
    );
  };

  //is there a previous submission / review to go to
  const hasPrev = () => {
    const currentReview = partWithIsolatedReviews?.submissions[subIndex].reviews[reviewIndex];
    if (!currentReview) {
      return subIndex !== 0;
    }
    return subIndex !== 0 || currentReview.fileIds.length > 0 || !currentReview.completedAt;
  };

  //gets the next submission / review and updates state and url
  const next = () => {
    if (reviewIndex === partWithIsolatedReviews.submissions[subIndex].reviews.length - 1) {
      updateURL(subIndex + 1, -1);
      setSubIndex(subIndex + 1);
      setReviewIndex(-1);
    } else {
      setReviewIndex(reviewIndex + 1);
      updateURL(subIndex, reviewIndex + 1);
    }
  };

  //gets the prev submission / review and updates the state and url
  const prev = () => {
    if (reviewIndex === -1) {
      const temp = subIndex;
      updateURL(temp - 1, part.submissions[temp - 1].reviews.length - 1);
      setSubIndex(temp - 1);
      setReviewIndex(part.submissions[temp - 1].reviews.length - 1);
    } else {
      updateURL(subIndex, reviewIndex - 1);
    }
  };

  //is the current submission / review currently an in progress review
  const inReview = () => {
    return (
      reviewIndex !== -1 &&
      partWithIsolatedReviews.submissions.length !== 0 &&
      partWithIsolatedReviews.submissions[subIndex].reviews[reviewIndex] &&
      !partWithIsolatedReviews.submissions[subIndex].reviews[reviewIndex].completedAt
    );
  };

  const pageTitle = `${project.abbreviation ?? project.name}_${part.commonName}_${part.index.toString().padStart(5, '0')}`;

  return (
    <PageLayout
      title={pageTitle}
      previousPages={[
        { name: 'Projects', route: routes.PROJECTS },
        { name: `${wbsPipe(project.wbsNum)} - ${project.name}`, route: `${routes.PROJECTS}/${wbsNum}` },
        { name: 'Part Review', route: `${routes.PROJECTS}/${wbsNum}/parts-review` }
      ]}
      headerRight={
        <PartActionsMenu part={part} submissionIndex={subIndex} reviewIndex={reviewIndex} wbsNum={validateWBS(wbsNum)} />
      }
    >
      <Breadcrumbs sx={{ mb: 2 }}></Breadcrumbs>
      <Grid container px={2} gap={5}>
        <Grid item display="flex">
          {part.submissions.length === 0 && pdfLoading(<Typography>No Submissions Yet</Typography>)}
          {part.submissions.length !== 0 && (
            <PDFViewer
              submission={part.submissions[subIndex]}
              review={reviewIndex === -1 ? undefined : partWithIsolatedReviews.submissions[subIndex].reviews[reviewIndex]}
              hasNext={hasNext}
              next={next}
              hasPrev={hasPrev}
              prev={prev}
            />
          )}
        </Grid>
        {/* either display regular review/submission or in progress review */}
        {!inReview() && (
          <Grid item sx={{ flex: 1, minWidth: 0, maxWidth: '40%' }}>
            <PartOverview part={part} />
            {/* details can only display specific submission / review */}
            {part.submissions.length !== 0 && <PartSubmissionDetails submission={part.submissions[subIndex]} />}
            <PartHistoryView part={part} />
          </Grid>
        )}
        {inReview() && (
          <Grid item sx={{ flex: 1, minWidth: 0, maxWidth: '40%' }}>
            <ReviewSidebar
              submission={part.submissions[subIndex]}
              review={partWithIsolatedReviews.submissions[subIndex].reviews[reviewIndex]}
            />
          </Grid>
        )}
      </Grid>
    </PageLayout>
  );
};

export default PartPage;
