/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { routes } from '../../utils/Routes';
import { EditableTextInputListUtils, FormStates } from './CreateWPForm';
import EditableTextInputList from '../../components/EditableTextInputList';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import { datePipe } from '../../utils/Pipes';

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
          <TextField
            required
            id="name"
            name="name"
            type="text"
            label="Work Package Name"
            placeholder="Enter work package name..."
            onChange={(e) => name(e.target.value)}
          />

          <TextField
            required
            id="wbsNum"
            name="wbsNum"
            type="text"
            label="Project WBS Number"
            placeholder="Enter project WBS number..."
            onChange={(e) => wbsNum(e.target.value)}
          />
          <TextField
            required
            id="crId"
            name="crId"
            type="text"
            label="Change Request ID"
            placeholder="Enter change request ID..."
            onChange={(e) => crId(parseInt(e.target.value))}
            inputProps={{ inputMode: 'numeric', pattern: '[1-9][0-9]*' }}
          />

          <DatePicker
            label="Start Date"
            inputFormat="yyyy-MM-dd"
            value={startDateVal}
            onChange={(val) => {
              setStartDateVal(val);
              startDate(datePipe(val!));
            }}
            renderInput={(params) => <TextField {...params} />}
          />

          <TextField
            required
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
