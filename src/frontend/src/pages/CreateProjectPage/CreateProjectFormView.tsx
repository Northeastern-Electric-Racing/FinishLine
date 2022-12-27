/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import PageBlock from '../../layouts/PageBlock';
import Grid from '@mui/material/Grid';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { routes } from '../../utils/Routes';
import { CreateProjectFormStates } from './CreateProjectForm';

interface CreateProjectFormViewProps {
  states: CreateProjectFormStates;
  allowSubmit: boolean;
  onCancel: (e: any) => void;
  onSubmit: (e: any) => void;
}

const CreateProjectFormView: React.FC<CreateProjectFormViewProps> = ({ states, allowSubmit, onCancel, onSubmit }) => {
  const { name, carNumber, crId, summary } = states;

  return (
    <>
      <PageTitle title={'New Project'} previousPages={[{ name: 'Projects', route: routes.PROJECTS }]} />
      <PageBlock title={''}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <TextField
                required
                id="name"
                name="name"
                type="text"
                label="Project Name"
                sx={{ backgroundColor: 'white' }}
                autoComplete="off"
                placeholder="Enter project name..."
                onChange={(e) => name(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                required
                id="carNumber"
                name="carNumber"
                type="text"
                label="Car Number"
                sx={{ backgroundColor: 'white' }}
                placeholder="Enter car number..."
                onChange={(e) => carNumber(parseInt(e.target.value))}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                required
                id="crId"
                name="crId"
                type="text"
                label="Change Request ID"
                sx={{ backgroundColor: 'white' }}
                placeholder="Enter change request ID..."
                onChange={(e) => crId(parseInt(e.target.value))}
                inputProps={{ inputMode: 'numeric', pattern: '[1-9][0-9]*' }}
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                required
                fullWidth
                multiline
                minRows={2}
                id="summary"
                name="summary"
                type="text"
                label="Project Summary"
                sx={{ backgroundColor: 'white' }}
                placeholder="Enter summary..."
                onChange={(e) => summary(e.target.value)}
              />
            </Grid>
          </Grid>
          <Box display="flex" flexDirection="row-reverse" gap={2}>
            <Button variant="contained" color="primary" type="submit" disabled={!allowSubmit}>
              Create
            </Button>
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
            ``
          </Box>
        </form>
      </PageBlock>
    </>
  );
};

export default CreateProjectFormView;
