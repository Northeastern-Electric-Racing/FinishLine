/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangeRequestReason, ChangeRequestType, Project, ProposedSolution, wbsPipe, WorkPackage } from 'shared';
import { routes } from '../../utils/routes';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import CreateProposedSolutionsList from './CreateProposedSolutionsList';
import ReactHookTextField from '../../components/ReactHookTextField';
import { FormControl, FormLabel, IconButton, MenuItem, NativeSelect } from '@mui/material';
import { FormInput } from './CreateChangeRequest';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useAllProjects } from '../../hooks/projects.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { wbsTester } from '../../utils/form';

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
  const {
    handleSubmit,
    control,
    formState: { errors },
    register
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
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

  const wbsDropdownOptions: { label: string; id: string }[] = [];
  projects.forEach((project: Project) => {
    wbsDropdownOptions.push({
      label: `${wbsPipe(project.wbsNum)} - ${project.name}`,
      id: wbsPipe(project.wbsNum)
    });
    project.workPackages.forEach((workPackage: WorkPackage) => {
      wbsDropdownOptions.push({
        label: `${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}`,
        id: wbsPipe(workPackage.wbsNum)
      });
    });
  });

  const wbsAutocompleteOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: any } | null
  ) => {
    if (value) {
      setWbsNum(value.id);
    } else {
      setWbsNum('');
    }
  };

  return (
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
      <PageTitle title="New Change Request" previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]} />
      <PageBlock title="Details">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormLabel>WBS</FormLabel>
            <NERAutocomplete
              id="wbs-autocomplete"
              onChange={wbsAutocompleteOnChange}
              options={wbsDropdownOptions}
              size="small"
              placeholder="Select a project or work package"
              value={wbsDropdownOptions.find((element) => element.id === wbsNum) || null}
              sx={{ width: 1 / 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl>
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
            <FormControl>
              <FormLabel>What</FormLabel>
              <ReactHookTextField
                name="what"
                control={control}
                multiline
                rows={4}
                errorMessage={errors.what}
                placeholder="What is the situation?"
                sx={{ width: 300 }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl>
              <FormLabel>Why</FormLabel>
              <Box>
                {whys.map((_element, index) => (
                  <Box display="flex" flexDirection="row" sx={{ mb: 1 }}>
                    <NativeSelect {...register(`why.${index}.type`)}>
                      {Object.values(ChangeRequestReason).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </NativeSelect>
                    <TextField
                      required
                      autoComplete="off"
                      label="Explain"
                      sx={{ flexGrow: 1, mx: 1 }}
                      {...register(`why.${index}.explain`)}
                    />
                    <IconButton type="button" onClick={() => removeWhy(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </FormControl>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 1 }}
              onClick={() => appendWhy({ type: ChangeRequestReason.Design, explain: '' })}
            >
              Add Reason
            </Button>
            <FormHelperText>{errors.why?.message}</FormHelperText>
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="Proposed Solutions">
        <CreateProposedSolutionsList proposedSolutions={proposedSolutions} setProposedSolutions={setProposedSolutions} />
      </PageBlock>
      <Box textAlign="center">
        <Button variant="contained" color="error" onClick={handleCancel} sx={{ mx: 2 }}>
          Cancel
        </Button>
        <Button variant="contained" color="success" type="submit" sx={{ mx: 2 }}>
          Submit
        </Button>
      </Box>
    </form>
  );
};

export default CreateChangeRequestsView;
