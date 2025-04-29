import { PartPreview, PartSubmission } from 'shared';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import NERFormModal from '../../../../../../components/NERFormModal';
import { Autocomplete, Button, Grid, IconButton } from '@mui/material';
import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';
import { Delete, FileUpload } from '@mui/icons-material';

interface SubmissionFormModelProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: PartSubmission;
  onSubmit: (data: { partId: string; name: string; notes?: string; files: File[] }) => void;
  partsInProject: PartPreview[];
}

const SubmissionFormModel = ({ open, handleClose, defaultValues, onSubmit, partsInProject }: SubmissionFormModelProps) => {
  const toast = useToast();

  const schema = yup.object().shape({
    partId: yup.string().required(),
    name: yup.string().required(),
    notes: yup.string().optional(),
    files: yup.array().test({
      message: 'Must upload at least 1 file',
      test: (arr) => (arr ? arr?.length > 0 : false)
    })
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      partId: defaultValues?.partId,
      name: defaultValues?.name,
      notes: defaultValues?.notes
    }
  });

  const {
    append: appendFile,
    remove: removeFile,
    fields: files
  } = useFieldArray({
    control,
    name: 'files'
  });

  const onFormSubmit = async (data: { partId: string; name: string; notes?: string; files: File[] }) => {
    try {
      await onSubmit({
        ...data
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Part' : 'Create Part'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-Part-form' : 'create-Part-form'}
      showCloseButton
    >
      <Grid container spacing={2} alignItems="flex-start" maxWidth={'100%'}>
        <Grid item xs={7}>
          <FormControl fullWidth>
            <FormLabel>Part</FormLabel>
            <Controller
              name="partId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={partsInProject}
                  getOptionLabel={(part) => `${part.commonName}_${part.index}`}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Select a Part" error={false} />
                  )}
                  value={partsInProject.find((option) => option.partId === value)}
                  onChange={(_event, newValue) => onChange(newValue ? newValue.partId : '')}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <FormLabel>File(s)</FormLabel>
            <Grid container>
              {files.map((file, index) => {
                return (
                  <Grid display={'flex'} flexDirection={'row'}>
                    <p>{file.file.name.length <= 10 ? file.file.name : file.file.name.slice(0, 9) + '...'}</p>
                    <IconButton onClick={() => removeFile(index)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                );
              })}
              <Button
                variant="contained"
                color="success"
                component="label"
                startIcon={<FileUpload />}
                sx={{
                  width: 'fit-content',
                  mt: '0.75px'
                }}
              >
                Upload
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files) {
                      [...e.target.files]?.forEach((file) => {
                        appendFile({ file });
                      });
                    }
                  }}
                />
              </Button>
            </Grid>
            <FormHelperText error>{errors.files?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Submission Name</FormLabel>
            <ReactHookTextField name="name" control={control} placeholder="Name..." />
            <FormHelperText error>{errors.name?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Uploader Notes (optional)</FormLabel>
            <ReactHookTextField
              required={false}
              name="notes"
              control={control}
              multiline
              rows={3}
              placeholder="Any additional comments go here..."
            />
            <FormHelperText error>{errors.notes?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default SubmissionFormModel;
