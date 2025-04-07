import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import file from './test.pdf';
import { Box, Typography, IconButton, FormControl, TextField, Button } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { Part_Review_Popup, PartReviewCommonMistake } from 'shared';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../hooks/toasts.hooks';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface FileDisplayProps {
  popUps: Part_Review_Popup[];
  reviewerName: string;
  reviewMode: boolean;
}

const schema = yup.object().shape({
  title: yup.string().required('Title is Required!'),
  description: yup.string().required('Description is Required!')
});

export default function PDFViewer({ popUps, reviewerName, reviewMode }: FileDisplayProps) {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState<number>(-1);
  const [hoveringPopup, setHoveringPopup] = useState<number>(-1);
  const toast = useToast();
  const [variablePopups, setVariablePopups] = useState<Part_Review_Popup[]>([
    ...popUps,
    {
      partReviewPopupId: '3',
      reviewId: '1',
      xCoord: 5,
      yCoord: 5,
      title: '',
      description: ''
    }
  ]);
  const [editMode, setEditMode] = useState<number>(0);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [customComment, setCustomComment] = useState<boolean>(true);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: ''
    }
  });

  const changePositionOfLastPopup = (x: number, y: number) => {
    const changedLastPos = [...variablePopups];
    changedLastPos[changedLastPos.length - 1] = {
      ...changedLastPos[changedLastPos.length - 1],
      xCoord: x,
      yCoord: y
    };
    setVariablePopups(changedLastPos);
  };

  const deletePopup = (popUpId: string) => {
    return () => {
      const popups = variablePopups;
      const newPopups = popups.filter((popup) => popup.partReviewPopupId !== popUpId);
      setVariablePopups(newPopups);
      setShowPopup(-1);
    };
  };

  const editPopup = (popUpId: string) => {
    return () => {
      const popups = variablePopups;
      const popupToEdit = variablePopups.find((popup) => popup.partReviewPopupId === popUpId);
      if (!popupToEdit) return;
      const removed = popups.filter((popup) => popup.partReviewPopupId !== popUpId);
      setVariablePopups([...removed, popupToEdit]);
      setShowPopup(-1);
      reset({
        title: popupToEdit.title,
        description: popupToEdit.description
      });
    };
  };

  const onSubmit = async (data: { title: string; description: string }) => {
    try {
      const changedLastPos = [...variablePopups];
      changedLastPos[changedLastPos.length - 1] = {
        ...changedLastPos[changedLastPos.length - 1],
        title: data.title,
        description: data.description
      };
      changedLastPos.push({
        partReviewPopupId: Math.random().toString(),
        reviewId: '1',
        xCoord: 5,
        yCoord: 5,
        title: '',
        description: ''
      });
      setVariablePopups(changedLastPos);
      reset();
      setShowPopup(changedLastPos.length - 2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleCancel = () => {
    reset();
    changePositionOfLastPopup(5, 5);
  };

  const commentOnClick = () => {
    setEditMode(editMode === 1 ? 0 : 1);
    setCustomComment(true);
    changePositionOfLastPopup(5, 5);
  };

  const commonMistakeOnClick = () => {
    setEditMode(editMode === 2 ? 0 : 2);
    setCustomComment(false);
    changePositionOfLastPopup(5, 5);
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

      changePositionOfLastPopup(normalizedX, normalizedY);

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

  const mistakes: PartReviewCommonMistake[] = [
    {
      partReviewCommonMistakeId: '123',
      title: 'Inconsistent screw sizes',
      description:
        'make sure that all your screw sizes are the same if possible, to make it easier for when we make this part',
      starred: false,
      userCreatedId: '123'
    },
    {
      partReviewCommonMistakeId: '123',
      title: 'flimsy part',
      description: 'this is not secure enough, we need to reinforce it more',
      starred: false,
      userCreatedId: '123'
    },
    {
      partReviewCommonMistakeId: '123',
      title: 'incorrect size',
      description: 'this part is the wrong size',
      starred: false,
      userCreatedId: '123'
    },
    {
      partReviewCommonMistakeId: '123',
      title: 'Unecessary addition',
      description: "We don't need this on this part, get rid of it",
      starred: false,
      userCreatedId: '123'
    }
  ];

  return (
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
          {variablePopups.map((popup: Part_Review_Popup, index: number) => {
            return (
              <Box
                sx={{
                  position: 'absolute',
                  transformOrigin: 'left top',
                  left: `${popup.xCoord * pdfDimensions.width}px`,
                  top: `${popup.yCoord * pdfDimensions.height}px`,
                  transform: `scale(${1 / scale})`
                }}
              >
                <Box>
                  <Box
                    onClick={() => {
                      if (showPopup === index) {
                        setShowPopup(-1);
                      } else {
                        setShowPopup(index);
                      }
                    }}
                    onMouseEnter={() => {
                      setHoveringPopup(index);
                    }}
                    onMouseLeave={() => {
                      setHoveringPopup(-1);
                    }}
                    sx={{
                      transform: `translate(${-7.5}px, ${-7.5}px)`,
                      backgroundColor: 'red',
                      width: '15px',
                      height: '15px',
                      outline: `2px solid ${showPopup === index ? 'black' : 'white'}`,
                      borderRadius: '50%',
                      padding: '2px',
                      cursor: 'default',
                      zIndex: 1
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    transform: `translate(${-20}px, ${10}px)`,
                    width: '15rem',
                    bgcolor: 'rgb(42, 42, 42)',
                    borderRadius: '5%',
                    padding: '8px 12px',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 1,
                    visibility:
                      (showPopup === index && hoveringPopup === -1) ||
                      hoveringPopup === index ||
                      index === variablePopups.length - 1
                        ? 'visible'
                        : 'hidden'
                  }}
                >
                  {index === variablePopups.length - 1 && customComment && (
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <Controller
                          name="title"
                          control={control}
                          rules={{ required: 'Title is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              variant="standard"
                              fullWidth
                              label="Title"
                              error={!!errors.title}
                              helperText={errors.title?.message}
                            />
                          )}
                        />
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              rows={4}
                              label="Description"
                              error={!!errors.description}
                              helperText={errors.description?.message}
                            />
                          )}
                        />
                      </FormControl>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={handleCancel}
                          sx={{ color: 'grey.500', borderColor: 'grey.500' }}
                          type="button" // Important to prevent form submission
                        >
                          Cancel
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          type="submit" // This makes it submit the form
                        >
                          Done
                        </Button>
                      </Box>
                    </Box>
                  )}
                  {index === variablePopups.length - 1 && !customComment && (
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                      <FormControl fullWidth sx={{ mb: 1 }}>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              rows={4}
                              label="Description"
                              error={!!errors.description}
                              helperText={errors.description?.message}
                            />
                          )}
                        />
                      </FormControl>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={handleCancel}
                          sx={{ color: 'grey.500', borderColor: 'grey.500' }}
                          type="button" // Important to prevent form submission
                        >
                          Cancel
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          type="submit" // This makes it submit the form
                        >
                          Done
                        </Button>
                      </Box>
                    </Box>
                  )}
                  {index !== variablePopups.length - 1 && (
                    <Box>
                      <Typography variant="h6" color="white">
                        {popup.title}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          maxHeight: '10vh',
                          overflowY: 'auto',
                          '&::-webkit-scrollbar': {
                            width: '4px'
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'red',
                            borderRadius: '4px'
                          }
                        }}
                      >
                        <Typography variant="body1" fontSize={14} color="rgb(196, 196, 196)">
                          {popup.description}
                        </Typography>
                      </Box>
                      {!reviewMode && (
                        <Typography
                          variant="caption"
                          color="white"
                          sx={{ display: 'block', textAlign: 'right', fontStyle: 'italic' }}
                        >
                          — {reviewerName}
                        </Typography>
                      )}

                      {reviewMode && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            onClick={editPopup(popup.partReviewPopupId)}
                            sx={{ color: 'grey.500', borderColor: 'grey.500' }}
                            type="button"
                          >
                            Edit
                          </Button>

                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={deletePopup(popup.partReviewPopupId)}
                            type="button"
                          >
                            Delete
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
