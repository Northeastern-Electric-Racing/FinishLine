import { PartPreview, PartSubmission } from 'shared';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import NERFormModal from '../../../../../../components/NERFormModal';
import { Autocomplete, Button, Grid, IconButton, Typography } from '@mui/material';
import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';
import { Delete, FileUpload } from '@mui/icons-material';

interface SubmissionFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: PartSubmission;
  onSubmit: (data: { partId: string; name: string; notes?: string; files: { name: string; file: File }[] }) => void;
  partsInProject: PartPreview[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isPdf = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'pdf';
};

const SubmissionFormModal = ({ open, handleClose, defaultValues, onSubmit, partsInProject }: SubmissionFormModalProps) => {
  const toast = useToast();

  const schema = yup.object().shape({
    partId: yup.string().required(),
    name: yup.string().required(),
    notes: yup.string().optional(),
    files: yup
      .array()
      .test({
        message: 'Cannot upload more than 5 files',
        test: (arr) => (arr ? arr?.length <= 5 : false)
      })
      .test({
        message: 'Must upload at least 1 file',
        test: (arr) => (arr ? arr?.length > 0 : false)
      })
      .test({
        name: 'fileNameLength',
        message: 'File name(s) can only be at most 20 characters long',
        test: (value) => {
          if (!value) return true;
          return !value.some((file) => file.name.length > 20);
        }
      })
      .test({
        name: 'fileNameCharacters',
        message: 'File name(s) should only contain letters, numbers, and dots',
        test: (value) => {
          if (!value) return true;
          return !value.some((file) => !/^[\w.]+$/.test(file.name));
        }
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

  const onFormSubmit = async (data: {
    partId: string;
    name: string;
    notes?: string;
    files: { name: string; file: File }[];
  }) => {
    try {
      handleClose();
      await onSubmit({
        ...data
      });
      toast.success('Submission Successfully Created');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    reset();
  };

  const displayName = (name: string) => {
    return name.length <= 10 ? name : name.slice(0, 9) + '...';
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Submission' : 'New Submission'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-submission-form' : 'create-submission-form'}
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
                  <Grid key={file.id} display={'flex'} flexDirection={'row'}>
                    <Typography>{displayName(file.name)}</Typography>
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
                        if (file.size > MAX_FILE_SIZE) {
                          toast.error(`File "${file.name}" exceeds the maximum size limit of ${MAX_FILE_SIZE} bytes`);
                          return;
                        }
                        if (!/^[\w.]+$/.test(file.name)) {
                          toast.error(`File names can only contain letters and numbers`);
                          return;
                        }
                        if (file.name.length > 20) {
                          toast.error(`File names cannot be longer than 20 characters`);
                          return;
                        }

                        if (!isPdf(file.name)) {
                          toast.warning(
                            `Warning: "${file.name}" is not a PDF file, so will not be displayed. (Don't worry, reviewers can still download it)`,
                            5000
                          );
                        }
                        appendFile({
                          name: file.name,
                          file
                        });
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

export default SubmissionFormModal;
