/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageTitle from '../../layouts/PageTitle/PageTitle';
import AdminToolsUserManagement from './AdminToolsUserManagement';
import PageBlock from '../../layouts/PageBlock';
import { NERButton } from '../../components/NERButton';
import { Box, TextField } from '@mui/material';

const AdminToolsPage: React.FC = () => {
  const [days, setDays] = React.useState<string | null>(null);

  const [hideButton, setHideButton] = React.useState(true);

  const toggleButton = () => {
    setHideButton(!hideButton);
  };

  return (
    <>
      <PageTitle title={'Admin Tools'} previousPages={[]} />
      <AdminToolsUserManagement />
      <PageBlock title={'Slack Upcoming Deadlines'}>
        <Box sx={{ display: 'flex' }}>
          <TextField
            title={'Days Until Deadline'}
            type="number"
            value={days}
            onChange={(event) => {
              setDays(event.target.value);
            }}
          ></TextField>
          <NERButton sx={{ mt: '20px', float: 'right' }} variant="contained" disabled={!days} onClick={toggleButton}>
            Send
          </NERButton>
        </Box>
      </PageBlock>
    </>
  );
};

export default AdminToolsPage;
