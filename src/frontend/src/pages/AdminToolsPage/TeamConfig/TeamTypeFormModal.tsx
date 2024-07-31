import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Tooltip, Typography, Button } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import HelpIcon from '@mui/icons-material/Help';
import { TeamType } from 'shared';
import { CreateTeamTypePayload, useSetTeamTypeImage } from '../../../hooks/team-types.hooks';
import React, { useEffect, useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LoadingIndicator from '../../../components/LoadingIndicator';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../utils/form';

interface TeamTypeFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaulValues?: TeamType;
  onSubmit: (data: CreateTeamTypePayload) => Promise<TeamType>;
}

const schema = yup.object().shape({
  name: yup.string().required('Material Type is Required'),
  iconName: yup.string().required('Icon Name is Required'),
  description: yup.string().required('Description is Required'),
});

const TeamTypeFormModal: React.FC<TeamTypeFormModalProps> = ({ open, handleClose, defaulValues, onSubmit }) => {
  const toast = useToast();
  const { isLoading: setTeamTypeIsLoading, mutateAsync: setImage } = useSetTeamTypeImage();

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (defaulValues?.image) {
      setImagePreview(defaulValues.image);
    }
  }, [defaulValues]);

  if (setTeamTypeIsLoading) return <LoadingIndicator />;

  const onFormSubmit = async (data: CreateTeamTypePayload) => {
    try {
      const { teamTypeId } = await onSubmit(data);

      if (data.image) {
        await setImage({ file: data.image, id: teamTypeId });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaulValues?.name ?? '',
      iconName: defaulValues?.iconName ?? '',
      description: defaulValues?.description ?? '',
      image: defaulValues?.image ?? null
    }
  });

  const formStorageKey = defaulValues ? FormStorageKey.EDIT_TEAM_TYPE : FormStorageKey.CREATE_TEAM_TYPE;

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  const TooltipMessage = () => (
    <Typography sx={{ fontSize: 14 }}>
      Click to view possible icon names. For names with multiple words, seperate them with an _. AttachMoney = attach_money
    </Typography>
  );

  const handleCancel = () => {
    reset({ name: '', iconName: '', description: '' });
    sessionStorage.removeItem(formStorageKey);
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title="New Team Type"
      reset={() => reset({ name: '', iconName: '', description: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="team-type-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Team Type</FormLabel>
        <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.name?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
          <FormLabel>Icon Name</FormLabel>
          <Tooltip title={<TooltipMessage />} placement="right">
            <a
              href="https://mui.com/components/material-icons/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <HelpIcon style={{ marginBottom: '-0.2em', fontSize: 'medium', marginLeft: '5px', color: 'lightgray' }} />
            </a>
          </Tooltip>
        </Box>
        <ReactHookTextField name="iconName" control={control} />
        <FormHelperText error>{errors.iconName?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
          <FormLabel>Description</FormLabel>
        </Box>
        <ReactHookTextField name="description" control={control} />
        <FormHelperText error>{errors.description?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Image</FormLabel>
        {imagePreview && (
          <Box component="img" src={imagePreview} alt="Image Preview" sx={{ maxWidth: '100%', maxHeight: '200px', mb: 2 }} />
        )}
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size < 1000000) {
                  setValue('image', file);
                  setImagePreview(URL.createObjectURL(file));
                } else {
                  toast.error(`Error uploading ${file.name}; file must be less than 1 MB`, 5000);
                }
              }
            }}
            type="file"
            id="team-type-image"
            accept="image/png, image/jpeg, application/pdf"
            name="image"
            hidden
          />
        </Button>
        <FormHelperText error>{errors.image?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default TeamTypeFormModal;
