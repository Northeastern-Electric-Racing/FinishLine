import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import file from './test.pdf';
import { Box, Typography, IconButton } from '@mui/material';
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
import { useAllCommonMistakes } from '../../../hooks/part-review.hooks';

//set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

//null submission indicates no submissions have been made for the part.
//if the review exists, display that review in review mode. Otherwise display the submission in submission mode
interface FileDisplayProps {
  submission: PartSubmission | null;
  review: PartReview | null;
}

const PDFViewer: React.FC<FileDisplayProps> = ({ submission, review }) => {
  if (!submission) {
    return (
      <Box
        sx={{
          width: '75vh',
          height: '75vh',
          border: 2,
          borderColor: 'grey.400',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'grey.50'
        }}
      >
        <Typography>No submission yet.</Typography>
      </Box>
    );
  }

  //if in a review, only show that reviews popups. If in general submission display, show all popups from every review
  const allPopups = review
    ? review.popUps
    : submission.reviews.reduce((aac: Part_Review_Popup[], review: PartReview) => {
        return aac.concat(review.popUps);
      }, []);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [variablePopups, setVariablePopups] = useState<Part_Review_Popup[]>([...allPopups]);
  const [newPopupCoords, setNewPopupCoords] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [editMode, setEditMode] = useState<number>(0);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [customComment, setCustomComment] = useState<boolean>(true);
  const { data: mistakes, isError: isErrorCommonMistakes, error: errorCommonMistakes } = useAllCommonMistakes();

  if (isErrorCommonMistakes) return <ErrorPage error={errorCommonMistakes} />;
  if (!mistakes || isErrorCommonMistakes) return <LoadingIndicator />;

  const reviewerNameFromPopup = (popup: Part_Review_Popup) => {
    const review = submission.reviews.find((review) => review.partReviewId === popup.reviewId);
    
  };

  const deletePopupExternal = (popUpId: string) => {
    //delete from db here

    const removedPopups = variablePopups.filter((popup) => {
      return popup.partReviewPopupId !== popUpId;
    });
    setVariablePopups([...removedPopups]);
  };

  const createPopup = (x: number, y: number, title: string, description?: string) => {
    //create popup in db here
    const newPopup: Part_Review_Popup = {
      partReviewPopupId: '-1',
      xCoord: x,
      yCoord: y,
      title,
      description: description ?? '',
      reviewId: review.partReviewId
    };
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
    setScale((prev) => prev * 1.2);
  };

  const handleZoomOut = () => {
    setScale((prev) => prev / 1.2);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
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
    if (!isDragging) return;

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

  return (
    <Box display={'flex'} flexDirection={'row'}>
      {review && (
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
        <Box
          sx={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            width: '100%',
            height: '100%',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <Document file={file} error={<Typography color="error">Failed to load PDF</Typography>}>
            <Page
              pageNumber={1}
              renderTextLayer={false}
              onRenderSuccess={handlePdfRenderSuccess}
              renderAnnotationLayer={false}
            />
          </Document>

          {variablePopups.map((popup: Part_Review_Popup) => (
            <ReviewPopup
              key={popup.partReviewPopupId}
              popup={popup}
              pdfDimensions={pdfDimensions}
              scale={scale}
              reviewMode={!!review}
              reviewerName={`${review.userCreated.firstName} ${review.userCreated.lastName}`}
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
      </Box>
    </Box>
  );
};

export default PDFViewer;
