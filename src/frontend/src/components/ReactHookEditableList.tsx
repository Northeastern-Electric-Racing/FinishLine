import { Grid, IconButton, TextField, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';
import { Box } from '@mui/system';
import { NERButton } from './NERButton';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  bulletName?: string;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({ name, ls, bulletName, register, append, remove }) => {
  return (
    <>
      <Grid container columnSpacing={{ xs: 4, sm: 2, md: 3 }}>
        {ls.map((_element, i) => {
          return (
            <Grid item xs={12} md={6} lg={4} key={`${name}-${i}`}>
              <InputLabel sx={{ marginBottom: '5px', marginTop: '7px' }}>
                {bulletName} {i + 1}
              </InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'start', marginBottom: '10px' }}>
                <TextField
                  required
                  autoComplete="off"
                  placeholder={'Enter ' + bulletName + ' . . .'}
                  sx={{ width: 12 / 12 }}
                  multiline
                  maxRows={3}
                  {...register(`${name}.${i}.detail`)}
                />
                <IconButton
                  type="button"
                  onClick={() => remove(i)}
                  sx={{ mx: 1, color: 'red', marginLeft: '15px', marginTop: '3px', borderRadius: '4px', outline: 'solid' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          );
        })}
      </Grid>
      <NERButton
        variant="contained"
        color="primary"
        onClick={() => append({ bulletId: -1, detail: '' })}
        sx={{ width: 'max-content', marginBottom: '30px', marginTop: '10px' }}
      >
        {bulletName ? `+ Add ${bulletName}` : '+ Add new bullet'}
      </NERButton>
    </>
  );
};

export default ReactHookEditableList;
