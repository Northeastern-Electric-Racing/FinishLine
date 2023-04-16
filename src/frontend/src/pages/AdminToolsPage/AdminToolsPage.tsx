/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageTitle from '../../layouts/PageTitle/PageTitle';
import AdminToolsUserManagement from './AdminToolsUserManagement';
import PageBlock from '../../layouts/PageBlock';
import { NERButton } from '../../components/NERButton';
import { Box, TextField, Tooltip } from '@mui/material';
import { useState } from 'react';

const AdminToolsPage: React.FC = () => {
  const [days, setDays] = useState<string | null>(null);

  const [disableButton, setDisableButton] = useState(false);

  const disableAndTriggerEndpoint = () => {
    setDisableButton(true);
  };

  return (
    <>
      <PageTitle title={'Admin Tools'} previousPages={[]} />
      <AdminToolsUserManagement />
      <PageBlock title={'Slack Upcoming Deadlines'}>
        <Box gap={2} sx={{ display: 'flex' }}>
          <Tooltip title="Enter in a positive number of days until a deadline, where all projects with this deadline will be slacked">
            <TextField
              label="Days Until Deadline"
              type="number"
              value={days}
              onChange={(event) => {
                setDays(event.target.value);
              }}
            ></TextField>
          </Tooltip>
          <NERButton
            variant="contained"
            sx={{ mt: 1 }}
            disabled={!days || parseInt(days, 10) <= 0 || disableButton}
            onClick={disableAndTriggerEndpoint}
          >
            Send
          </NERButton>
        </Box>
      </PageBlock>
    </>
  );
};

export default AdminToolsPage;
