import { Grid, IconButton, TextField, InputLabel, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';
import { NERButton } from './NERButton';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  bulletName: string;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({
  name,
  ls,
  register,
  append,
  remove,
  bulletName = 'Item'
}) => {
  return (
    <Box>
      <Grid container spacing={2}>
        {ls.map((_element, i) => {
          return (
            <Grid item sx={{ alignItems: 'center' }} xs={12} md={6} lg={4}>
              <InputLabel>{bulletName + ' ' + (i + 1)}</InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'start' }}>
                <TextField
                  required
                  multiline
                  placeholder={'Enter a ' + bulletName + '...'}
                  inputProps={{ style: { fontSize: 14 } }}
                  minRows={2}
                  autoComplete="off"
                  sx={{ width: 12 / 12, padding: 0 }}
                  {...register(`${name}.${i}.detail`)}
                />
                <IconButton
                  type="button"
                  onClick={() => remove(i)}
                  sx={{ mx: 1, color: 'red', marginLeft: '15px', borderRadius: '4px', outline: 'solid', marginTop: '3px' }}
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
        sx={{ my: 2, width: 'max-content', textTransform: 'none' }}
      >
        {'Add ' + bulletName}
      </NERButton>
    </Box>
  );
};

export default ReactHookEditableList;
