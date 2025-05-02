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
  }, [partWithAllReviews, location.search]);

  if (projectLoading || !project || partLoading || !partWithAllReviews) return <LoadingIndicator />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (partIsError) return <ErrorPage message={partError?.message} />;

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

  const pdfLoadingError = (child: JSX.Element) => {
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

  const hasNext = () => {
    return !(subIndex === part.submissions.length - 1 && reviewIndex === part.submissions[subIndex].reviews.length - 1);
  };

  const hasPrev = () => {
    return !(subIndex === 0 && reviewIndex === -1);
  };

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
          {part.submissions.length === 0 && pdfLoadingError(<Typography>No Submissions Yet</Typography>)}
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
        {!inReview() && (
          <Grid item maxWidth={'35%'}>
            <PartPageOverview part={part} />
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
