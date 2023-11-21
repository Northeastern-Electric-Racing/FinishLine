import { FormControl, Grid, MenuItem, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { Assembly, Manufacturer, MaterialType, Unit } from 'shared';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { MaterialFormInput } from './MaterialForm';
import NERFormModal from '../../../components/NERFormModal';

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
    <NERFormModal
      open={open}
      onHide={onHide}
      title={submitText + ' Material'}
      reset={() => {}}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId={submitText + '-material-form'}
      showCloseButton
    >
      <Grid container spacing={2} mt={1}>
        <Grid item xs={4}>
          <FormControl fullWidth>
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
                  {['ORDERED', 'UNORDERED', 'SHIPPED', 'RECEIVED'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
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
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <ReactHookTextField
              name="name"
              control={control}
              label="Name"
              errorMessage={errors.name}
              placeholder="Enter Name for Material"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <ReactHookTextField
              name="manufacturerPartNumber"
              control={control}
              label="Manufacturer Part Number"
              errorMessage={errors.manufacturerPartNumber}
              placeholder="Enter Manufacturer Part Number"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <ReactHookTextField
              required={false}
              name="nerPartNumber"
              control={control}
              label="NER Part Number"
              errorMessage={errors.nerPartNumber}
              placeholder="Enter NER Part Number"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Controller
              name="manufacturerName"
              control={control}
              defaultValue={control._defaultValues.manufacturerName}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Manufacturer"
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
          </FormControl>
        </Grid>
        <Grid xs={4}>
          <Box display={'flex'} alignItems={'center'} mt={2} ml={2}>
            <FormControl fullWidth>
              <ReactHookTextField
                name="quantity"
                control={control}
                label="Quantity"
                errorMessage={errors.quantity}
                placeholder="Enter Quantity"
              />
            </FormControl>
            <FormControl fullWidth>
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
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <ReactHookTextField
              name="price"
              control={control}
              label="Price"
              errorMessage={errors.price}
              placeholder="Enter Price"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <ReactHookTextField
              name="subtotal"
              control={control}
              label="Subtotal"
              errorMessage={errors.subtotal}
              placeholder="Enter Subtotal"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <ReactHookTextField
              name="linkUrl"
              control={control}
              label="Link"
              errorMessage={errors.linkUrl}
              placeholder="Enter Link"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <ReactHookTextField
              name="notes"
              control={control}
              label="Notes"
              errorMessage={errors.notes}
              placeholder="Enter Notes"
            />
          </FormControl>
        </Grid>
      </Grid>
      <Box display={'flex'} justifyContent={'flex-end'} mt={2}>
        <FormControl sx={{ width: 200, mr: 2 }}>
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
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default MaterialFormView;
