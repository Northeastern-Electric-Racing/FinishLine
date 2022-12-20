/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PageBlock from '../../layouts/PageBlock';
import Grid from '@mui/material/Grid';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { routes } from '../../utils/routes';
import { useTheme } from '@mui/material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateProjectFormInputs } from './CreateProjectForm';
import ReactHookTextField from '../../components/ReactHookTextField';
import Typography from '@mui/material/Typography';
import { useQuery } from '../../hooks/utils.hooks';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  carNumber: yup
    .number()
    .typeError('Car Number must be a number')
    .required('Car Number is required')
    .integer('Car Number must be an integer')
    .min(1, 'Car Number must be greater than or equal to 1'),
  crId: yup
    .number()
    .typeError('CR ID must be a number')
    .required('CR ID is required')
    .integer('CR ID must be an integer')
    .min(1, 'CR ID must be greater than or equal to 1'),
  summary: yup.string().required('Summary is required')
});

interface CreateProjectFormViewProps {
  allowSubmit: boolean;
  onCancel: (e: any) => void;
  onSubmit: (project: CreateProjectFormInputs) => void;
}

const CreateProjectFormView: React.FC<CreateProjectFormViewProps> = ({ allowSubmit, onCancel, onSubmit }) => {
  const theme = useTheme();
  const query = useQuery();

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      carNumber: Number(query.get('wbs')?.charAt(0)),
      crId: Number(query.get('crId')),
      summary: ''
    }
  });

  const style = { border: '1px solid ' + theme.palette.divider, borderRadius: 2 };

  return (
    <form
      id={'create-project-form'}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <PageTitle title={'New Project'} previousPages={[{ name: 'Projects', route: routes.PROJECTS }]} />
      <PageBlock title={''}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="caption">Change Request ID</Typography>
            </Box>
            <ReactHookTextField
              name="crId"
              control={control}
              placeholder="Enter change request ID..."
              errorMessage={errors.crId}
              type="number"
              sx={style}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Box>
              <Typography variant="caption">Car Number</Typography>
            </Box>
            <ReactHookTextField
              name="carNumber"
              control={control}
              placeholder="Enter car number..."
              errorMessage={errors.carNumber}
              type="number"
              sx={style}
            />
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography variant="caption">Project Name</Typography>
            </Box>
            <ReactHookTextField
              name="name"
              control={control}
              placeholder="Enter project name..."
              errorMessage={errors.name}
              sx={style}
            />
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography variant="caption">Project Summary</Typography>
            </Box>
            <ReactHookTextField
              name="summary"
              control={control}
              placeholder="Enter summary..."
              errorMessage={errors.summary}
              sx={style}
            />
          </Grid>
        </Grid>
        <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" type="submit" disabled={!allowSubmit}>
            Create
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </PageBlock>
    </form>
  );
};

export default CreateProjectFormView;
