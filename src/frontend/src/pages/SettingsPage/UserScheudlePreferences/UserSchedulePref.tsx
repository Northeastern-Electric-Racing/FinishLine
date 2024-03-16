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
    <Grid container columnSpacing={2}>
      <Grid item xs={edit ? 12 : 11} md={10.5}>
        {!edit ? <UserSchedulePrefView /> : <UserSchedulePrefEdit onSubmit={handleConfirm} />}
      </Grid>
      <Grid item xs={edit ? 12 : 1} md={1.5}>
        {!edit ? (
          <IconButton onClick={() => setEdit(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              marginTop: '20px'
            }}
          >
            <NERFailButton onClick={() => setEdit(false)}>Cancel</NERFailButton>
            <NERSuccessButton sx={{ ml: 2 }} type="submit" form="update-user-settings">
              Save
            </NERSuccessButton>
          </Box>
        )}
        {edit && (
          <Box
            className="d-flex flex-col"
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
      </Grid>
    </Grid>
  );
};

export default UserSchedulePref;
