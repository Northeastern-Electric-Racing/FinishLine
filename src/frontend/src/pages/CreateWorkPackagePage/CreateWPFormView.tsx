/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createTheme } from '@mui/material/styles';
import { routes } from '../../utils/Routes';
import { datePipe } from '../../utils/Pipes';
import { EditableTextInputListUtils, FormStates } from './CreateWPForm';
import EditableTextInputList from '../../components/EditableTextInputList';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';

interface CreateWPFormViewProps {
  states: FormStates;
  dependencies: string[];
  depUtils: EditableTextInputListUtils;
  expectedActivities: string[];
  eaUtils: EditableTextInputListUtils;
  deliverables: string[];
  delUtils: EditableTextInputListUtils;
  allowSubmit: boolean;
  onSubmit: (e: any) => void;
  onCancel: (e: any) => void;
}

const CreateWPFormView: React.FC<CreateWPFormViewProps> = ({
  states,
  dependencies,
  depUtils,
  expectedActivities,
  eaUtils,
  deliverables,
  delUtils,
  allowSubmit,
  onSubmit,
  onCancel
}) => {
  const { name, wbsNum, crId, startDate, duration } = states;
  const [startDateVal, setStartDateVal] = useState<Date | null>(null);
  return (
    <>
      <PageTitle
        title={'New Work Package'}
        previousPages={[{ name: 'Work Packages', route: routes.PROJECTS }]}
      />
      <PageBlock title={''}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <TextField
                required
                fullWidth
                sx={{ backgroundColor: 'white' }}
                id=""
                name="name"
                type="text"
                autoComplete="off"
                label="Work Package Name"
                placeholder="Enter work package name..."
                onChange={(e) => name(e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                required
                sx={{ backgroundColor: 'white' }}
                id="crId"
                name="crId"
                type="text"
                label="Change Request ID"
                placeholder="Enter change request ID..."
                onChange={(e) => crId(parseInt(e.target.value))}
                inputProps={{ inputMode: 'numeric', pattern: '[1-9][0-9]*' }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                required
                sx={{ backgroundColor: 'white' }}
                id="wbsNum"
                name="wbsNum"
                type="text"
                label="Project WBS Number"
                autoComplete="off"
                placeholder="Enter project WBS number..."
                onChange={(e) => wbsNum(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <DatePicker
                label="Start Date"
                inputFormat="yyyy-MM-dd"
                value={startDateVal}
                onChange={(val) => {
                  setStartDateVal(val);
                  startDate(datePipe(val!));
                }}
                renderInput={(params) => (
                  <TextField autoComplete="off" sx={{ backgroundColor: 'white' }} {...params} />
                )}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                required
                sx={{ backgroundColor: 'white' }}
                id="duration"
                name="duration"
                type="text"
                label="Duration"
                placeholder="Enter duration..."
                onChange={(e) => duration(parseInt(e.target.value))}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[1-9][0-9]*'
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">weeks</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box marginBottom={1}>
                <Typography variant="caption">Dependencies</Typography>
              </Box>
              <EditableTextInputList
                items={dependencies}
                add={depUtils.add}
                remove={depUtils.remove}
                update={depUtils.update}
              />

              <Box marginBottom={1}>
                <Typography variant="caption">Expected Activities</Typography>
              </Box>
              <EditableTextInputList
                items={expectedActivities}
                add={eaUtils.add}
                remove={eaUtils.remove}
                update={eaUtils.update}
              />

              <Box marginBottom={1}>
                <Typography variant="caption">Deliverabless</Typography>
              </Box>
              <EditableTextInputList
                items={deliverables}
                add={delUtils.add}
                remove={delUtils.remove}
                update={delUtils.update}
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
          </Box>
        </form>
      </PageBlock>
    </>
  );
};

export default CreateWPFormView;
