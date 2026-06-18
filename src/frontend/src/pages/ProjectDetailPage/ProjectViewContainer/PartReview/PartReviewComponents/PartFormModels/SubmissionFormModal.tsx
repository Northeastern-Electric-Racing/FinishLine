import { MAX_FILE_SIZE, PartPreview, PartSubmission } from 'shared';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import NERFormModal from '../../../../../../components/NERFormModal';
import { Autocomplete, Button, Grid, IconButton, List, ListItem, Typography } from '@mui/material';
import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';
import { Delete, FileUpload } from '@mui/icons-material';
import { useUploadFile } from '../../../../../../hooks/part-review.hooks';
import { getFileUploadDisplayName } from '../../../../../../utils/part.utils';

interface SubmissionFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: PartSubmission;
  currentPart?: PartPreview;
  onSubmit: (data: { partId: string; name: string; notes?: string; fileIds: string[] }) => void;
  partsInProject: PartPreview[];
}

const isPdf = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension === 'pdf';
};

const SubmissionFormModal = ({
  open,
  handleClose,
  defaultValues,
  currentPart,
  onSubmit,
  partsInProject
}: SubmissionFormModalProps) => {
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadFile } = useUploadFile();

  const handleCloseAndReset = () => {
    setFiles([]);
    handleClose();
  };

  const schema = yup.object().shape({
    partId: yup.string().required(),
    name: yup.string().required(),
    notes: yup.string().optional(),
    fileIds: yup
      .array()
      .min(1, 'must upload at least 1 file')
      .max(5, 'cannot upload more than 5 files for a single submission')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      partId: defaultValues?.partId ?? currentPart?.partId,
      name: defaultValues?.name,
      notes: defaultValues?.notes,
      fileIds: defaultValues?.fileIds || []
    }
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        partId: defaultValues.partId,
        name: defaultValues.name,
        notes: defaultValues.notes ?? '',
        fileIds: defaultValues.fileIds ?? []
      });
    }
  }, [defaultValues, reset]);

  const {
    append: appendFileId,
    remove: removeFileId,
    fields: fileIds
  } = useFieldArray({
    control,
    name: 'fileIds'
  });

  const onFormSubmit = async (data: { partId: string; name: string; notes?: string; fileIds: string[] }) => {
    try {
      await onSubmit({
        ...data
      });
      toast.success(!!defaultValues ? 'Submission Successfully Updated' : 'Submission Successfully Created');
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    reset();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCloseAndReset}
      title={!!defaultValues ? 'Edit Submission Details' : 'New Submission'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-submission-form' : 'create-submission-form'}
      showCloseButton
      disabled={uploading}
    >
      <Grid container spacing={2} alignItems="flex-start" maxWidth={'100%'}>
        {!defaultValues && (
          <>
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
                  <List>
                    {fileIds.length === files.length &&
                      fileIds.map((file, index) => {
                        return (
                          <ListItem key={file.id}>
                            <Typography>{getFileUploadDisplayName(files[index].name)}</Typography>
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

                            if (!isPdf(file.name)) {
                              toast.warning(
                                `Warning: "${file.name}" is not a PDF file, so will not be displayed. (Don't worry, reviewers can still download it)`,
                                5000
                              );
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
          </>
        )}
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
