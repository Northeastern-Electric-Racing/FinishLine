/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { ThemeName } from 'shared';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { Grid, IconButton, Box } from '@mui/material';
import UserPreferencesView from './UserOtherPrefView';
import UserPreferencesEdit from './UserOtherPrefEdit';

export interface PreferencesFormInput {
  defaultTheme: ThemeName;
}

const UserOtherPref: React.FC = () => {
  const [edit, setEdit] = useState(false);

  const handleConfirm = async ({ defaultTheme }: PreferencesFormInput) => {
    setEdit(false);
  };

  return (
    <Grid container columnSpacing={2}>
      <Grid item xs={edit ? 12 : 11} md={10.5}>
        {!edit ? <UserPreferencesView /> : <UserPreferencesEdit onSubmit={handleConfirm} />}
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

export default UserOtherPref;
