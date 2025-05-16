import {
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Box } from '@mui/system';
import { Control, Controller, FieldErrors, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Assembly, Manufacturer, MaterialType, ReimbursementRequest, Unit } from 'shared';
import ReactHookTextField from '../../../../../components/ReactHookTextField';
import { MaterialFormInput } from './MaterialForm';
import NERFormModal from '../../../../../components/NERFormModal';
import DetailDisplay from '../../../../../components/DetailDisplay';
import NERAutocomplete from '../../../../../components/NERAutocomplete';
import HelpIcon from '@mui/icons-material/Help';
import { displayEnum } from '../../../../../utils/pipes';
import { MaterialStatus } from 'shared';
import React from 'react';
import { AddCircle } from '@mui/icons-material';

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
  reimbursementRequests: ReimbursementRequest[];
  open: boolean;
  watch: UseFormWatch<MaterialFormInput>;
  createManufacturer: (name: string) => void;
  setValue: UseFormSetValue<MaterialFormInput>;
}

const manufacturersToAutocomplete = (manufacturer: Manufacturer): { label: string; id: string } => {
  return { label: manufacturer.name, id: manufacturer.name };
};

const materialTypeToAutocomplete = (type: MaterialType): { label: string; id: string } => {
  return { label: type.name, id: type.name };
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
  allManufacturers,
  assemblies,
  reimbursementRequests,
  open,
  watch,
  createManufacturer,
  setValue
}) => {
  const quantity = watch('quantity');
  const price = watch('price');
  const subtotal = quantity && price ? quantity * price : 0;

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
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <FormControl fullWidth>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '1.75rem',
                color: '#EF4345'
              }}
              variant="h5"
            >
              Name:*
            </Typography>
            <ReactHookTextField
              name="name"
              control={control}
              errorMessage={errors.name}
              placeholder="Enter Name for Material"
            />
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '1.75rem',
                color: '#EF4345'
              }}
              variant="h5"
            >
              Reimbursement #:
            </Typography>
            <Controller
              name="reimbursementRequestId"
              control={control}
              defaultValue={control._defaultValues.reimbursementRequestId}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  variant="outlined"
                  error={!!errors.reimbursementRequestId}
                  helperText={errors.reimbursementRequestId?.message}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) =>
                      selected ? (
                        reimbursementRequests.find((rr) => rr.reimbursementRequestId === selected)?.identifier
                      ) : (
                        <Typography sx={{ fontSize: '1rem', color: 'lightgray', opacity: 0.6 }}>
                          Select Corresponding RR
                        </Typography>
                      )
                  }}
                >
                  {reimbursementRequests.map((rr: ReimbursementRequest) => (
                    <MenuItem key={rr.reimbursementRequestId} value={rr.reimbursementRequestId}>
                      {rr.identifier}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '1.75rem',
                color: '#EF4345'
              }}
              variant="h5"
            >
              Status:*
            </Typography>
            <Controller
              name="status"
              control={control}
              defaultValue={control._defaultValues.status}
              render={({ field }) => (
                <TextField {...field} select variant="outlined" error={!!errors.status} helperText={errors.status?.message}>
                  {[
                    MaterialStatus.Ordered,
                    MaterialStatus.Received,
                    MaterialStatus.Shipped,
                    MaterialStatus.NotReadyToOrder,
                    MaterialStatus.ReadyToOrder
                  ].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status ? displayEnum(status) : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '1.75rem',
                color: '#EF4345'
              }}
              variant="h5"
            >
              Type:*
            </Typography>
            <Controller
              name="materialTypeName"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => {
                const mappedTypes = allMaterialTypes
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(materialTypeToAutocomplete);

                const onClear = () => {
                  setValue('materialTypeName', '');
                  onChange('');
                };

                return (
                  <Box sx={{ alignItems: 'center' }}>
                    <NERAutocomplete
                      sx={{ bgcolor: 'inherit' }}
                      id={'material-type'}
                      size="medium"
                      options={mappedTypes}
                      value={mappedTypes.find((type) => type.label === value) || null}
                      placeholder="Select Material Type"
                      onChange={(_event, newValue) => {
                        newValue ? onChange(newValue.id) : onClear();
                      }}
                      errorMessage={errors.materialTypeName}
                    />
                  </Box>
                );
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1.75rem',
                    color: '#EF4345'
                  }}
                  variant="h5"
                >
                  Manufacturer:*
                </Typography>
                <Tooltip
                  title={'Make sure not to enter the distributor (e.g. Amazon)'}
                  style={{ marginRight: '2px' }}
                  placement="right"
                >
                  <HelpIcon style={{ marginBottom: '-0.2em', fontSize: 'medium', marginLeft: '5px', color: 'lightgray' }} />
                </Tooltip>
              </Box>
            </FormLabel>
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
                      errorMessage={errors.manufacturerName}
                    />
                  </Box>
                );
              }}
            />
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#EF4345',
              mt: 1,
              ml: 0.5
            }}
          >
            <AddCircle
              sx={{ fontSize: 20, mr: 1, cursor: 'pointer' }}
              onClick={() => {
                const newManufacturerName = prompt('Enter New Manufacturer Name');
                if (newManufacturerName !== null) {
                  createManufacturer(newManufacturerName);
                }
              }}
            />
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}
            >
              Add Manufacturer
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '1.75rem',
                color: '#EF4345',
                mb: -2
              }}
              variant="h5"
            >
              Part Details:*
            </Typography>
            <Tooltip title={"Enter 'N/A' if no Manufacturer Part Number"} placement="right">
              <HelpIcon
                sx={{
                  fontSize: 'medium',
                  ml: 1,
                  color: 'lightgray',
                  cursor: 'pointer'
                }}
              />
            </Tooltip>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <ReactHookTextField
              name="manufacturerPartNumber"
              control={control}
              errorMessage={errors.manufacturerPartNumber}
              placeholder="Manufacturer Part Number"
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <ReactHookTextField
              required={false}
              name="pdmFileName"
              control={control}
              errorMessage={errors.pdmFileName}
              placeholder="PDM File Name"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <ReactHookTextField name="linkUrl" control={control} errorMessage={errors.linkUrl} placeholder="Link" />
          </FormControl>
        </Grid>
        <Grid xs={5.75}>
          <Box display={'flex'} alignItems={'center'} mt={2} ml={2}>
            <Box mr={2}>
              <FormControl fullWidth>
                <ReactHookTextField
                  name="quantity"
                  control={control}
                  errorMessage={errors.quantity}
                  placeholder="Quantity"
                  type="number"
                />
              </FormControl>
            </Box>
            <FormControl fullWidth>
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
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected) =>
                        selected ? (
                          allUnits.find((unit) => unit.name === selected)?.name
                        ) : (
                          <Typography sx={{ fontSize: '1rem', color: 'lightgray', opacity: 0.6 }}>Unit</Typography>
                        )
                    }}
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
        <Grid item xs={3.25}>
          <FormControl fullWidth>
            <Controller
              name={`price`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant={'outlined'}
                  type="number"
                  autoComplete="off"
                  placeholder="Price Per Unit"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  sx={{ width: '100%' }}
                  error={!!errors.price}
                />
              )}
            />
            <FormHelperText error>{errors.price}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={3} display="flex" alignItems="center" color="#EF4345">
          <DetailDisplay label="Subtotal" content={`$${subtotal.toFixed(2)}`} />
        </Grid>
        <Grid item xs={12}>
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: '1.75rem',
              color: '#EF4345',
              mb: -2
            }}
            variant="h5"
          >
            Additional Information:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
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
      <Grid item xs={12}>
        <Box display={'flex'} justifyContent={'flex-end'} mt={2}>
          <FormControl fullWidth>
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
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) =>
                      selected ? (
                        assemblies.find((a) => a.assemblyId === selected)?.assemblyId
                      ) : (
                        <Typography sx={{ fontSize: '1rem', color: 'lightgray', opacity: 0.6 }}>
                          Enter Assembly Details
                        </Typography>
                      )
                  }}
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
      </Grid>
    </NERFormModal>
  );
};

export default MaterialFormView;
