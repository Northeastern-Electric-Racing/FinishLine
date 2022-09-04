/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeRequestReason, ChangeRequestType, validateWBS } from 'shared';
import { routes } from '../../utils/Routes';
import { FormInput } from './CreateChangeRequest';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';

interface CreateChangeRequestViewProps {
  wbsNum: string;
  onSubmit: (data: FormInput) => Promise<void>;
}

const wbsTester = (wbsNum: string | undefined) => {
  if (!wbsNum) return false;
  try {
    validateWBS(wbsNum);
  } catch (error) {
    return false;
  }
  return true;
};

const schema = yup.object().shape({
  wbsNum: yup
    .string()
    .required('WBS number is required')
    .test('wbs-num-valid', 'WBS Number is not valid', wbsTester),
  type: yup.string().required('Type is required'),
  what: yup.string().required('What is required'),
  scopeImpact: yup.string().required('Scope Impact is required'),
  timelineImpact: yup
    .number()
    .typeError('Timeline Impact must be a number')
    .min(0, 'Timeline Impact must be greater than or equal to 0 weeks')
    .required('Timeline Impact is required')
    .integer('Timeline Impact must be an integer'),
  budgetImpact: yup
    .number()
    .typeError('Budget Impact must be a number')
    .min(0, 'Budget Impact must be greater than or equal to $0')
    .required('Budget Impact is required')
    .integer('Budget Impact must be an integer'),
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

const CreateChangeRequestsView: React.FC<CreateChangeRequestViewProps> = ({ wbsNum, onSubmit }) => {
  const { handleSubmit, control } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: { wbsNum, why: [{ type: ChangeRequestReason.Other, explain: '' }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'why' });

  const permittedTypes = Object.values(ChangeRequestType).filter(
    (t) => t !== ChangeRequestType.Activation && t !== ChangeRequestType.StageGate
  );

  return (
    <>
      <PageTitle
        title={'New Change Request'}
        previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
      />
      <PageBlock title={''}>
        <form id={'create-standard-change-request-form'} onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="wbsNum"
            defaultValue={wbsNum}
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="WBS Number"
                error={!!fieldState.error}
                helperText={fieldState.error?.type}
              />
            )}
          />

          <Controller
            name="type"
            defaultValue={ChangeRequestType.Issue}
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <FormControl>
                <InputLabel id={`${field.name}Label`}>Type</InputLabel>
                <Select
                  {...field}
                  label="Type"
                  labelId={`${field.name}Label`}
                  error={!!fieldState.error}
                >
                  {permittedTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{fieldState.error?.type}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name="what"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={'What'}
                multiline
                rows={4}
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.type}
                placeholder="What is the situation?"
              />
            )}
          />

          <Box>
            <Typography variant="subtitle2">Why</Typography>
            <Box>
              {fields.map((field, index) => (
                <Box>
                  <Controller
                    name={`why.${index}.type` as const}
                    defaultValue={ChangeRequestReason.Other}
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <FormControl>
                        <InputLabel id={`${field.name}Label`}>Type</InputLabel>
                        <Select
                          {...field}
                          label="Type"
                          labelId={`${field.name}Label`}
                          error={!!fieldState.error}
                        >
                          {Object.values(ChangeRequestReason).map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{fieldState.error?.type}</FormHelperText>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name={`why.${index}.explain` as const}
                    defaultValue=""
                    control={control}
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Explain"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.type}
                        placeholder="Why details"
                      />
                    )}
                  />
                  <Button variant="contained" color="error" onClick={() => remove(index)}>
                    <DeleteIcon />
                  </Button>
                </Box>
              ))}
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => append({ type: ChangeRequestReason.Design, explain: '' })}
            >
              Add Reason
            </Button>
          </Box>

          <Controller
            name="scopeImpact"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={'Scope Impact'}
                multiline
                rows={4}
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.type}
                placeholder="What is the impact to scope?"
              />
            )}
          />

          <Controller
            name="timelineImpact"
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Timeline Impact"
                error={!!fieldState.error}
                helperText={fieldState.error?.type}
                placeholder="# needed"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">weeks</InputAdornment>
                }}
              />
            )}
          />

          <Controller
            name="budgetImpact"
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Budget Impact"
                error={!!fieldState.error}
                helperText={fieldState.error?.type}
                placeholder="$ needed"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">USD</InputAdornment>
                }}
              />
            )}
          />

          <Button variant="contained" color="success" type="submit">
            Submit
          </Button>
        </form>
      </PageBlock>
    </>
  );
};

export default CreateChangeRequestsView;
