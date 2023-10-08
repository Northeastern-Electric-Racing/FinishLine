import { Grid, Button, IconButton, TextField, InputLabel, Box, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  label: string;
  title: string;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({
  name,
  ls,
  register,
  append,
  remove,
  label = 'item'
}) => {
  return (
    <>
      <Box>
        <Stack direction="row" spacing={2}>
          <Typography variant="h5">{label + 's'}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => append({ bulletId: -1, detail: '' })}
            sx={{ my: 2, width: 'max-content', textTransform: 'none' }}
          >
            {'Add ' + label}
          </Button>
        </Stack>
        <Grid container spacing={2}>
          {ls.map((_element, i) => {
            return (
              //Grid container with direction "row", and then each item inside is wrapped in a grid-element
              //xs argument: number out of 12, takes up that amount of space
              <Grid item sx={{ alignItems: 'center' }} xs={12} md={4}>
                <InputLabel>{label + ' ' + (i + 1)}</InputLabel>
                <Box sx={{ display: 'flex' }}>
                  <TextField
                    required
                    multiline
                    placeholder={'Enter a ' + label + '...'}
                    inputProps={{ style: { fontSize: 14 } }}
                    minRows={2}
                    autoComplete="off"
                    sx={{ width: 12 / 12, padding: 0 }}
                    {...register(`${name}.${i}.detail`)}
                  />
                  <Stack spacing={0}>
                    <IconButton type="button" onClick={() => remove(i)} sx={{ mx: 1, my: 0 }}>
                      <DeleteIcon />
                    </IconButton>
                    <Box></Box>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

export default ReactHookEditableList;
