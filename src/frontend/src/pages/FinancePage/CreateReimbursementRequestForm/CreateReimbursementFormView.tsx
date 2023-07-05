import { AttachMoney, Delete, Money } from '@mui/icons-material';
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import { Control, Controller, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { ClubAccount, ExpenseType, ReimbursementProductCreateArgs, Vendor, WbsNumber, wbsPipe } from 'shared';
import { DatePicker } from '@mui/x-date-pickers';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ReimbursementProductTable from './ReimbursementProductTable';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { routes } from '../../../utils/routes';
import { CreateReimbursementRequestFormInput } from './CreateReimbursementRequestForm';

interface CreateReimbursementRequestFormViewProps {
  allVendors: Vendor[];
  allExpenseTypes: ExpenseType[];
  receiptFiles: {
    file: File;
  }[];
  allWbsElements: {
    wbsNum: WbsNumber;
    wbsName: string;
  }[];
  control: Control<
    {
      vendorId: string;
      account: ClubAccount;
      dateOfExpense: Date;
      expenseTypeId: string;
      reimbursementProducts: ReimbursementProductCreateArgs[];
      receiptFiles: { file: File }[];
      totalCost: number;
    },
    any
  >;
  reimbursementProducts: ReimbursementProductCreateArgs[];
  receiptAppend: (args: { file: File }) => void;
  receiptRemove: (index: number) => void;
  reimbursementProductAppend: (args: ReimbursementProductCreateArgs) => void;
  reimbursementProductRemove: (index: number) => void;
  onSubmit: (data: CreateReimbursementRequestFormInput) => void;
  handleSubmit: UseFormHandleSubmit<{
    vendorId: string;
    account: ClubAccount;
    dateOfExpense: Date;
    expenseTypeId: string;
    reimbursementProducts: ReimbursementProductCreateArgs[];
    receiptFiles: { file: File }[];
    totalCost: number;
  }>;
  errors: FieldErrors<{
    vendorId: string;
    account: ClubAccount;
    dateOfExpense: Date;
    expenseTypeId: string;
    reimbursementProducts: ReimbursementProductCreateArgs[];
    receiptFiles: { file: File }[];
    totalCost: number;
  }>;
}
const CreateReimbursementRequestFormView: React.FC<CreateReimbursementRequestFormViewProps> = ({
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
  errors
}) => {
  const wbsElementAutocompleteOptions = allWbsElements.map((wbsElement) => ({
    label: wbsPipe(wbsElement.wbsNum) + ' - ' + wbsElement.wbsName,
    id: wbsPipe(wbsElement.wbsNum)
  }));

  const ReceiptFileInput = () => (
    <>
      <FormLabel>Receipts</FormLabel>
      <ul>
        {receiptFiles.map((receiptFile, index) => (
          <li>
            <Stack key={receiptFile.file.name} direction="row" justifyContent="space-between">
              <Typography>{receiptFile.file.name}</Typography>
              <IconButton onClick={() => receiptRemove(index)}>
                <Delete />
              </IconButton>
            </Stack>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <form
      onSubmit={(e) => {
        console.log('test');
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
    >
      <PageTitle title="Create Reimbursement Request" previousPages={[]} />
      <Grid container spacing={2}>
        <Grid item container spacing={2} md={6} xs={12}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>Purchased From</FormLabel>
              <Controller
                name="vendorId"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select onChange={(newValue) => onChange(newValue)} value={value} error={!!errors.vendorId}>
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
                  <Select onChange={(newValue) => onChange(newValue)} value={value} error={!!errors.account}>
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
                      onChange(newValue);
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
                    <Select onChange={(newValue) => onChange(newValue)} value={value} error={!!errors.expenseTypeId}>
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
              <FormControl fullWidth>
                <FormLabel>Total Cost</FormLabel>
                <ReactHookTextField
                  type="number"
                  name="totalCost"
                  control={control}
                  errorMessage={errors.totalCost}
                  icon={<AttachMoney />}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <ReceiptFileInput />
              <input
                onChange={(e) => {
                  if (e.target.files) {
                    receiptAppend({
                      file: e.target.files[0]
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
        <NERFailButton variant="contained" href={routes.FINANCE} sx={{ mx: 1 }}>
          Cancel
        </NERFailButton>
        <NERSuccessButton variant="contained" type="submit">
          Submit
        </NERSuccessButton>
      </Box>
    </form>
  );
};

export default CreateReimbursementRequestFormView;
