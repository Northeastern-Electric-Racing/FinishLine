import { Part, PartTag, Project, Review_Status, WbsNumber, wbsPipe } from 'shared';
import { PartPayload, useGetAllPartTags } from '../../../../../../hooks/part-review.hooks';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import NERFormModal from '../../../../../../components/NERFormModal';
import { Autocomplete, AutocompleteRenderInputParams, Box, Grid, MenuItem, Select, Switch, Tooltip } from '@mui/material';
import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';
import NERAutocomplete from '../../../../../../components/NERAutocomplete';
import ErrorPage from '../../../../../ErrorPage';
import LoadingIndicator from '../../../../../../components/LoadingIndicator';

interface PartFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: Part;
  onSubmit: (data: PartPayload) => void;
  partsInProject: Part[];
  wbsNum: WbsNumber;
}

const PartFormModal = ({ open, handleClose, defaultValues, onSubmit, partsInProject, wbsNum }: PartFormModalProps) => {
  const toast = useToast();
  const [tagIds, setTagIds] = useState<string[]>(defaultValues ? defaultValues.tags.map((tag) => tag.partTagId) : []);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    defaultValues ? defaultValues.assignees.map((user) => user.userId) : []
  );

  const schema = yup.object().shape({
    wbsNum: yup.string().required(),
    index: yup
      .number()
      .required()
      .test((idx) => idx === defaultValues?.index || !partsInProject.some((part) => part.index === idx)),
    commonName: yup.string().required(),
    description: yup.string().optional(),
    reviewStatus: yup.mixed<Review_Status>().oneOf(Object.values(Review_Status)).required()
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      wbsNum: wbsPipe(wbsNum),
      index: defaultValues?.index,
      commonName: defaultValues?.commonName,
      description: defaultValues?.description,
      reviewStatus: defaultValues?.status
    }
  });

  const onFormSubmit = async (data: PartPayload) => {
    try {
      await onSubmit({
        ...data,
        tagIds,
        assigneeIds
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  const { data: tags, isLoading, isError, error } = useGetAllPartTags();
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !tags) return <LoadingIndicator />;

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
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Index</FormLabel>
            <ReactHookTextField name="index" control={control} />
            <FormHelperText error>{errors.index?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Common Name</FormLabel>
            <ReactHookTextField name="commonName" control={control} />
            <FormHelperText error>{errors.commonName?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Status</FormLabel>
            <Controller
              name="reviewStatus"
              control={control}
              render={({ field }) => (
                <Select {...field} error={!!errors.reviewStatus}>
                  {Object.values(Review_Status).map((status) => (
                    <MenuItem value={status}>{status}</MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText error>{errors.reviewStatus?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6} width={'10rem'}>
          <FormControl fullWidth>
            <FormLabel>Tags</FormLabel>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              onChange={(_event, value) => {
                const selectedIds = value.map((tag) => tag.partTagId);
                setTagIds(selectedIds);
              }}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select tags" error={false} />}
            />
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default PartFormModal;
