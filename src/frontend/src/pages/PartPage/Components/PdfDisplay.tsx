import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { Box, Typography, IconButton, Grid } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { Part_Review_Popup, PartReview, PartSubmission } from 'shared';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import ReviewPopup from './ReviewPopup';
import CreateReviewPopup from './CreateReviewPopup';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {
  useAllCommonMistakes,
  useCreateReviewPopup,
  useDeleteReviewPopup,
  useDownloadFile
} from '../../../hooks/part-review.hooks';
import DownloadButton from '../../../components/DownloadButton';
import { NERButton } from '../../../components/NERButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useCurrentUser } from '../../../hooks/users.hooks';

//set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

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

//null submission indicates no submissions have been made for the part.
//if the review exists, display that review in review mode. Otherwise display the submission in submission mode
interface FileDisplayProps {
  submission: PartSubmission;
  submissionIdx: number;
  review?: PartReview;
  hasNext: () => boolean;
  next: () => void;
  hasPrev: () => boolean;
  prev: () => void;
}

const PDFViewer: React.FC<FileDisplayProps> = ({ submission, submissionIdx, review, hasNext, next, hasPrev, prev }) => {
  //if in a review, only show that reviews popups. If in general submission display, show all popups from every review
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [variablePopups, setVariablePopups] = useState<Part_Review_Popup[]>([]);
  const [newPopupCoords, setNewPopupCoords] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [editMode, setEditMode] = useState<number>(0);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [customComment, setCustomComment] = useState<boolean>(true);
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [fileIdx, setFileIdx] = useState(0);
  const user = useCurrentUser();

  useEffect(() => {
    setVariablePopups(
      review
        ? review.popUps
        : submission.reviews.reduce((aac: Part_Review_Popup[], review: PartReview) => {
            if (review.completedAt) return aac.concat(review.popUps);
            return aac;
          }, [])
    );
  }, [review, submission]);

  const { mutateAsync: addPopupToDb } = useCreateReviewPopup();
  // const { mutateAsync: updatePopupInDb } = useUpdateReviewPopup();
  const { mutateAsync: deletePopupFromDb } = useDeleteReviewPopup();

  const {
    data: mistakes,
    isLoading: isLoadingCommonMistake,
    isError: isErrorCommonMistakes,
    error: errorCommonMistakes
  } = useAllCommonMistakes();

  const {
    data: pdf,
    isLoading: pdfLoading,
    isError: pdfIsError,
    error: pdfError
  } = useDownloadFile(submission.fileIds[fileIdx]);

  if (!mistakes || isLoadingCommonMistake) return <LoadingIndicator />;
  if (isErrorCommonMistakes) return <ErrorPage error={errorCommonMistakes} />;

  const reviewMode = review?.userCreated.userId === user.userId && !review.completedAt;

  const reviewerNameFromPopup = (popup: Part_Review_Popup) => {
    const review = submission.reviews.find((review) => review.partReviewId === popup.reviewId);
    return `${review?.userCreated.firstName} ${review?.userCreated.lastName}`;
  };

  const deletePopupExternal = async (popUpId: string) => {
    await deletePopupFromDb(popUpId);

    const removedPopups = variablePopups.filter((popup) => {
      return popup.partReviewPopupId !== popUpId;
    });
    setVariablePopups([...removedPopups]);
  };

  const createPopup = async (x: number, y: number, title: string, description?: string) => {
    if (!review || !reviewMode) return;
    const newPopup = await addPopupToDb({
      reviewId: review.partReviewId,
      payload: {
        xCoord: x,
        yCoord: y,
        fileIndex: fileIdx,
        title,
        description
      }
    });
    setVariablePopups([...variablePopups, newPopup]);
    setNewPopupCoords({ x: 5, y: 5 });
  };

  const commentOnClick = () => {
    setEditMode(editMode === 1 ? 0 : 1);
    setCustomComment(true);
    setNewPopupCoords({ x: 5, y: 5 });
  };

  const commonMistakeOnClick = () => {
    setEditMode(editMode === 2 ? 0 : 2);
    setCustomComment(false);
    setNewPopupCoords({ x: 5, y: 5 });
  };

  const fileUploadOnClick = () => {
    setEditMode(editMode === 3 ? 0 : 3);
  };

  const handleZoomIn = () => {
    if (!loadSuccess) return;
    setScale((prev) => prev * 1.2);
  };

  const handleZoomOut = () => {
    if (!loadSuccess) return;
    setScale((prev) => prev / 1.2);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!loadSuccess) return;

    if (editMode === 1 || editMode === 2) {
      const container = e.currentTarget.getBoundingClientRect();

      const clickX = e.clientX - container.left;
      const clickY = e.clientY - container.top;

      const containerCenterX = container.width / 2;
      const containerCenterY = container.height / 2;

      const adjustedX = (clickX - containerCenterX) / scale + containerCenterX - position.x;
      const adjustedY = (clickY - containerCenterY) / scale + containerCenterY - position.y;

      const normalizedX = adjustedX / pdfDimensions.width;
      const normalizedY = adjustedY / pdfDimensions.height;

      setNewPopupCoords({ x: normalizedX, y: normalizedY });

      setEditMode(0);
    }

    if (editMode === 0) {
      setIsDragging(true);
    }
    setStartPos({
      x: e.clientX - position.x * scale,
      y: e.clientY - position.y * scale
    });
  };

  const handlePdfRenderSuccess = (page: any) => {
    setPdfDimensions({
      width: page.originalWidth,
      height: page.originalHeight
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !loadSuccess) return;

    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;

    setPosition({
      x: newX * (1 / scale),
      y: newY * (1 / scale)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetPos = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <Grid display={'flex'} flexDirection={'row'} gap={2} justifyContent={'space-between'} width={'100%'}>
        {/* Group the download button and title together */}
        <Box display="flex" alignItems="center">
          {pdf && <DownloadButton blob={pdf} filename={`${submission.name}_${fileIdx}`} />}
          <Typography variant={'h4'}>
            {submission.name} #{submissionIdx + 1} {review ? ' Review' : ''}
          </Typography>
        </Box>

        {/* Group the navigation buttons together */}
        <Box display="flex" gap={1}>
          {hasPrev() && (
            <NERButton
              variant="contained"
              sx={{ display: 'flex', height: '50%', transform: 'translateY(50%)' }}
              onClick={() => {
                resetPos();
                prev();
              }}
            >
              <IconButton>
                <ArrowBackIosIcon />
                <Typography variant={'h6'}>Previous</Typography>
              </IconButton>
            </NERButton>
          )}
          {hasNext() && (
            <NERButton
              variant="contained"
              sx={{ display: 'flex', height: '50%', transform: 'translateY(50%)' }}
              onClick={() => {
                resetPos();
                next();
              }}
            >
              <IconButton>
                <Typography variant={'h6'}>Next</Typography>
                <ArrowForwardIosIcon />
              </IconButton>
            </NERButton>
          )}
        </Box>
      </Grid>

      <Box display={'flex'} flexDirection={'row'}>
        {reviewMode && (
          <Box display={'flex'} flexDirection={'column'}>
            <Box
              sx={{
                width: '4rem',
                height: '4rem',
                bgcolor: editMode === 1 ? 'red' : 'rgba(0,0,0,0.2)',
                marginLeft: '2rem',
                marginRight: '2rem',
                border: 2,
                borderColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={commentOnClick}
            >
              <AddCommentRoundedIcon sx={{ width: '60%', height: '60%' }} />
            </Box>
            <Box
              sx={{
                width: '4rem',
                height: '4rem',
                bgcolor: editMode === 2 ? 'red' : 'rgba(0,0,0,0.2)',
                marginLeft: '2rem',
                marginRight: '2rem',
                border: 2,
                borderColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={commonMistakeOnClick}
            >
              <CommentRoundedIcon sx={{ width: '60%', height: '60%' }} />
            </Box>
            <Box
              sx={{
                width: '4rem',
                height: '4rem',
                bgcolor: editMode === 3 ? 'red' : 'rgba(0,0,0,0.2)',
                marginLeft: '2rem',
                marginRight: '2rem',
                border: 2,
                borderColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={fileUploadOnClick}
            >
              <UploadFileRoundedIcon sx={{ width: '60%', height: '60%' }} />
            </Box>
          </Box>
        )}
        {/* <NERButton onClick={() => setEditMode(!editMode)}>{editMode ? 'edit mode' : 'normal mode'}</NERButton> */}
        <Box
          sx={{
            width: '75vh',
            height: '75vh',
            border: 2,
            borderColor: 'grey.400',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'grey.50',
            cursor:
              editMode === 0 ? (isDragging ? 'grabbing' : 'grab') : editMode === 1 || editMode === 2 ? 'crosshair' : 'auto'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1,
              display: 'flex',
              gap: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 0.5,
              boxShadow: 1
            }}
          >
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Cycle submissions */}
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translate(-50%, -150%)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              bgcolor: 'grey.50',
              borderRadius: 5,
              p: 0.5,
              boxShadow: 1
            }}
          >
            <IconButton
              onClick={() => {
                resetPos();
                setLoadSuccess(false);
                setFileIdx((prev) => prev - 1);
              }}
              size="small"
              disabled={fileIdx === 0}
            >
              <ArrowBackIosIcon fontSize="small" sx={{ color: fileIdx !== 0 ? 'black' : 'grey' }} />
            </IconButton>
            <Typography
              sx={{ color: 'black', mx: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              fontSize="1.25rem"
            >
              {fileIdx + 1}
            </Typography>
            <IconButton
              onClick={() => {
                resetPos();
                setLoadSuccess(false);
                setFileIdx((prev) => prev + 1);
              }}
              size="small"
              disabled={fileIdx === submission.fileIds.length - 1}
            >
              <ArrowForwardIosIcon
                fontSize="small"
                sx={{ color: fileIdx !== submission.fileIds.length - 1 ? 'black' : 'grey' }}
              />
            </IconButton>
          </Box>
          <Box
            sx={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              width: '100%',
              height: '100%',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {pdfLoading && pdfLoadingError(<LoadingIndicator />)}
            {pdfIsError && pdfLoadingError(<ErrorPage error={pdfError} />)}
            {pdf &&
              pdf?.type !== 'application/pdf' &&
              pdfLoadingError(<Typography>Submission is not a pdf. Download to view</Typography>)}
            {pdf && pdf?.type === 'application/pdf' && (
              <Document
                file={pdf}
                onLoadSuccess={() => {
                  setLoadSuccess(true);
                }}
                onLoadError={() => {
                  setLoadSuccess(false);
                }}
                error={pdfLoadingError(<Typography>Could not load pdf</Typography>)}
              >
                <Page
                  pageNumber={1}
                  renderTextLayer={false}
                  onRenderSuccess={handlePdfRenderSuccess}
                  renderAnnotationLayer={false}
                />
              </Document>
            )}

            {loadSuccess && (
              <Box>
                {variablePopups.map((popup: Part_Review_Popup) => (
                  <ReviewPopup
                    key={popup.partReviewPopupId}
                    popup={popup}
                    pdfDimensions={pdfDimensions}
                    scale={scale}
                    reviewMode={!!review}
                    reviewerName={reviewerNameFromPopup(popup)}
                    onDelete={deletePopupExternal}
                    newPopup={false}
                  />
                ))}
                <CreateReviewPopup
                  xCoord={newPopupCoords.x}
                  yCoord={newPopupCoords.y}
                  pdfDimensions={pdfDimensions}
                  scale={scale}
                  commonMistakes={mistakes}
                  onDelete={function (): void {
                    setNewPopupCoords({ x: 5, y: 5 });
                  }}
                  createPopup={createPopup}
                  custom={customComment}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Typography>{JSON.stringify(review) ?? ''}</Typography>
    </Box>
  );
};

export default PDFViewer;
