/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  RadioGroup,
  Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NERSuccessButton from '../../../components/NERSuccessButton';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeRequestReason, ChangeRequestType } from 'shared';
import { TextField, IconButton } from '@mui/material';
import { wbsTester } from '../../../utils/form';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { NERButton } from '../../../components/NERButton';
import { ChangeEvent } from 'react';
import { ProjectCreateChangeRequestFormInput } from './ProjectEditContainer';
import DeleteIcon from '@mui/icons-material/Delete';
import { ProjectFormInput } from './ProjectForm';
import { FormInput } from '../../CreateChangeRequestPage/CreateChangeRequest';

interface ProjectCreateChangeRequestFormProps {
  onSubmit: (data: ProjectCreateChangeRequestFormInput) => void;
  open: boolean;
  onClose: () => void;
  projectEdits?: ProjectFormInput;
}

const schema = yup.object().shape({
  type: yup.string().required('Type is required'),
  what: yup.string().required('What is required'),
  why: yup
    .array()
    .min(1, 'At least one Why is required')
    .required('Why is required')
    .of(
      yup.object().shape({
        type: yup.string().required('Why Type is required'),
        explain: yup
          .string()
          .required('Why Explain is required')
          .when('type', {
            is: ChangeRequestReason.OtherProject,
            then: yup.string().test('wbs-num-valid', 'WBS Number is not valid', wbsTester)
          })
      })
    )
});

const ProjectCreateChangeRequestForm: React.FC<ProjectCreateChangeRequestFormProps> = ({
  onSubmit,
  open,
  onClose,
  projectEdits
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      what: '',
      why: [{ type: ChangeRequestReason.Other, explain: '' }],
      type: ChangeRequestType.Issue
    }
  });

  const permittedTypes = Object.values(ChangeRequestType).filter(
    (t) => t !== ChangeRequestType.Activation && t !== ChangeRequestType.StageGate
  );
  const { fields: whys, append: appendWhy, remove: removeWhy } = useFieldArray({ control, name: 'why' });

  const projectOptions: { label: string; id: string }[] = [];

  const renderReasonInput = (index: number) => {
    const typeValue = watch(`why.${index}.type`);
    return typeValue === `${ChangeRequestReason.OtherProject}` ? (
      <Controller
        key={index}
        name={`why.${index}.explain`}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            id="other-project-autocomplete"
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={projectOptions}
            size="small"
            value={projectOptions.find((element) => element.id === value)}
            sx={{ mx: 1, flex: 1, '.MuiInputBase-input': { height: '39px' } }}
            renderInput={(params: AutocompleteRenderInputParams) => <TextField {...params} placeholder="Select a Project" />}
            onChange={(event, value) => (value ? onChange(value?.id) : null)}
          />
        )}
      />
    ) : (
      <ReactHookTextField
        required
        multiline
        rows={4}
        control={control}
        label="Explain"
        sx={{ flexGrow: 1, borderRadius: 2, width: '100%' }}
        {...register(`why.${index}.explain`)}
        errorMessage={errors.why?.[index]?.explain}
      />
    );
  };

  const submitChangeRequest = (data: FormInput) => {
    if (projectEdits) {
      const changeRequestPayload: ProjectCreateChangeRequestFormInput = {
        ...data,
        ...projectEdits
      };
      onSubmit(changeRequestPayload);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create a Change Request From Project Edits</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        <form
          id={'project-create-change-request-form'}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(submitChangeRequest)(e);
          }}
        >
          <Grid item xs={10}>
            <FormControl fullWidth>
              <FormLabel>Type</FormLabel>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <RadioGroup onChange={onChange} value={value}>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
                      {permittedTypes.map((t) => (
                        <NERButton
                          sx={{
                            fontSize: { xs: '0.8rem', md: '1rem' },
                            width: { xs: '83%', md: 'auto' }
                          }}
                          key={t}
                          variant={value === t ? 'contained' : 'outlined'}
                          onClick={() => onChange(t as 'ISSUE' | ChangeEvent<Element>)}
                        >
                          {t}
                        </NERButton>
                      ))}
                    </Box>
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>What needs to be changed?</FormLabel>
              <ReactHookTextField
                name="what"
                control={control}
                multiline
                rows={4}
                errorMessage={errors.what}
                placeholder="Explain *"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>Why does this need to be changed?</FormLabel>
              <Box>
                {whys.map((element, index) => (
                  <Grid container xs={12} display="flex" flexDirection="row" sx={{ mb: 1 }}>
                    <Grid item xs={12}>
                      <Select
                        {...register(`why.${index}.type`)}
                        sx={{ width: { sx: 'auto', md: 200 }, mr: 2 }}
                        defaultValue={element.type}
                        key={element.id}
                      >
                        {Object.values(ChangeRequestReason).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      <IconButton color="error" type="button" onClick={() => removeWhy(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1, mb: 1 }}>
                      {renderReasonInput(index)}
                    </Grid>
                  </Grid>
                ))}
              </Box>
              <FormHelperText>{errors.why?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 1 }}
              onClick={() => appendWhy({ type: ChangeRequestReason.Design, explain: '' })}
              style={{ marginLeft: '15px' }}
            >
              Add Reason
            </Button>
          </Grid>
          <Box display="flex" flexDirection="row-reverse">
            <NERSuccessButton
              color="success"
              variant="contained"
              type="submit"
              form="project-create-change-request-form"
              sx={{ textTransform: 'none', fontSize: 16, marginTop: 3 }}
            >
              Create
            </NERSuccessButton>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateChangeRequestForm;
