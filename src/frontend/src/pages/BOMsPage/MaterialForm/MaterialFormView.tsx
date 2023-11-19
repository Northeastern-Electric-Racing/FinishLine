import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, MenuItem, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { Assembly, Manufacturer, MaterialStatus, MaterialType, Unit } from 'shared';
import NERSuccessButton from '../../../components/NERSuccessButton';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { MaterialFormInput } from './MaterialForm';

export interface MaterialFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<MaterialFormInput>;
  onSubmit: (payload: MaterialFormInput) => void;
  onHide: () => void;
  control: Control<MaterialFormInput, any>;
  errors: FieldErrors<MaterialFormInput>;
  allMaterialTypes: MaterialType[];
  allUnits: Unit[];
  allManufacturers: Manufacturer[];
  assemblies: Assembly[];
  open: boolean;
}

const MaterialFormView: React.FC<MaterialFormViewProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  allMaterialTypes,
  allUnits,
  allManufacturers,
  assemblies,
  open
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle id="form-dialog-title">
        {submitText} Material
        <IconButton
          aria-label="close"
          onClick={onHide}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Controller
                name="status"
                control={control}
                defaultValue={control._defaultValues.status}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    variant="outlined"
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  >
                    {Object.values(MaterialStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="materialTypeName"
                control={control}
                defaultValue={control._defaultValues.materialTypeName}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Type"
                    variant="outlined"
                    error={!!errors.materialTypeName}
                    helperText={errors.materialTypeName?.message}
                  >
                    {allMaterialTypes.map((type) => (
                      <MenuItem key={type.name} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <ReactHookTextField
                name="name"
                control={control}
                label="Name"
                errorMessage={errors.name}
                placeholder="Enter Name for Material"
              />
            </Grid>
            <Grid item xs={4}>
              <ReactHookTextField
                name="manufacturerPartNumber"
                control={control}
                label="Manufacturer Part Number"
                errorMessage={errors.manufacturerPartNumber}
                placeholder="Enter Manufacturer Part Number"
              />
            </Grid>
            <Grid item xs={4}>
              <ReactHookTextField
                name="nerPartNumber"
                control={control}
                label="NER Part Number"
                errorMessage={errors.nerPartNumber}
                placeholder="Enter NER Part Number"
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                name="manufacturerName"
                control={control}
                defaultValue={control._defaultValues.manufacturerName}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Manufactur"
                    variant="outlined"
                    error={!!errors.materialTypeName}
                    helperText={errors.materialTypeName?.message}
                  >
                    {allManufacturers.map((manufacturer) => (
                      <MenuItem key={manufacturer.name} value={manufacturer.name}>
                        {manufacturer.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid xs={4}>
              <Box display={'flex'}>
                <ReactHookTextField
                  name="quantity"
                  control={control}
                  label="Quantity"
                  errorMessage={errors.quantity}
                  placeholder="Enter Quantity"
                />
                <Controller
                  name="unitName"
                  control={control}
                  defaultValue={control._defaultValues.unitName}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Unit"
                      variant="outlined"
                      error={!!errors.unitName}
                      helperText={errors.unitName?.message}
                    >
                      {allUnits.map((unit) => (
                        <MenuItem key={unit.name} value={unit.name}>
                          {unit.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <ReactHookTextField
                name="price"
                control={control}
                label="Price"
                errorMessage={errors.price}
                placeholder="Enter Price"
              />
            </Grid>
            <Grid item xs={12}>
              <ReactHookTextField
                name="linkUrl"
                control={control}
                label="Link"
                errorMessage={errors.linkUrl}
                placeholder="Enter Link"
              />
            </Grid>
            <Grid item xs={12}>
              <ReactHookTextField
                name="notes"
                control={control}
                label="Notes"
                errorMessage={errors.notes}
                placeholder="Enter Notes"
              />
            </Grid>
          </Grid>
          <Box display={'flex'} justifyContent={'flex-end'} mt={2}>
            <Controller
              name="assemblyId"
              control={control}
              defaultValue={control._defaultValues.assemblyId}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Assembly"
                  variant="outlined"
                  error={!!errors.assemblyId}
                  helperText={errors.assemblyId?.message}
                >
                  {assemblies.map((assembly) => (
                    <MenuItem key={assembly.assemblyId} value={assembly.assemblyId}>
                      {assembly.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <NERSuccessButton type="submit">{submitText}</NERSuccessButton>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialFormView;
