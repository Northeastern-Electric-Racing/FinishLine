/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { expenseTypePipe } from '../../../utils/pipes';
import { Edit } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Grid, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ReimbursementRequest } from 'shared';
import ActionsMenu, { ButtonInfo } from '../../../components/ActionsMenu';
import NERModal from '../../../components/NERModal';
import PageLayout from '../../../components/PageLayout';
import VerticalDetailDisplay from '../../../components/VerticalDetailDisplay';
import {
  useDeleteReimbursementRequest,
  useDenyReimbursementRequest,
  useMarkReimbursementRequestAsDelivered
} from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import {
  centsToDollar,
  codeAndRefundSourceName,
  datePipe,
  dateUndefinedPipe,
  fullNamePipe,
  undefinedPipe
} from '../../../utils/pipes';
import {
  imagePreviewUrl,
  isReimbursementRequestAdvisorApproved,
  isReimbursementRequestReimbursed,
  isReimbursementRequestSaboSubmitted,
  isReimbursementRequestDenied
} from '../../../utils/reimbursement-request.utils';
import { routes } from '../../../utils/routes';
import AddSABONumberModal from './AddSABONumberModal';
import ReimbursementProductsView from './ReimbursementProductsView';
import SubmitToSaboModal from './SubmitToSaboModal';

interface ReimbursementRequestDetailsViewProps {
  reimbursementRequest: ReimbursementRequest;
}

