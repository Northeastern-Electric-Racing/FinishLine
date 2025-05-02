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
import PDFViewer from './Components/PdfDisplay';
import { useCurrentUser } from '../../hooks/users.hooks';
import PartSubmissionDetails from './Components/PartSubmissionDetails';
import PartPageOverview from './Components/PartPageOverview';
import PartHistoryView from './Components/PartHistoryView';
import ReviewSidebar from './Components/ReviewPage';

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
    data: partWithAllReviews,
    isLoading: partLoading,
    isError: partIsError,
    error: partError
  } = useSinglePart(wbsNum, parseInt(indexNum));

  const [subIndex, setSubIndex] = useState<number>(0);
  const [reviewIndex, setReviewIndex] = useState<number>(-1);
  const [part, setPart] = useState<Part | null>(null);

  //if the url parameters are not valid, set default values. If they are use those
  useEffect(() => {
    if (!partWithAllReviews) return;
    const searchParams = new URLSearchParams(location.search);

    const submissionParam = searchParams.get('submissionIndex');
    const reviewParam = searchParams.get('reviewIndex');

    if (submissionParam !== null) {
      const parsedSubIndex = parseInt(submissionParam);
      if (!isNaN(parsedSubIndex) && parsedSubIndex >= 0 && parsedSubIndex <= partWithAllReviews.submissions.length - 1) {
        setSubIndex(parsedSubIndex);
        if (reviewParam !== null) {
          const parsedReviewIndex = parseInt(reviewParam);
          if (
            !isNaN(parsedReviewIndex) &&
            parsedReviewIndex >= -1 &&
            parsedReviewIndex <= partWithAllReviews.submissions[parsedSubIndex].reviews.length - 1
          ) {
            setReviewIndex(parsedReviewIndex);
          }
        }
      }
    }
    //update the part in usage to only include reviews that are either not in progress or made by the current user
    const part: Part = {
      ...partWithAllReviews,
      submissions: partWithAllReviews.submissions.map((sub) => {
        return {
          ...sub,
          review: sub.reviews.filter((review) => {
            return !!review.completedAt || review.userCreated.userId === user.userId;
          })
        };
      })
    };
    setPart(part);
  }, [partWithAllReviews, location.search, user]);

  if (projectLoading || !project || partLoading || !partWithAllReviews || !part) return <LoadingIndicator />;
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
    return !(subIndex === part.submissions.length - 1 && reviewIndex === part.submissions[subIndex].reviews.length - 1);
  };

  //is there a previous submission / review to go to
  const hasPrev = () => {
    return !(subIndex === 0 && reviewIndex === -1);
  };

  //gets the next submission / review and updates state and url
  const next = () => {
    if (reviewIndex === part.submissions[subIndex].reviews.length - 1) {
      updateURL(subIndex + 1, -1);
      setSubIndex(subIndex + 1);
      setReviewIndex(-1);
    } else {
      updateURL(subIndex, reviewIndex + 1);
      setReviewIndex(reviewIndex + 1);
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
      setReviewIndex(reviewIndex - 1);
    }
  };

  //is the current submission / review currently an in progress review
  const inReview = () => {
    return (
      reviewIndex !== -1 && part.submissions.length !== 0 && !part.submissions[subIndex].reviews[reviewIndex].completedAt
    );
  };

  const pageTitle = `${project.abbreviation ?? project.name}_${part.commonName}_${part.index.toString().padStart(5, '0')}`;

  return (
    <PageLayout
      title={pageTitle}
      previousPages={[
        { name: 'Projects', route: routes.PROJECTS },
        { name: `${wbsPipe(project.wbsNum)} - ${project.name}`, route: `${routes.PROJECTS}/${wbsNum}` },
        { name: 'Files', route: `${routes.PROJECTS}/${wbsNum}/parts-review` }
      ]}
    >
      <Breadcrumbs sx={{ mb: 2 }}></Breadcrumbs>
      <Grid container px={2} gap={5}>
        <Grid item maxWidth={'50%'}>
          {part.submissions.length === 0 && pdfLoading(<Typography>No Submissions Yet</Typography>)}
          {part.submissions.length !== 0 && (
            <PDFViewer
              submission={part.submissions[subIndex]}
              submissionIdx={subIndex}
              review={reviewIndex === -1 ? undefined : part.submissions[subIndex].reviews[reviewIndex]}
              hasNext={hasNext}
              next={next}
              hasPrev={hasPrev}
              prev={prev}
            />
          )}
        </Grid>
        {/* either display regular review/submission or in progress review */}
        {!inReview() && (
          <Grid item maxWidth={'35%'}>
            <PartPageOverview part={part} />
            {/* details can only display specific submission / review */}
            {part.submissions.length !== 0 && (
              <PartSubmissionDetails submission={part.submissions[subIndex]} reviewIndex={reviewIndex} />
            )}
            <PartHistoryView part={part} />
          </Grid>
        )}
        {inReview() && (
          <Grid item maxWidth={'35%'} width={'35%'}>
            <ReviewSidebar submission={part.submissions[subIndex]} reviewIndex={reviewIndex} />
          </Grid>
        )}
      </Grid>
    </PageLayout>
  );
};

export default PartPage;
