/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeRequestReason, ChangeRequestType, Project, ProposedSolution, wbsPipe, WorkPackage } from 'shared';
import { routes } from '../../utils/routes';
import PageBlock from '../../layouts/PageBlock';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import CreateProposedSolutionsList from './CreateProposedSolutionsList';
import ReactHookTextField from '../../components/ReactHookTextField';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Select
} from '@mui/material';
import { FormInput } from './CreateChangeRequest';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { wbsTester } from '../../utils/form';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import { wbsNamePipe } from '../../utils/pipes';
import PageLayout from '../../components/PageLayout';
import { wbsNumComparator } from 'shared/src/validate-wbs';
import { useQuery } from '../../hooks/utils.hooks';

interface CreateChangeRequestViewProps {
  wbsNum: string;
  setWbsNum: (val: string) => void;
  crDesc: string;
  onSubmit: (data: FormInput) => Promise<void>;
  proposedSolutions: ProposedSolution[];
  setProposedSolutions: (ps: ProposedSolution[]) => void;
  handleCancel: () => void;
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

const CreateChangeRequestsView: React.FC<CreateChangeRequestViewProps> = ({
  wbsNum,
  setWbsNum,
  crDesc,
  onSubmit,
  proposedSolutions,
  setProposedSolutions,
  handleCancel
}) => {
  const query = useQuery();
  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: query.get('budgetChange')
      ? {
          what: 'Increase the budget to account for the cost of materials',
          why: [{ type: ChangeRequestReason.Other, explain: 'The cost of materials ended up exceeding the initial budget' }],
          type: ChangeRequestType.Issue
        }
      : {
          what: crDesc,
          why: [{ type: ChangeRequestReason.Other, explain: '' }],
          type: ChangeRequestType.Issue
        }
  });
  const { fields: whys, append: appendWhy, remove: removeWhy } = useFieldArray({ control, name: 'why' });

  const { isLoading, isError, error, data: projects } = useAllProjects();

  const permittedTypes = Object.values(ChangeRequestType).filter(
    (t) => t !== ChangeRequestType.Activation && t !== ChangeRequestType.StageGate
  );

  if (isLoading || !projects) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const projectOptions: { label: string; id: string }[] = [];

  const wbsDropdownOptions: { label: string; id: string }[] = [];

  projects.forEach((project: Project) => {
    wbsDropdownOptions.push({
      label: `${wbsNamePipe(project)}`,
      id: wbsPipe(project.wbsNum)
    });
    projectOptions.push({
      label: `${wbsNamePipe(project)}`,
      id: wbsPipe(project.wbsNum)
    });
    project.workPackages.forEach((workPackage: WorkPackage) => {
      wbsDropdownOptions.push({
        label: `${wbsNamePipe(workPackage)}`,
        id: wbsPipe(workPackage.wbsNum)
      });
    });
  });

  wbsDropdownOptions.sort((wbsNum1, wbsNum2) => wbsNumComparator(wbsNum1.id, wbsNum2.id));

  const wbsAutocompleteOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      setWbsNum(value.id);
    } else {
      setWbsNum('');
    }
  };

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
        control={control}
        label="Explain"
        sx={{ flexGrow: 1, mx: 1, borderRadius: 2 }}
        {...register(`why.${index}.explain`)}
        errorMessage={errors.why?.[index]?.explain}
      />
    );
  };

  return (
    <PageLayout title="New Change Request" previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}>
      <form
        id={'create-standard-change-request-form'}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
        }}
        onKeyPress={(e) => {
          e.key === 'Enter' && e.preventDefault();
        }}
      >
        <PageBlock title="Details">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormLabel>WBS</FormLabel>
              <NERAutocomplete
                id="wbs-autocomplete"
                onChange={wbsAutocompleteOnChange}
                options={wbsDropdownOptions}
                size="small"
                placeholder="Select a project or work package"
                value={wbsDropdownOptions.find((element) => element.id === wbsNum) || null}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <FormLabel>Type</FormLabel>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <TextField select onChange={onChange} value={value}>
                      {permittedTypes.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>What</FormLabel>
                <ReactHookTextField
                  name="what"
                  control={control}
                  multiline
                  rows={4}
                  errorMessage={errors.what}
                  placeholder="What is the situation?"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Why</FormLabel>
                <Box>
                  {whys.map((element, index) => (
                    <Box display="flex" flexDirection="row" sx={{ mb: 1 }}>
                      <Select
                        {...register(`why.${index}.type`)}
                        sx={{ width: 200 }}
                        defaultValue={element.type}
                        key={element.id}
                      >
                        {Object.values(ChangeRequestReason).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {renderReasonInput(index)}
                      <IconButton type="button" onClick={() => removeWhy(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
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
          </Grid>
        </PageBlock>
        <PageBlock title="Proposed Solutions">
          <CreateProposedSolutionsList proposedSolutions={proposedSolutions} setProposedSolutions={setProposedSolutions} />
        </PageBlock>
        <Box textAlign="right">
          <NERFailButton variant="contained" onClick={handleCancel} sx={{ mx: 1 }}>
            Cancel
          </NERFailButton>
          <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
            Submit
          </NERSuccessButton>
        </Box>
      </form>
    </PageLayout>
  );
};

export default CreateChangeRequestsView;
