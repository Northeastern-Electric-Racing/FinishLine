/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, FormControl, FormLabel, Grid, ListItemIcon, Menu, MenuItem, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Refunds from './RefundsSection';
import ReimbursementRequestTable from './ReimbursementRequestsSection';
import {
  useAllReimbursementRequests,
  useCurrentUserReimbursementRequests,
  useDownloadPDFOfImages
} from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageLayout from '../../components/PageLayout';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import NERFormModal from '../../components/NERFormModal';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers';
import { ReimbursementRequest } from 'shared';
import { useToast } from '../../hooks/toasts.hooks';

interface GenerateReceiptsFormInput {
  startDate: Date;
  endDate: Date;
}

const FinancePage = () => {
  const user = useCurrentUser();
  const history = useHistory();
  const toast = useToast();
  const [showGenerateReceipts, setShowGenerateReceipts] = useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const { mutateAsync, isLoading } = useDownloadPDFOfImages();

  const {
    data: userReimbursementRequests,
    isLoading: userReimbursementRequestIsLoading,
    isError: userReimbursementRequestIsError,
    error: userReimbursementRequestError
  } = useCurrentUserReimbursementRequests();
  const {
    data: allReimbursementRequests,
    isLoading: allReimbursementRequestsIsLoading,
    isError: allReimbursementRequestsIsError,
    error: allReimbursementRequestsError
  } = useAllReimbursementRequests();

  const isFinance = user.isFinance;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const schema = yup.object().shape({
    startDate: yup.date().required('Start Date is required'),
    endDate: yup.date().required('End Date is required')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onGenerateReceiptsSubmit = async (data: GenerateReceiptsFormInput) => {
    if (!allReimbursementRequests) return;
    const filteredRequests = allReimbursementRequests
      ?.filter((val: ReimbursementRequest) => val.dateCreated >= data.startDate)
      .filter((val: ReimbursementRequest) => val.dateCreated <= data.endDate)
      .filter((val: ReimbursementRequest) => !val.dateDeleted);
    const receipts = filteredRequests?.flatMap((request: ReimbursementRequest) => request.receiptPictures);
    try {
      await mutateAsync({
        fileIds: receipts.map((receipt) => receipt.googleFileId)
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setShowGenerateReceipts(false);
  };

  if (isFinance && allReimbursementRequestsIsError) return <ErrorPage message={allReimbursementRequestsError?.message} />;
  if (userReimbursementRequestIsError) return <ErrorPage message={userReimbursementRequestError?.message} />;
  if (
    (isFinance && (allReimbursementRequestsIsLoading || !allReimbursementRequests)) ||
    userReimbursementRequestIsLoading ||
    !userReimbursementRequests
  )
    return <LoadingIndicator />;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const financeActionsDropdown = (
    <>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="project-actions-dropdown"
        onClick={handleClick}
      >
        Actions
      </NERButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem onClick={() => history.push(routes.NEW_REIMBURSEMENT_REQUEST)}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          Create Reimbursement Request
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <AttachMoneyIcon fontSize="small" />
          </ListItemIcon>
          Report Refund
        </MenuItem>
        <MenuItem onClick={() => {}} disabled={!isFinance}>
          <ListItemIcon>
            <ListAltIcon fontSize="small" />
          </ListItemIcon>
          Pending Advisor List
        </MenuItem>
        <MenuItem onClick={() => setShowGenerateReceipts(true)} disabled={!isFinance}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          Generate All Receipts
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <PageLayout title="Finance" headerRight={financeActionsDropdown}>
      <NERFormModal
        open={showGenerateReceipts}
        onHide={() => setShowGenerateReceipts(false)}
        title={`Generate All Receipts`}
        reset={reset}
        handleUseFormSubmit={handleSubmit}
        onFormSubmit={onGenerateReceiptsSubmit}
        formId="generate-receipts-form"
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <FormControl fullWidth>
              <FormLabel>Start Date</FormLabel>
              <Controller
                name="startDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    open={startDatePickerOpen}
                    onClose={() => setStartDatePickerOpen(false)}
                    onOpen={() => setStartDatePickerOpen(true)}
                    onChange={(newValue) => {
                      onChange(newValue ?? new Date());
                    }}
                    PopperProps={{
                      placement: 'right'
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, readOnly: true }}
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                        onClick={(e) => setStartDatePickerOpen(true)}
                      />
                    )}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>End Date</FormLabel>
              <Controller
                name="endDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    open={endDatePickerOpen}
                    onClose={() => setEndDatePickerOpen(false)}
                    onOpen={() => setEndDatePickerOpen(true)}
                    onChange={(newValue) => {
                      onChange(newValue ?? new Date());
                    }}
                    PopperProps={{
                      placement: 'right'
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, readOnly: true }}
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                        onClick={(e) => setEndDatePickerOpen(true)}
                      />
                    )}
                  />
                )}
              />
            </FormControl>
          </>
        )}
      </NERFormModal>
      <Grid container>
        <Grid item xs={12} sm={12} md={4}>
          <Refunds
            userReimbursementRequests={userReimbursementRequests}
            allReimbursementRequests={allReimbursementRequests}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box sx={{ marginTop: { xs: '10px', sm: '10px', md: '0' }, marginLeft: { xs: '0', sm: '0', md: '10px' } }}>
            <ReimbursementRequestTable
              userReimbursementRequests={userReimbursementRequests}
              allReimbursementRequests={allReimbursementRequests}
            />
          </Box>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default FinancePage;
