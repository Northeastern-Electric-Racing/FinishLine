import { PartPreview, PartSubmission, Review_Status } from 'shared';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import NERFormModal from '../../../../../../components/NERFormModal';
import { Autocomplete, Button, Grid, IconButton, Typography } from '@mui/material';
import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';
import { Delete, FileUpload } from '@mui/icons-material';
import { useUploadFile } from '../../../../../../hooks/part-review.hooks';

interface ReviewFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: PartSubmission;
  onSubmit: (data: { submissionId: string; status: Review_Status; notes?: string; fileIds: string[] }) => void;
  partsInProject: PartPreview[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ReviewFormModal = ({ open, handleClose, defaultValues, onSubmit, partsInProject }: ReviewFormModalProps) => {
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadFile } = useUploadFile();

  const schema = yup.object().shape({
    submissionId: yup.string().required(),
    notes: yup.string().optional(),
    status: yup.string().required(),
    fileIds: yup.array().max(5, 'cannot upload more than 5 files for a single review')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const {
    append: appendFileId,
    remove: removeFileId,
    fields: fileIds
  } = useFieldArray({
    control,
    name: 'fileIds'
  });

  const [selectedPartIndex, setSelectedPartIndex] = useState<number | null>(null);

  const onFormSubmit = async (data: { submissionId: string; status: Review_Status; notes?: string; fileIds: string[] }) => {
    try {
      handleClose();
      await onSubmit({
        ...data
      });
      toast.success('Review Successfully Created');
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

  const findSubmissionOptions: () => {
    partSubmissionId: string;
    name: string;
  }[] = () => {
    if (selectedPartIndex === null) return [];
    const selectedPart = partsInProject.find((part) => part.index === selectedPartIndex);
    return selectedPart ? selectedPart.submissions : [];
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Review' : 'New Review'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-review-form' : 'create-review-form'}
      showCloseButton
    >
      <Grid container spacing={2} alignItems="flex-start" maxWidth={'100%'}>
        <Grid item xs={7}>
          <FormControl fullWidth>
            <FormLabel>Part</FormLabel>
            <Autocomplete
              options={partsInProject}
              getOptionLabel={(part) => `${part.commonName}_${part.index}`}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" placeholder="Select a Part" error={false} />
              )}
              onChange={(_event, newValue) => setSelectedPartIndex(newValue ? newValue.index : null)}
            />
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <FormLabel>File(s)</FormLabel>
            <Grid container>
              {fileIds.map((file, index) => {
                return (
                  <Grid key={file.id} display={'flex'} flexDirection={'row'}>
                    <Typography>{displayName(files[index].name)}</Typography>
                    <IconButton
                      onClick={() => {
                        setFiles((prevFiles) => [...prevFiles.slice(0, index), ...prevFiles.slice(index + 1)]);
                        removeFileId(index);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                );
              })}
              {uploading && <Typography>Uploading...</Typography>}
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
                      if ([...e.target.files]?.length > 5) {
                        toast.error('cannot upload more than 5 files');
                        return;
                      }
                      [...e.target.files]?.forEach(async (file) => {
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

                        if (files.length >= 5) {
                          toast.error('Cannot upload more than 5 files for a single review');
                        }

                        try {
                          setUploading(true);
                          const fileId = await uploadFile(file);
                          appendFileId(fileId);
                          setFiles((prev) => [...prev, file]);
                          setUploading(false);
                        } catch (error: unknown) {
                          setUploading(false);
                          toast.error('file upload failed');
                        }
                      });
                    }
                  }}
                />
              </Button>
            </Grid>
            <FormHelperText error>{errors.fileIds?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={7}>
          <FormControl fullWidth>
            <FormLabel>Submission Being Reviewed</FormLabel>
            <Controller
              name="submissionId"
              control={control}
              render={({ field: { onChange, value } }) => {
                const options = findSubmissionOptions();
                const selectedOption = options.find((option) => option.partSubmissionId === value) ?? null;

                return (
                  <Autocomplete
                    options={options}
                    getOptionLabel={(submission) => submission.name}
                    value={selectedOption}
                    onChange={(_event, newValue) => onChange(newValue?.partSubmissionId ?? '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Select a Submission"
                        error={!!errors.submissionId}
                      />
                    )}
                  />
                );
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <FormLabel>Status</FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field: { onChange, value } }) => {
                const statusOptions = Object.values(Review_Status);

                return (
                  <Autocomplete
                    options={statusOptions}
                    getOptionLabel={(option) => option}
                    value={value || null}
                    onChange={(_event, newValue) => onChange(newValue ?? '')}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" placeholder="Select a Status" error={!!errors.status} />
                    )}
                  />
                );
              }}
            />
            <FormHelperText error>{errors.status?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Reviewer Notes (optional)</FormLabel>
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

export default ReviewFormModal;
