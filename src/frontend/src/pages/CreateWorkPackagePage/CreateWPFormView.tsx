/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { routes } from '../../utils/routes';
import { EditableTextInputListUtils, FormStates } from './CreateWPForm';
import EditableTextInputList from '../../components/EditableTextInputList';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';

interface CreateWPFormViewProps {
  states: FormStates;
  dependencies: string[];
  initialValues: { name: string; wbsNum: string; crId: string; duration: number };
  depUtils: EditableTextInputListUtils;
  expectedActivities: string[];
  eaUtils: EditableTextInputListUtils;
  deliverables: string[];
  delUtils: EditableTextInputListUtils;
  allowSubmit: boolean;
  onSubmit: (e: any) => void;
  onCancel: (e: any) => void;
  startDate: Date | undefined;
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
  onCancel,
  initialValues,
  startDate
}) => {
  const { name, wbsNum, crId, startDate: setStartDate, duration } = states;

  const dateOnChange = (val: Date | null | undefined) => {
    if (!val) return;
    setStartDate(val);
  };

  return (
    <>
      <PageTitle title={'New Work Package'} previousPages={[{ name: 'Work Packages', route: routes.PROJECTS }]} />
      <PageBlock title={''}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={9}>
              <TextField
                required
                fullWidth
                id=""
                name="name"
                type="text"
                autoComplete="off"
                label="Work Package Name"
                placeholder="Enter work package name..."
                onChange={(e) => name(e.target.value)}
                defaultValue={initialValues.name}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                required
                id="crId"
                name="crId"
                type="text"
                autoComplete="off"
                label="Change Request ID"
                placeholder="Enter change request ID..."
                onChange={(e) => crId(e.target.value)}
                inputProps={{ inputMode: 'numeric', pattern: '[1-9][0-9]*' }}
                defaultValue={initialValues.crId}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                required
                id="wbsNum"
                name="wbsNum"
                type="text"
                label="Project WBS Number"
                autoComplete="off"
                placeholder="Enter project WBS number..."
                onChange={(e) => wbsNum(e.target.value)}
                defaultValue={initialValues.wbsNum}
              />
            </Grid>
            <Grid item xs={2}>
              <DatePicker
                label="Start Date"
                inputFormat="yyyy-MM-dd"
                value={startDate}
                onChange={dateOnChange}
                renderInput={(params) => <TextField autoComplete="off" {...params} />}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                required
                id="duration"
                name="duration"
                type="text"
                autoComplete="off"
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
                defaultValue={initialValues.duration === -1 ? undefined : initialValues.duration}
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
                <Typography variant="caption">Deliverables</Typography>
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
