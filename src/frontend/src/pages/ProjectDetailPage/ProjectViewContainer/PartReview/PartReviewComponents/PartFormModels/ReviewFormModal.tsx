import { MAX_FILE_SIZE, PartPreview, PartSubmission, Review_Status } from 'shared';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import NERFormModal from '../../../../../../components/NERFormModal';
import { Autocomplete, Button, Grid, IconButton, List, ListItem, Typography } from '@mui/material';
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

const ReviewFormModal = ({ open, handleClose, defaultValues, onSubmit, partsInProject }: ReviewFormModalProps) => {
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>();
  const { mutateAsync: uploadFile } = useUploadFile();

  const handleCloseAndReset = () => {
    setFiles([]);
    setSelectedPartIndex(undefined);
    handleClose();
  };

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
    resolver: yupResolver(schema),
    defaultValues: {
      submissionId: defaultValues?.partSubmissionId || '',
      notes: defaultValues?.notes || '',
      fileIds: defaultValues?.fileIds || []
    }
  });

  const {
    append: appendFileId,
    remove: removeFileId,
    fields: fileIds
  } = useFieldArray({
    control,
    name: 'fileIds'
  });

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
    return name.length <= 15 ? name : name.slice(0, 14) + '...';
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
      onHide={handleCloseAndReset}
      title={!!defaultValues ? 'Edit Review' : 'New Review'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-review-form' : 'create-review-form'}
      showCloseButton
      disabled={uploading}
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
              onChange={(_event, newValue) => setSelectedPartIndex(newValue?.index)}
            />
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <FormLabel>File(s)</FormLabel>
            <Grid container>
              <List>
                {fileIds.map((file, index) => {
                  return (
                    <ListItem key={file.id}>
                      <Typography>{displayName(files[index].name)}</Typography>
                      <IconButton
                        onClick={() => {
                          setFiles((prevFiles) => [...prevFiles.slice(0, index), ...prevFiles.slice(index + 1)]);
                          removeFileId(index);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </ListItem>
                  );
                })}
              </List>
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
                  multiple
                  onChange={async (e) => {
                    if (e.target.files) {
                      const numFiles = [...e.target.files]?.length;
                      if (numFiles + files.length > 5) {
                        toast.error('cannot upload more than 5 files');
                        return;
                      }
                      setUploading(true);
                      const uploadPromises = [...e.target.files]?.map(async (file) => {
                        if (file.size > MAX_FILE_SIZE) {
                          toast.error(
                            `File "${file.name}" exceeds the maximum size limit of ${MAX_FILE_SIZE / (1024 * 1024)} mbs`
                          );
                          return;
                        }

                        try {
                          const fileId = await uploadFile(file);
                          appendFileId(fileId);
                          setFiles((prev) => [...prev, file]);
                        } catch (error: unknown) {
                          toast.error('file upload failed');
                        }
                      });
                      await Promise.all(uploadPromises);
                      setUploading(false);
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
                const statusOptions = [Review_Status.APPROVED, Review_Status.REVIEWED];

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
      <Typography variant="body2" sx={{ mb: -2 }}>
        To create a review with markups on a submission, visit the part's page
      </Typography>
    </NERFormModal>
  );
};

export default ReviewFormModal;
