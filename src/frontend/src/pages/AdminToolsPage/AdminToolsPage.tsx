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
import { useSlackUpcomingDeadlines } from '../../hooks/work-packages.hooks';

const AdminToolsPage: React.FC = () => {
  const [days, setDays] = useState<string | null>(null);

  const [disableButton, setDisableButton] = useState(false);

  const slack = useSlackUpcomingDeadlines();

  const disableAndTriggerEndpoint = async (daysUntilDeadline: number) => {
    setDisableButton(true);
    await slack.mutateAsync(daysUntilDeadline);
  };

  return (
    <>
      <PageTitle title={'Admin Tools'} previousPages={[]} />
      <AdminToolsUserManagement />
      <PageBlock title={'Slack Upcoming Deadlines'}>
        <Box gap={2} sx={{ display: 'flex' }}>
          <Tooltip title="Enter in a number of days until a deadline that is greater than or equal to zero, where all work packages that are due on this day or earlier will be slacked (ex. if the day is 5, all work packages due 5 days from now or before (even into the past from today) will be slacked)">
            <TextField
              label="Days Until Deadline"
              type="number"
              value={days}
              onChange={(event) => {
                setDays(event.target.value);
              }}
            />
          </Tooltip>
          <NERButton
            variant="contained"
            disabled={!days || parseInt(days, 10) < 0 || disableButton}
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
