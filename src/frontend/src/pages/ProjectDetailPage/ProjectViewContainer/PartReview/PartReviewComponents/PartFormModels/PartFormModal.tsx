import { Part, PartPreview, Review_Status, WbsNumber, wbsPipe } from 'shared';
import { PartPayload, useGetAllPartTags } from '../../../../../../hooks/part-review.hooks';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import NERFormModal from '../../../../../../components/NERFormModal';
import { Autocomplete, Grid } from '@mui/material';
import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';
import ErrorPage from '../../../../../ErrorPage';
import LoadingIndicator from '../../../../../../components/LoadingIndicator';
import { useAllUsers } from '../../../../../../hooks/users.hooks';
import CreatePartTagModal from '../../../../../AdminToolsPage/ProjectsConfig/CreatePartTagModal';
import AddIcon from '@mui/icons-material/Add';

interface PartFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: Part;
  onSubmit: (data: PartPayload) => void;
  partsInProject: PartPreview[];
  wbsNum: WbsNumber;
}

const PartFormModal = ({ open, handleClose, defaultValues, onSubmit, partsInProject, wbsNum }: PartFormModalProps) => {
  const toast = useToast();
  const [tagIds, setTagIds] = useState<string[]>(defaultValues ? defaultValues.tags.map((tag) => tag.partTagId) : []);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    defaultValues ? defaultValues.assignees.map((user) => user.userId) : []
  );
  const [reviewerIds, setReviewerIds] = useState<string[]>(
    defaultValues ? defaultValues.reviewRequests.map((reviewReq) => reviewReq.reviewerRequested.userId) : []
  );
  const [newPartTagModelOpen, setNewPartTagModelOpen] = useState(false);

  const schema = yup.object().shape({
    wbsNum: yup.string().required(),
    index: yup
      .number()
      .integer()
      .lessThan(99999, 'Index must be less than 5 digits')
      .positive()
      .required()
      .test({
        name: 'unique-index',
        message: 'Index not unique',
        test: (idx) => idx === defaultValues?.index || !partsInProject.some((part) => part.index === idx)
      }),
    commonName: yup.string().required(),
    description: yup.string().optional()
  });

  const closeForm = () => {
    handleClose();
    setTagIds([]);
    setAssigneeIds([]);
    setReviewerIds([]);
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      wbsNum: wbsPipe(wbsNum),
      index: defaultValues?.index,
      commonName: defaultValues?.commonName,
      description: defaultValues?.description
    }
  });

  const onFormSubmit = async (data: PartPayload) => {
    try {
      await onSubmit({
        ...data,
        reviewStatus: defaultValues ? defaultValues.status : Review_Status.IN_PROGRESS,
        tagIds,
        assigneeIds,
        reviewerIds
      });
      closeForm();
      toast.success(!!defaultValues ? 'Part Successfully Edited' : 'Part Successfully Created');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    reset();
  };

  const { data: tags, isLoading: tagsLoading, isError: tagsIsError, error: tagsError } = useGetAllPartTags();
  const { data: users, isLoading: usersLoading, isError: usersIsError, error: usersError } = useAllUsers();
  if (tagsIsError) return <ErrorPage message={tagsError?.message} />;
  if (usersIsError) return <ErrorPage message={usersError?.message} />;
  if (tagsLoading || !tags || usersLoading || !users) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={open}
      onHide={closeForm}
      title={!!defaultValues ? 'Edit Part' : 'New Part'}
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-Part-form' : 'create-Part-form'}
      showCloseButton
    >
      <CreatePartTagModal
        showModal={newPartTagModelOpen}
        handleClose={() => {
          setNewPartTagModelOpen(false);
        }}
        tagCreated={(id: string) => {
          setTagIds((prev) => [...prev, id]);
        }}
      />
      <Grid container spacing={2} alignItems="flex-start" maxWidth={'100%'}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <FormLabel>Index</FormLabel>
            <ReactHookTextField
              disabled={!!defaultValues}
              name="index"
              type="number"
              control={control}
              placeholder="XXXXX"
            />
            <FormHelperText error>{errors.index?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={9}>
          <FormControl fullWidth>
            <FormLabel>Common Name</FormLabel>
            <ReactHookTextField name="commonName" control={control} placeholder="Name..." />
            <FormHelperText error>{errors.commonName?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Description (optional)</FormLabel>
            <ReactHookTextField
              required={false}
              name="description"
              control={control}
              multiline
              rows={3}
              placeholder="Description of the part goes here..."
            />
            <FormHelperText error>{errors.description?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Tags (Optional)</FormLabel>
            <Autocomplete
              multiple
              options={[{ partTagId: 'add-new', name: 'Add New' }, ...tags]}
              getOptionLabel={(option) => option.name}
              value={tags.filter((tag) => tagIds.includes(tag.partTagId))}
              onChange={(_event, value) => {
                const addNewSelected = value.find((item) => item.partTagId === 'add-new');

                if (addNewSelected) {
                  setNewPartTagModelOpen(true);
                  const realTags = value.filter((item) => !(item.partTagId === 'add-new'));
                  const selectedIds = realTags.map((tag) => tag.partTagId);
                  setTagIds(selectedIds);
                } else {
                  const selectedIds = value.map((tag) => tag.partTagId);
                  setTagIds(selectedIds);
                }
              }}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select tags" error={false} />}
              renderOption={(props, option) => (
                <li
                  {...props}
                  style={option.partTagId === 'add-new' ? { fontWeight: 'bold', borderBottom: '1px solid #ddd' } : {}}
                >
                  {option.partTagId === 'add-new' && <AddIcon style={{ marginRight: 8, fontSize: 16 }} />}
                  {option.name}
                </li>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Assignees</FormLabel>
            <Autocomplete
              multiple
              options={users.filter((user) => !reviewerIds.some((reviewerId) => reviewerId === user.userId))}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={users.filter((user) => assigneeIds.includes(user.userId))}
              onChange={(_event, value) => {
                const selectedIds = value.map((user) => user.userId);
                setAssigneeIds(selectedIds);
              }}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" placeholder="Select User(s)" error={false} />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6} width={'10rem'}>
          <FormControl fullWidth>
            <FormLabel>Reviewers</FormLabel>
            <Autocomplete
              multiple
              options={users.filter((user) => !assigneeIds.some((assigneeId) => assigneeId === user.userId))}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={users.filter((user) => reviewerIds.includes(user.userId))}
              onChange={(_event, value) => {
                const selectedIds = value.map((user) => user.userId);
                setReviewerIds(selectedIds);
              }}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" placeholder="Select User(s)" error={false} />
              )}
            />
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default PartFormModal;
