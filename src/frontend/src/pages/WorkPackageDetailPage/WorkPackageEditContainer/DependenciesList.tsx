/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grid, IconButton, TextField } from '@mui/material';
import { FieldArrayWithId, UseFieldArrayRemove } from 'react-hook-form';
import PageBlock from '../../../layouts/PageBlock';
import AddIcon from '@mui/icons-material/Add';

interface DependenciesListProps {
  ls: FieldArrayWithId[];
  register: any;
  append: any;
  remove: UseFieldArrayRemove;
}

const DependenciesList: React.FC<DependenciesListProps> = ({ ls, register, append, remove }) => {
  const [newDependency, setNewDependency] = useState('');

  const handleAdd = () => {
    append({ wbsNumId: newDependency });
    setNewDependency('');
  };

  return (
    <PageBlock title="Dependencies">
      {ls.map((_element, i) => {
        return (
          <Grid item sx={{ display: 'flex' }}>
            <TextField
              required
              autoComplete="off"
              sx={{ width: 3 / 10, padding: 0 }}
              variant="outlined"
              {...register(`dependencies.${i}.wbsNumId`)}
              disabled
              InputProps={{
                endAdornment: (
                  <IconButton
                    sx={{
                      width: 60,
                      height: 56,
                      borderRadius: 0,
                      border: '1px solid',
                      borderColor: 'red',
                      backgroundColor: 'red'
                    }}
                    type="button"
                    onClick={() => remove(i)}
                  >
                    <DeleteIcon sx={{ color: 'black' }} />
                  </IconButton>
                )
              }}
            />
          </Grid>
        );
      })}
      <TextField
        autoComplete="off"
        variant="outlined"
        sx={{ width: 3 / 10 }}
        onChange={(newValue) => setNewDependency(newValue.target.value)}
        value={newDependency}
        InputProps={{
          endAdornment: (
            <IconButton
              sx={{
                width: 60,
                height: 56,
                borderRadius: 0,
                border: '1px solid',
                borderColor: 'green',
                backgroundColor: 'green'
              }}
              size="large"
              edge="end"
              type="button"
              onClick={handleAdd}
            >
              <AddIcon sx={{ color: 'white' }} />
            </IconButton>
          )
        }}
      />
    </PageBlock>
  );
};

export default DependenciesList;