const ReimbursementRequestDetailsView: React.FC<ReimbursementRequestDetailsViewProps> = ({ reimbursementRequest }) => {
  const theme = useTheme();
  const totalCostBackgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];
  const user = useCurrentUser();
  const history = useHistory();
  const [addSaboNumberModalShow, setAddSaboNumberModalShow] = useState<boolean>(false);
  const toast = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showMarkDelivered, setShowMarkDelivered] = useState(false);
  const [showSubmitToSaboModal, setShowSubmitToSaboModal] = useState(false);
  const { mutateAsync: deleteReimbursementRequest } = useDeleteReimbursementRequest(
    reimbursementRequest.reimbursementRequestId
  );
  const { mutateAsync: denyReimbursementRequest } = useDenyReimbursementRequest(reimbursementRequest.reimbursementRequestId);
  const { mutateAsync: markDelivered } = useMarkReimbursementRequestAsDelivered(reimbursementRequest.reimbursementRequestId);

  const handleDelete = () => {
    try {
      deleteReimbursementRequest();
      history.push(routes.FINANCE);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const handleDeny = () => {
    try {
      denyReimbursementRequest();
      setShowDenyModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const handleMarkDelivered = () => {
    try {
      markDelivered();
      setShowMarkDelivered(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDelete}
      >
        <Typography>Are you sure you want to delete this reimbursement request?</Typography>
      </NERModal>
    );
  };

  const DenyModal = () => {
    return (
      <NERModal
        open={showDenyModal}
        onHide={() => setShowDenyModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDeny}
      >
        <Typography>Are you sure you want to deny this reimbursement request?</Typography>
      </NERModal>
    );
  };

  const MarkDeliveredModal = () => (
    <NERModal
      open={showMarkDelivered}
      onHide={() => setShowMarkDelivered(false)}
      title="Warning!"
      cancelText="No"
      submitText="Yes"
      onSubmit={handleMarkDelivered}
    >
      <Typography>Are you sure the items in this reimbursement request have all been delivered?</Typography>
    </NERModal>
  );

  const BasicInformationView = () => {
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '5px' }}>
          <Typography variant="h5">Details</Typography>
          <Typography variant="h5" fontSize={24}>{`${datePipe(new Date(reimbursementRequest.dateOfExpense))}`}</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Purchased From" content={reimbursementRequest.vendor.name} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Sabo Number" content={`${undefinedPipe(reimbursementRequest.saboId)}`} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Refund Source" content={codeAndRefundSourceName(reimbursementRequest.account)} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Expense Type" content={expenseTypePipe(reimbursementRequest.expenseType)} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay
              label="Date Item Delivered"
              content={dateUndefinedPipe(reimbursementRequest.dateDelivered)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            container
            mt={2}
            ml={2}
            sx={{ backgroundColor: totalCostBackgroundColor, borderRadius: '10px', boxShadow: 1 }}
          >
            <Grid item xs={6} textAlign={'center'} mt={-2}>
              <Typography fontSize={50}>Total Cost</Typography>
            </Grid>
            <Grid xs={6} mt={-2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography fontSize={50}>{`$${centsToDollar(reimbursementRequest.totalCost)}`}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  };

  const GridDivider = () => {
    return (
      <Box
        sx={{
          height: '100%',
          borderColor: theme.palette.divider,
          borderWidth: '2px',
          borderStyle: 'solid',
          width: '0px',
          textAlign: 'center'
        }}
      />
    );
  };

  const ReceiptsView = () => {
    return (
      <Box sx={{ maxHeight: `250px`, overflow: reimbursementRequest.receiptPictures.length > 0 ? 'auto' : 'none' }}>
        <Typography variant="h5">Receipts</Typography>
        {reimbursementRequest.receiptPictures.map((receipt) => {
          return (
            <iframe
              style={{ height: `200px`, width: '50%' }}
              src={imagePreviewUrl(receipt.googleFileId)}
              title={receipt.name}
            />
          );
        })}
      </Box>
    );
  };

  const allowEdit =
    user.userId === reimbursementRequest.recipient.userId && !isReimbursementRequestAdvisorApproved(reimbursementRequest);

  const buttons: ButtonInfo[] = [
    {
      title: 'Edit',
      onClick: () => history.push(`${routes.REIMBURSEMENT_REQUESTS}/${reimbursementRequest.reimbursementRequestId}/edit`),
      icon: <Edit />,
      disabled: !allowEdit && !user.isFinance
    },
    {
      title: 'Delete',
      onClick: () => setShowDeleteModal(true),
      icon: <DeleteIcon />,
      disabled: !allowEdit
    },
    {
      title: 'Mark Delivered',
      onClick: () => setShowMarkDelivered(true),
      icon: <LocalShippingIcon />,
      disabled: !!reimbursementRequest.dateDelivered
    },
    {
      title: 'Add Sabo #',
      onClick: () => setAddSaboNumberModalShow(true),
      icon: <ConfirmationNumberIcon />,
      disabled: !user.isFinance
    },
    {
      title: 'Approve',
      onClick: () => setShowSubmitToSaboModal(true),
      icon: <CheckIcon />,
      disabled:
        !user.isFinance ||
        isReimbursementRequestSaboSubmitted(reimbursementRequest) ||
        isReimbursementRequestDenied(reimbursementRequest)
    },
    {
      title: 'Deny',
      onClick: () => setShowDenyModal(true),
      icon: <CloseIcon />,
      disabled:
        !user.isFinance ||
        isReimbursementRequestReimbursed(reimbursementRequest) ||
        isReimbursementRequestDenied(reimbursementRequest)
    }
  ];

  return (
    <PageLayout
      title={`${
        isReimbursementRequestDenied(reimbursementRequest)
          ? `${fullNamePipe(reimbursementRequest.recipient)}'s Reimbursement Request - Denied`
          : `${fullNamePipe(reimbursementRequest.recipient)}'s Reimbursement Request`
      }`}
      previousPages={[
        {
          name: 'Finance',
          route: routes.FINANCE
        }
      ]}
      headerRight={<ActionsMenu buttons={buttons} />}
    >
      <DeleteModal />
      <DenyModal />
      <MarkDeliveredModal />
      <SubmitToSaboModal
        open={showSubmitToSaboModal}
        setOpen={setShowSubmitToSaboModal}
        reimbursementRequest={reimbursementRequest}
      />
      <AddSABONumberModal
        modalShow={addSaboNumberModalShow}
        onHide={() => setAddSaboNumberModalShow(false)}
        reimbursementRequestId={reimbursementRequest.reimbursementRequestId}
      />
      <Grid container spacing={2} mt={2}>
        <Grid item lg={6} xs={12}>
          <BasicInformationView />
        </Grid>
        <Grid item lg={1} xs={0} justifyContent={'center'} display={'flex'}>
          <GridDivider />
        </Grid>
        <Grid item lg={5} xs={12} rowSpacing={5} container>
          <Grid item xs={12}>
            <ReceiptsView />
          </Grid>
          <Grid item xs={12}>
            <ReimbursementProductsView reimbursementRequest={reimbursementRequest} />
          </Grid>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default ReimbursementRequestDetailsView;
