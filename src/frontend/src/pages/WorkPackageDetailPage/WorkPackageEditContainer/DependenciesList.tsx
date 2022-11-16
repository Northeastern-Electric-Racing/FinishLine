/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useState } from 'react';
import { validateWBS, WbsNumber } from 'shared';
import HorizontalList from '../../../components/HorizontalList';
import Dependency from '../WorkPackageViewContainer/Dependency';
import ReactHookTextField from '../../../components/ReactHookTextField';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Grid, IconButton, TextField } from '@mui/material';

interface DependenciesListProps {
  name?: string;
  ls: WbsNumber[];
  register: any;
  append: any;
  remove: any;
}

const DependenciesList: React.FC<DependenciesListProps> = ({ name, ls, register, append, remove }) => {
  return (
    <>
      {ls.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField required autoComplete="off" sx={{ width: 9 / 10 }} />
            <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        );
      })}
      <Button variant="contained" color="success" onClick={() => append({ bulletId: -1, detail: '' })} sx={{ mt: 2 }}>
        + Add New Bullet
      </Button>
    </>
  );
};

export default DependenciesList;
