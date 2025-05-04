import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, Box, Button, FormControl, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useToast } from '../../../hooks/toasts.hooks';
import { PartReviewCommonMistake } from 'shared';

interface ReviewPopupProps {
  xCoord: number;
  yCoord: number;
  pdfDimensions: { width: number; height: number };
  scale: number;
  commonMistakes: PartReviewCommonMistake[];
  onDelete: () => void;
  createPopup: (xCoord: number, yCoord: number, title: string, description?: string) => void;
  custom: boolean;
}

const schema = yup.object().shape({
  title: yup.string().required('Title is Required!'),
  description: yup.string().optional()
});

const ReviewPopup: React.FC<ReviewPopupProps> = ({
  xCoord,
  yCoord,
  pdfDimensions,
  scale,
  commonMistakes,
  onDelete,
  createPopup,
  custom
}) => {
  const [hovering, setHovering] = useState<boolean>(false);
  const [selelcted, setSelected] = useState<boolean>(true);
  const [textEdittor, setTextEdittor] = useState<boolean>(custom);
  const toast = useToast();

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

  useEffect(() => {
    setTextEdittor(custom);
    reset();
  }, [custom, reset]);

  const onSubmit = async (data: { title: string; description?: string }) => {
    try {
      createPopup(xCoord, yCoord, data.title, data.description);
      reset({
        title: '',
        description: ''
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: PartReviewCommonMistake | null) => {
    if (newValue) {
      setTextEdittor(true);
      reset({
        title: newValue.title,
        description: newValue.description
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        transformOrigin: 'left top',
        left: `${xCoord * pdfDimensions.width}px`,
        top: `${yCoord * pdfDimensions.height}px`,
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
      <Box
        sx={{
          transform: `translate(${-20}px, ${10}px)`,
          width: '15rem',
          bgcolor: 'rgb(42, 42, 42)',
          borderRadius: '5%',
          padding: '8px 12px',
          boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1,
          visibility: selelcted || hovering ? 'visible' : 'hidden'
        }}
      >
        {textEdittor && (
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
                onClick={() => {
                  reset({
                    title: '',
                    description: ''
                  });
                  setTextEdittor(custom);
                  onDelete();
                }}
                sx={{ color: 'grey.500', borderColor: 'grey.500' }}
                type="button"
              >
                Cancel
              </Button>

              <Button variant="contained" color="error" size="small" type="submit">
                Done
              </Button>
            </Box>
          </Box>
        )}
        {!textEdittor && (
          <Autocomplete
            options={commonMistakes}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => <TextField {...params} label="Select Common Mistake" variant="outlined" />}
            onChange={handleChange}
            isOptionEqualToValue={(option, value) => option.partReviewCommonMistakeId === value.partReviewCommonMistakeId}
          />
        )}
      </Box>
    </Box>
  );
};

export default ReviewPopup;
