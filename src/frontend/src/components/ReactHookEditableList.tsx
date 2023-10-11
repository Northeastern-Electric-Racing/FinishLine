import { Grid, Button, IconButton, TextField, Typography, Stack, InputLabel, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FieldArrayWithId, UseFieldArrayRemove, UseFormRegister, UseFieldArrayAppend } from 'react-hook-form';
import { Title } from '@mui/icons-material';

interface ReactHookEditableListProps {
  name: string;
  ls: FieldArrayWithId[];
  register: UseFormRegister<any>;
  append: UseFieldArrayAppend<any, any>;
  remove: UseFieldArrayRemove;
  title: string;
}

const ReactHookEditableList: React.FC<ReactHookEditableListProps> = ({ name, ls, title, register, append, remove }) => {
  return (
    <>
      <Stack spacing={1}>
        <Stack direction={'row'} spacing={2}>
          <Typography variant="h5">{title}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => append({ bulletId: -1, detail: '' })}
            sx={{ my: 2, width: 'max-content', textTransform: 'none' }}
          >
            + Add {title}
          </Button>
        </Stack>
        <Grid container spacing={2}>
          {
            //</Grid><Grid container sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }} spacing={2}>
          }
          {ls.map((_element, i) => {
            return (
              <>
                <Grid item sx={{ alignItems: 'center' }} xs={12} md={4}>
                  <InputLabel>{title + ' ' + (i + 1)}</InputLabel>
                  <Box sx={{ display: 'flex' }}>
                    <TextField
                      required
                      multiline
                      placeholder={'Enter ' + title + '...'}
                      inputProps={{ style: { fontSize: 14 } }}
                      minRows={2}
                      autoComplete="off"
                      sx={{ width: 12 / 12, padding: 0 }}
                      {...register(`${name}.${i}.detail`)}
                    />
                    <Stack spacing={0}>
                      <IconButton
                        type="button"
                        onClick={() => remove(i)}
                        sx={{ mx: 1, my: 0, color: 'red', borderRadius: '4px', outline: 'solid' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Box></Box>
                    </Stack>
                  </Box>
                </Grid>
              </>
            );
          })}
        </Grid>
      </Stack>
    </>
  );
};

export default ReactHookEditableList;
