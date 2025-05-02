import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, FormControl, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Part_Review_Popup } from 'shared';
import * as yup from 'yup';
import { useToast } from '../../../hooks/toasts.hooks';
import { useUpdateReviewPopup } from '../../../hooks/part-review.hooks';

interface ReviewPopupProps {
  popup: Part_Review_Popup;
  pdfDimensions: { width: number; height: number };
  scale: number;
  reviewMode: boolean;
  reviewerName: string;
  newPopup: boolean;
  onDelete: (id: string) => void;
}

const schema = yup.object().shape({
  title: yup.string().required('Title is Required!'),
  description: yup.string()
});

const ReviewPopup: React.FC<ReviewPopupProps> = ({
  popup,
  pdfDimensions,
  scale,
  reviewMode,
  reviewerName,
  onDelete,
  newPopup
}) => {
  const [hovering, setHovering] = useState<boolean>(false);
  const [selelcted, setSelected] = useState<boolean>(false);
  const [editting, setEditting] = useState<boolean>(newPopup);
  const [currentPopup, setCurrentPopup] = useState<Part_Review_Popup>(popup);
  const toast = useToast();

  const { mutateAsync: editPopup } = useUpdateReviewPopup();

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

  const onSubmit = async (data: { title: string; description?: string }) => {
    try {
      editPopup({
        popupId: popup.partReviewPopupId,
        payload: {
          xCoord: popup.xCoord,
          yCoord: popup.yCoord,
          fileIndex: popup.fileIndex,
          title: data.title,
          description: data.description
        }
      });

      setCurrentPopup({
        ...currentPopup,
        title: data.title,
        description: data.description ?? ''
      });
      setEditting(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        transformOrigin: 'left top',
        left: `${currentPopup.xCoord * pdfDimensions.width}px`,
        top: `${currentPopup.yCoord * pdfDimensions.height}px`,
        transform: `scale(${1 / scale})`
      }}
    >
      <Box>
        <Box
          onClick={() => {
            setSelected(!selelcted);
          }}
          onMouseEnter={() => {
            setHovering(true);
          }}
          onMouseLeave={() => {
            setHovering(false);
          }}
          sx={{
            transform: `translate(${-7.5}px, ${-7.5}px)`,
            backgroundColor: 'red',
            width: '15px',
            height: '15px',
            outline: `2px solid ${selelcted ? 'black' : 'white'}`,
            borderRadius: '50%',
            padding: '2px',
            cursor: 'default',
            zIndex: 1
          }}
        />
      </Box>
      {(selelcted || hovering) && (
        <Box
          sx={{
            transform: `translate(${-20}px, ${10}px)`,
            width: '15rem',
            bgcolor: 'rgb(42, 42, 42)',
            borderRadius: '5%',
            padding: '8px 12px',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            zIndex: 1
          }}
        >
          {editting && (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} zIndex={3}>
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
                  onClick={() => setEditting(false)}
                  sx={{ color: 'grey.500', borderColor: 'grey.500' }}
                  type="button"
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  type="submit"
                >
                  Done
                </Button>
              </Box>
            </Box>
          )}
          {!editting && (
            <Box>
              <Typography variant="h6" color="white" zIndex={2}>
                {currentPopup.title}
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
                  {currentPopup.description}
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
                    onClick={() => {
                      reset({
                        title: currentPopup.title,
                        description: currentPopup.description
                      });
                      setEditting(true);
                    }}
                    sx={{ color: 'grey.500', borderColor: 'grey.500' }}
                    type="button"
                  >
                    Edit
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => {
                      onDelete(currentPopup.partReviewPopupId);
                    }}
                    type="button"
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ReviewPopup;
