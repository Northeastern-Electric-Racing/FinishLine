import { Controller, useForm } from 'react-hook-form';
import { GraphCollection, GraphCollectionFormInput, SpecialPermission } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { useHistory } from 'react-router-dom';
import { Autocomplete, FormControl, FormHelperText, FormLabel, Grid, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { specialPermissionToAutoCompleteValue } from '../../../utils/statistics.utils';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface GraphCollectionFormProps {
  open: boolean;
  onHide: () => void;
  defaultValues: GraphCollectionFormInput;
  action: (data: GraphCollectionFormInput) => Promise<GraphCollection>;
  successText: string;
  title: string;
}

const schema = yup.object().shape({
  title: yup.string().required(),
  permissions: yup.array().required()
});

const GraphCollectionForm = ({ open, onHide, defaultValues, action, successText, title }: GraphCollectionFormProps) => {
  const toast = useToast();
  const history = useHistory();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GraphCollectionFormInput>({
    defaultValues,
    resolver: yupResolver(schema)
  });

  const onSubmitWrapper = async (formInput: GraphCollectionFormInput) => {
    try {
      const createdCollection = await action(formInput);
      toast.success(successText);
      history.push(`/statistics/graph-collections/${createdCollection.id}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <NERFormModal
      title={title}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmitWrapper}
      reset={reset}
      open={open}
      onHide={onHide}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl>
            <FormLabel>Graph Collection Title</FormLabel>
            <ReactHookTextField
              placeholder="Enter Graph Collection Title"
              control={control}
              name="title"
              errorMessage={errors.title}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Additional Permissions to Apply to the Graph</FormLabel>
            <Controller
              name="permissions"
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <Autocomplete
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    filterSelectedOptions
                    multiple
                    id="permissionsSelector"
                    options={Object.values(SpecialPermission).map(specialPermissionToAutoCompleteValue)}
                    value={value.map(specialPermissionToAutoCompleteValue)}
                    onChange={(_event, newValue) => onChange(newValue.map((autoCompleteValue) => autoCompleteValue.id))}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" placeholder="Select Any Additional Permissions" />
                    )}
                  />
                );
              }}
            />
            <FormHelperText error={!!errors.permissions}>{errors.permissions?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default GraphCollectionForm;
