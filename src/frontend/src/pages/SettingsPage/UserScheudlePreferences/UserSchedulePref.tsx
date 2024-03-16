/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { Grid, IconButton, Box } from '@mui/material';
import UserSchedulePrefView from './UserSchedulePrefView';
import UserSchedulePrefEdit from './UserSchedulePrefEdit';
import PageBlock from '../../../layouts/PageBlock';

export interface SchedulePrefFormInput {
  email: String;
  zoomLink: String;
}

const UserSchedulePref: React.FC = () => {
  const [edit, setEdit] = useState(false);

  const handleConfirm = async ({ email, zoomLink }: SchedulePrefFormInput) => {
    setEdit(false);
  };

  return (
    <PageBlock
      title="User Schedule Settings"
      headerRight={
        !edit ? (
          <IconButton onClick={() => setEdit(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box
            className="d-flex flex-row"
            sx={{
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
            <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-settings">
              Save
            </NERSuccessButton>
          </Box>
        )
      }
    >
      <Grid container>{!edit ? <UserSchedulePrefView /> : <UserSchedulePrefEdit onSubmit={handleConfirm} />}</Grid>
      {edit && (
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            marginTop: '20px'
          }}
        >
          <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
          <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-settings">
            Save
          </NERSuccessButton>
        </Box>
      )}
    </PageBlock>
  );
};

export default UserSchedulePref;
