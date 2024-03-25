import { FormControl, FormHelperText, FormLabel, Grid, InputAdornment, MenuItem, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { Control, Controller, FieldErrors, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Assembly, Manufacturer, MaterialType, Unit } from 'shared';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import { MaterialFormInput } from './MaterialForm';
import NERFormModal from '../../../../../components/NERFormModal';
import DetailDisplay from '../../../../../components/DetailDisplay';
import NERAutocomplete from '../../../../../components/NERAutocomplete';
import { NERButton } from '../../../../../components/NERButton';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';

export interface MaterialFormViewProps {
  submitText: 'Add' | 'Edit';
  handleSubmit: UseFormHandleSubmit<MaterialFormInput>;
  onSubmit: (payload: MaterialFormInput) => void;
  onHide: () => void;
  control: Control<MaterialFormInput, any>;
  errors: FieldErrors<MaterialFormInput>;
  allMaterialTypes: MaterialType[];
  allUnits: Unit[];
  packSizes: string[];
  allManufacturers: Manufacturer[];
  assemblies: Assembly[];
  open: boolean;
  watch: UseFormWatch<MaterialFormInput>;
  createManufacturer: (name: string) => void;
  setValue: UseFormSetValue<MaterialFormInput>;
}

const manufacturersToAutocomplete = (manufacturer: Manufacturer): { label: string; id: string } => {
  return { label: manufacturer.name, id: manufacturer.name };
};

const MaterialFormView: React.FC<MaterialFormViewProps> = ({
  submitText,
  handleSubmit,
  onSubmit,
  onHide,
  control,
  errors,
  allMaterialTypes,
  allUnits,
  packSizes,
  allManufacturers,
  assemblies,
  open,
  watch,
  createManufacturer,
  setValue
}) => {
  const quantity = watch('quantity');
  const price = watch('price');
  const subtotal = quantity && price && parseFloat((quantity * price).toFixed(2));

  const onCostBlurHandler = (value: number) => {
    setValue(`price`, parseFloat(value.toFixed(2)));
  };

  const [showPackInput, setShowPackInput] = useState(true);

  // Existing logic to watch unit selection
  const unitName = watch('unitName');

  // useEffect to update showPackInput based on unitName
  useEffect(() => {
    setShowPackInput(unitName === 'Pack');
  }, [unitName]);

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
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Name</FormLabel>
            <ReactHookTextField
              name="name"
              control={control}
              errorMessage={errors.name}
              placeholder="Enter Name for Material"
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Status</FormLabel>
            <Controller
              name="status"
              control={control}
              defaultValue={control._defaultValues.status}
              render={({ field }) => (
                <TextField {...field} select variant="outlined" error={!!errors.status} helperText={errors.status?.message}>
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
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Type</FormLabel>
            <Controller
              name="materialTypeName"
              control={control}
              defaultValue={control._defaultValues.materialTypeName}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
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
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Manufacturer</FormLabel>
            <Controller
              name="manufacturerName"
              control={control}
              render={({ field: { onChange, value } }) => {
                const mappedManufacturers = allManufacturers
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(manufacturersToAutocomplete);
                const onClear = () => {
                  setValue('manufacturerName', '');
                  onChange('');
                };
                return (
                  <Box sx={{ alignItems: 'center' }}>
                    <NERAutocomplete
                      sx={{ bgcolor: 'inherit' }}
                      id={'manufacturer'}
                      size="medium"
                      options={mappedManufacturers}
                      value={mappedManufacturers.find((manufacturer) => manufacturer.label === value) || null}
                      placeholder="Select Manufacturer"
                      onChange={(_event, newValue) => {
                        newValue ? onChange(newValue.id) : onClear();
                      }}
                    />
                  </Box>
                );
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
          <NERButton
            sx={{ width: '100%', height: '56px' }}
            variant="contained"
            onClick={() => {
              const newManufacturerName = prompt('Enter New Manufacturer Name');
              if (newManufacturerName !== null) {
                createManufacturer(newManufacturerName);
              }
            }}
          >
            Add New Manufacturer <AddIcon sx={{ paddingLeft: '7px' }}></AddIcon>
          </NERButton>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Manufacturer Part Number</FormLabel>
            <ReactHookTextField
              name="manufacturerPartNumber"
              control={control}
              errorMessage={errors.manufacturerPartNumber}
              placeholder="Enter Manufacturer Part Number"
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>PDM File Name (optional)</FormLabel>
            <ReactHookTextField
              required={false}
              name="pdmFileName"
              control={control}
              errorMessage={errors.pdmFileName}
              placeholder="Enter PDM File Name"
            />
          </FormControl>
        </Grid>
        <Grid xs={6}>
          <Box display={'flex'} alignItems={'center'} mt={2} ml={2}>
            <FormControl fullWidth>
              <FormLabel>Quantity</FormLabel>
              <ReactHookTextField
                name="quantity"
                control={control}
                errorMessage={errors.quantity}
                placeholder="Enter Quantity"
                type="number"
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>Unit (optional)</FormLabel>
              <Controller
                name="unitName"
                control={control}
                defaultValue={control._defaultValues.unitName}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    variant="outlined"
                    error={!!errors.unitName}
                    helperText={errors.unitName?.message}
                    value={field.value || ''}
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
        {/** Conditionally render the Pack input field **/}
        {showPackInput && (
          <Grid item xs={6}>
            <FormControl fullWidth>
              <FormLabel>Pack Size</FormLabel>
              <Controller
                name="packSize"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select variant="outlined">
                    {packSizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </FormControl>
          </Grid>
        )}
        <Grid item xs={3}>
          <FormControl fullWidth>
            <FormLabel>Price</FormLabel>
            <Controller
              name={`price`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant={'outlined'}
                  type="number"
                  autoComplete="off"
                  placeholder="Enter Price"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  onBlur={(e) => onCostBlurHandler(parseFloat(e.target.value))}
                  sx={{ width: '100%' }}
                  error={!!errors.price}
                />
              )}
            />
            <FormHelperText error>{errors.price}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={3} display="flex" alignItems="center" mt={2}>
          <DetailDisplay label="Subtotal" content={'$' + subtotal.toString()} />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Link</FormLabel>
            <ReactHookTextField name="linkUrl" control={control} errorMessage={errors.linkUrl} placeholder="Enter Link" />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Notes (optional)</FormLabel>
            <ReactHookTextField
              name="notes"
              control={control}
              errorMessage={errors.notes}
              placeholder="Enter Notes"
              multiline
            />
          </FormControl>
        </Grid>
      </Grid>
      <Box display={'flex'} justifyContent={'flex-end'} mt={2}>
        <FormControl sx={{ width: 200, mr: 2 }}>
          <FormLabel>Assembly (optional)</FormLabel>
          <Controller
            name="assemblyId"
            control={control}
            defaultValue={control._defaultValues.assemblyId}
            render={({ field }) => (
              <TextField
                {...field}
                select
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
