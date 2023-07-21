import { Delete } from '@mui/icons-material';
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import {
  ClubAccount,
  ExpenseType,
  ReimbursementProductCreateArgs,
  ReimbursementReceiptUploadArgs,
  Vendor,
  WbsNumber,
  wbsPipe
} from 'shared';
import { DatePicker } from '@mui/x-date-pickers';
import ReimbursementProductTable from './ReimbursementProductTable';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';

interface ReimbursementRequestFormViewProps {
  allVendors: Vendor[];
  allExpenseTypes: ExpenseType[];
  receiptFiles: ReimbursementReceiptUploadArgs[];
  allWbsElements: {
    wbsNum: WbsNumber;
    wbsName: string;
  }[];
  control: Control<ReimbursementRequestFormInput, any>;
  reimbursementProducts: ReimbursementProductCreateArgs[];
  receiptAppend: (args: ReimbursementReceiptUploadArgs) => void;
  receiptRemove: (index: number) => void;
  reimbursementProductAppend: (args: ReimbursementProductCreateArgs) => void;
  reimbursementProductRemove: (index: number) => void;
  onSubmit: (data: ReimbursementRequestFormInput) => void;
  handleSubmit: UseFormHandleSubmit<ReimbursementRequestFormInput>;
  errors: FieldErrors<ReimbursementRequestFormInput>;
  totalCost: number;
  submitText: string;
  previousPage: string;
}

const ReimbursementRequestFormView: React.FC<ReimbursementRequestFormViewProps> = ({
  allVendors,
  allExpenseTypes,
  allWbsElements,
  receiptFiles,
  reimbursementProducts,
  control,
  receiptAppend,
  receiptRemove,
  reimbursementProductAppend,
  reimbursementProductRemove,
  onSubmit,
  handleSubmit,
  errors,
  totalCost,
  submitText,
  previousPage
}) => {
  const wbsElementAutocompleteOptions = allWbsElements.map((wbsElement) => ({
    label: wbsPipe(wbsElement.wbsNum) + ' - ' + wbsElement.wbsName,
    id: wbsPipe(wbsElement.wbsNum)
  }));

  const ReceiptFileInput = () => (
    <FormControl>
      <FormLabel>Receipts</FormLabel>
      <ul>
        {receiptFiles.map((receiptFile, index) => (
          <li key={`${receiptFile.file.name}-${index}`}>
            <Stack key={receiptFile.file.name} direction="row" justifyContent="space-between">
              <Typography>{receiptFile.name}</Typography>
              <IconButton onClick={() => receiptRemove(index)}>
                <Delete />
              </IconButton>
            </Stack>
          </li>
        ))}
      </ul>
    </FormControl>
  );

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
    >
      <Grid container spacing={2}>
        <Grid item container spacing={2} md={6} xs={12}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>Purchased From</FormLabel>
              <Controller
                name="vendorId"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select onChange={(newValue) => onChange(newValue.target.value)} value={value} error={!!errors.vendorId}>
                    {allVendors.map((vendor) => (
                      <MenuItem key={vendor.vendorId} value={vendor.vendorId}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormHelperText>{errors.vendorId?.message}</FormHelperText>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <FormLabel>Refund Source</FormLabel>
              <Controller
                name="account"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    onChange={(newValue) => onChange(newValue.target.value as ClubAccount)}
                    value={value}
                    error={!!errors.account}
                  >
                    {Object.values(ClubAccount).map((account) => (
                      <MenuItem key={account} value={account}>
                        {account}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormHelperText>{errors.account?.message}</FormHelperText>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <FormLabel>Date of Expense</FormLabel>
              <Controller
                name="dateOfExpense"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    onChange={(newValue) => {
                      onChange(newValue ?? new Date());
                    }}
                    renderInput={(params) => (
                      <TextField {...params} error={!!errors.dateOfExpense} helperText={errors.dateOfExpense?.message} />
                    )}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item container xs={6} spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Expense Type</FormLabel>
                <Controller
                  name="expenseTypeId"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      onChange={(newValue) => onChange(newValue.target.value)}
                      value={value}
                      error={!!errors.expenseTypeId}
                    >
                      {allExpenseTypes.map((expenseType) => (
                        <MenuItem key={expenseType.expenseTypeId} value={expenseType.expenseTypeId}>
                          {expenseType.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <FormHelperText>{errors.expenseTypeId?.message}</FormHelperText>
            </Grid>
            <Grid item xs={12}>
              <FormLabel>Total Cost</FormLabel>
              <Typography variant="h6">${totalCost}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <ReceiptFileInput />
              <input
                onChange={(e) => {
                  if (e.target.files) {
                    receiptAppend({
                      file: e.target.files[0],
                      name: e.target.files[0].name,
                      googleFileId: ''
                    });
                  }
                }}
                type="file"
                accept="image/*"
                name="receiptFiles"
              />
            </FormControl>
            <FormHelperText>{errors.receiptFiles?.message}</FormHelperText>
          </Grid>
        </Grid>
        <Grid item md={6} xs={12}>
          <ReimbursementProductTable
            errors={errors}
            reimbursementProducts={reimbursementProducts}
            appendProduct={reimbursementProductAppend}
            removeProduct={reimbursementProductRemove}
            wbsElementAutocompleteOptions={wbsElementAutocompleteOptions}
            control={control}
          />
          <FormHelperText>{errors.reimbursementProducts?.message}</FormHelperText>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <NERFailButton variant="contained" href={previousPage} sx={{ mx: 1 }}>
          Cancel
        </NERFailButton>
        <NERSuccessButton variant="contained" type="submit">
          {submitText}
        </NERSuccessButton>
      </Box>
    </form>
  );
};

export default ReimbursementRequestFormView;
