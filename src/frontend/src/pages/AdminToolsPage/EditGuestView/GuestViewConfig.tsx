import { Box, FormControl, Grid, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import EditDescription from './EditDescription';
import EditFeaturedProjects from './EditFeaturedProjects';
import EditLogo from './EditLogo';
import {
  useCurrentOrganization,
  useSetOrganizationPlatformLogoImage,
  useSetPlatformDescription
} from '../../../hooks/organizations.hooks';
import { useGetImageUrl } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERUploadButton from '../../../components/NERUploadButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import { MAX_FILE_SIZE } from 'shared';
import UsefulLinksTable from '../OnboardingConfig/UsefulLinks/UsefulLinksTable';
import LinkTypeTable from '../ProjectsConfig/LinkTypes/LinkTypeTable';

const platformDescriptionSchema = yup.object().shape({
  platformDescription: yup.string().required()
});

const GuestViewConfig: React.FC = () => {
  const { data: organization } = useCurrentOrganization();
  const { mutateAsync: setPlatformLogoImage, isLoading: platformLogoLoading } = useSetOrganizationPlatformLogoImage();
  const { mutateAsync: setPlatformDescriptionMutation, isLoading: platformDescriptionSaving } = useSetPlatformDescription();
  const { data: platformLogoImageUrl } = useGetImageUrl(organization?.platformLogoImageId ?? null);
  const toast = useToast();

  const [addedPlatformLogo, setAddedPlatformLogo] = useState<File | undefined>(undefined);

  const formKey = organization?.organizationId ?? 'loading';

  const { control, handleSubmit, reset } = useForm<{ platformDescription: string }>({
    resolver: yupResolver(platformDescriptionSchema),
    defaultValues: { platformDescription: organization?.platformDescription ?? '' }
  });

  const onPlatformDescriptionSubmit = async (data: { platformDescription: string }) => {
    try {
      const updated = await setPlatformDescriptionMutation(data.platformDescription);
      reset({ platformDescription: updated.platformDescription });
      toast.success('Platform description saved.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save platform description');
    }
  };

  const handlePlatformLogoUpload = async () => {
    if (!addedPlatformLogo) return;
    if (addedPlatformLogo.size >= MAX_FILE_SIZE) {
      toast.error(
        `Error uploading ${addedPlatformLogo.name}; file must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB`,
        5000
      );
      return;
    }
    try {
      await setPlatformLogoImage(addedPlatformLogo);
      toast.success('Platform logo uploaded successfully.');
      setAddedPlatformLogo(undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to upload image');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Stack spacing={2}>
          <EditDescription />
          <EditFeaturedProjects />
          <Box>
            <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
              Platform Description
            </Typography>
            <form
              id="platform-description-form"
              key={formKey}
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(onPlatformDescriptionSubmit)(e);
              }}
              onKeyPress={(e) => {
                e.key === 'Enter' && e.preventDefault();
              }}
            >
              <FormControl sx={{ width: '100%' }}>
                <ReactHookTextField
                  name="platformDescription"
                  control={control}
                  multiline
                  rows={5}
                  fullWidth
                  required
                  placeholder="Enter platform description for the guest home page..."
                  sx={{ mb: 1 }}
                />
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                <NERSuccessButton
                  type="submit"
                  form="platform-description-form"
                  variant="contained"
                  disabled={platformDescriptionSaving}
                  sx={{ mt: 1 }}
                >
                  {platformDescriptionSaving ? 'Saving...' : 'Save'}
                </NERSuccessButton>
              </Box>
            </form>
          </Box>
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack spacing={2}>
          <EditLogo />
          <Box>
            <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
              Platform Logo
            </Typography>
            {platformLogoLoading ? (
              <Box sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
                <LoadingIndicator />
              </Box>
            ) : (
              <Box>
                <NERUploadButton
                  dataTypeId="platformLogo"
                  handleFileChange={(e) => {
                    if (e.target.files?.[0]) setAddedPlatformLogo(e.target.files[0]);
                  }}
                  onSubmit={handlePlatformLogoUpload}
                  addedImage={addedPlatformLogo}
                  setAddedImage={setAddedPlatformLogo}
                />
                {!addedPlatformLogo && platformLogoImageUrl && (
                  <Box
                    component="img"
                    src={platformLogoImageUrl}
                    alt="Platform Logo"
                    sx={{ display: 'block', maxWidth: '200px', mb: 1, mt: 1 }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </Grid>
      <Grid item>
        <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
          Links Config
        </Typography>
        <LinkTypeTable isOnGuestHomePage={true} />
      </Grid>
      <Grid item>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            height: '100%',
            borderRadius: '10px',
            padding: '16px',
            width: '100%'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            Guest Page Links
          </Typography>
          <UsefulLinksTable isOnGuestHomePage={true} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default GuestViewConfig;
