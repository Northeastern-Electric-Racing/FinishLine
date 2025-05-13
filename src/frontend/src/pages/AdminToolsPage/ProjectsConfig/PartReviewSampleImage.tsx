import { Box, Button, Typography } from '@mui/material';
import { usePartReviewSampleImageId, useSetPartReviewSampleImage } from '../../../hooks/part-review.hooks';
import { useGetImageUrl } from '../../../hooks/onboarding.hook';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useToast } from '../../../hooks/toasts.hooks';

const PartReviewSampleImage: React.FC = () => {
  const {
    data: sampleImageId,
    isLoading: sampleImageLoading,
    isError: sampleImageIsError,
    error: sampleImageError
  } = usePartReviewSampleImageId();
  const { mutateAsync: setPartReviewSampleImage, isLoading: setPartReviewSampleImageLoading } =
    useSetPartReviewSampleImage();
  const toast = useToast();
  const { data: sampleImageUrl } = useGetImageUrl(sampleImageId ?? null);

  if (sampleImageLoading || setPartReviewSampleImageLoading) {
    return <LoadingIndicator />;
  }

  if (sampleImageIsError) {
    return <ErrorPage message="Error loading part review sample image." error={sampleImageError} />;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ pl: 2 }}>
        Sample Drawing
      </Typography>
      {sampleImageUrl ? (
        <Box
          component="img"
          sx={{
            width: '95%',
            display: 'block',
            alignItems: 'center',
            bgcolor: 'grey.800',
            height: '50vh',
            mx: 3,
            my: 1
          }}
          alt="Apply Interest"
          src={sampleImageUrl}
        />
      ) : (
        <Box
          sx={{
            width: '95%',
            display: 'block',
            alignItems: 'center',
            bgcolor: 'grey.800',
            height: '50vh',
            mx: 3,
            my: 1
          }}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <Button
          variant="contained"
          color="success"
          component="label"
          startIcon={<FileUploadIcon />}
          sx={{
            width: 'fit-content',
            textTransform: 'none',
            mt: '9.75px'
          }}
        >
          Upload
          <input
            type="file"
            accept="image/*"
            name="partReviewSampleImage"
            hidden
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                if (e.target.files[0].size > 5 * 1024 * 1024) {
                  toast.error(`File "${e.target.files[0].name}" exceeds the maximum size limit of 5MB`);
                  return;
                }
                if (!/^[\w.]+$/.test(e.target.files[0].name)) {
                  toast.error(`File names can only contain letters and numbers`);
                  return;
                }
                if (e.target.files[0].name.length > 20) {
                  toast.error(`File names cannot be longer than 20 characters`);
                  return;
                }
                try {
                  await setPartReviewSampleImage(e.target.files[0]);
                  toast.success('Part review sample image uploaded successfully');
                } catch (error) {
                  toast.error('Error uploading part review sample image');
                }
              }
            }}
          />
        </Button>
      </Box>
    </Box>
  );
};

export default PartReviewSampleImage;
