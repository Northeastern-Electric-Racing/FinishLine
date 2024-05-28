/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from './ReviewChangeRequest';
import { ChangeRequest, ProposedSolution, StandardChangeRequest } from 'shared';
import { useState } from 'react';
import ProposedSolutionSelectItem from './ProposedSolutionSelectItem';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
  Typography,
  Breakpoint,
  IconButton
} from '@mui/material';
import { useToast } from '../../hooks/toasts.hooks';
import NERSuccessButton from '../../components/NERSuccessButton';
import NERFailButton from '../../components/NERFailButton';
import CloseIcon from '@mui/icons-material/Close';
import { useGetBlockingWorkPackages } from '../../hooks/work-packages.hooks';
import ChangeRequestBlockerWarning from '../../components/ChangeRequestBlockerWarning';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { hasProposedChanges } from '../../utils/change-request.utils';

interface ReviewChangeRequestViewProps {
  cr: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  reviewNotes: yup.string(),
  accepted: yup.boolean().required()
});

const ReviewChangeRequestsView: React.FC<ReviewChangeRequestViewProps> = ({
  cr,
  modalShow,
  onHide,
  onSubmit
}: ReviewChangeRequestViewProps) => {
  const [selected, setSelected] = useState(-1);
  const [selectedTimelineImpact, setSelectedTimelineImpact] = useState(-1);
  const toast = useToast();
  const { isLoading, isError, error, data: blockingWorkPackages } = useGetBlockingWorkPackages(cr.wbsNum);
  const [showWarning, setShowWarning] = useState(false);
  const { register, setValue, getFieldState, reset, handleSubmit, control, getValues } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} />;

  /**
   * Register (or set registered field) to the appropriate boolean based on which action button was clicked
   * @param value true if review accepted, false if denied
   */
  const handleAcceptDeny = (value: boolean) => {
    getFieldState('accepted') ? setValue('accepted', value) : register('accepted', { value });
    if (selected !== -1) {
      setValue('psId', (cr as StandardChangeRequest).proposedSolutions[selected].id);
    }
  };

  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: FormInput) => {
    await onSubmit(data);
    reset({ reviewNotes: '' });
  };

  const handleShowWarning = (data: FormInput) => {
    if (selected === -1) {
      onSubmitWrapper(data);
      return;
    }
    const standardChangeRequest = cr as StandardChangeRequest;
    const selectedProposedSolution = standardChangeRequest.proposedSolutions.find((ps) => ps.id === data.psId)!;
    if (
      data.accepted &&
      selectedProposedSolution.timelineImpact > 0 &&
      blockingWorkPackages &&
      blockingWorkPackages.length > 0
    ) {
      setSelectedTimelineImpact(selectedProposedSolution.timelineImpact);
      setShowWarning(true);
    } else {
      onSubmitWrapper(data);
    }
  };

  const overflowStyle: object = {
    overflowY: 'scroll',
    maxHeight: '300px'
  };

  const proposedSolutionStyle = {
    cursor: 'pointer',
    width: 'auto',
    margin: 'auto',
    display: 'block'
  };

  const dialogWidth: Breakpoint = 'md';
  const dialogContentWidthRatio: number = 1; // dialog contents fit 100% width

  const renderProposedSolutionModal: (scr: StandardChangeRequest) => JSX.Element = (
    standardChangeRequest: StandardChangeRequest
  ) => {
    return (
      <Dialog fullWidth maxWidth={dialogWidth} open={modalShow} onClose={onHide} style={{ color: 'black' }}>
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
          <CloseIcon />
        </IconButton>
        <DialogTitle className={'font-weight-bold'}>{`Review Change Request #${cr.identifier}`}</DialogTitle>
        <DialogContent
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          {!hasProposedChanges(standardChangeRequest) && (
            <Typography sx={{ paddingBottom: 1 }}>{'Select Proposed Solution'}</Typography>
          )}
          <Box
            sx={{
              width: dialogContentWidthRatio,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              ...overflowStyle
            }}
          >
            {standardChangeRequest.proposedSolutions.map((solution: ProposedSolution, i: number) => {
              return (
                <div style={proposedSolutionStyle}>
                  <ProposedSolutionSelectItem
                    proposedSolution={solution}
                    selected={selected === i}
                    onClick={() => (selected === i ? setSelected(-1) : setSelected(i))}
                  />
                </div>
              );
            })}
          </Box>
          <form id={'review-notes-form'} onSubmit={handleSubmit(handleShowWarning)}>
            <Controller
              name="reviewNotes"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography
                    sx={{
                      paddingTop: 1,
                      paddingBottom: 1
                    }}
                  >
                    {'Additional Comments'}
                  </Typography>
                  <TextField
                    multiline
                    rows={4}
                    required
                    variant="outlined"
                    id="reviewNotes-input"
                    autoComplete="off"
                    onChange={onChange}
                    value={value}
                    fullWidth
                    sx={{ width: dialogContentWidthRatio }}
                  />
                </>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <NERFailButton
            variant="contained"
            type="submit"
            form="review-notes-form"
            sx={{ mx: 1 }}
            onClick={() => handleAcceptDeny(false)}
          >
            Deny
          </NERFailButton>
          <NERSuccessButton
            variant="contained"
            type="submit"
            form="review-notes-form"
            sx={{ mx: 1 }}
            onClick={() => {
              selected > -1 || hasProposedChanges(standardChangeRequest)
                ? handleAcceptDeny(true)
                : toast.error('Please select a proposed solution!', 4500);
            }}
          >
            Accept
          </NERSuccessButton>
        </DialogActions>
      </Dialog>
    );
  };

  const renderModal: () => JSX.Element = () => {
    return (
      <Dialog fullWidth maxWidth={dialogWidth} open={modalShow} onClose={onHide}>
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
          <CloseIcon />
        </IconButton>
        <DialogTitle className={'font-weight-bold'}>{`Review Change Request #${cr.identifier}`}</DialogTitle>
        <DialogContent>
          <form id={'review-notes-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
            <Controller
              name="reviewNotes"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Typography>{'Additional Comments'}</Typography>
                  <TextField
                    multiline
                    rows={4}
                    required
                    id="reviewNotes-input"
                    autoComplete="off"
                    onChange={onChange}
                    value={value}
                    fullWidth
                  />
                </>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <NERFailButton
            type="submit"
            form="review-notes-form"
            variant="contained"
            sx={{ mx: 1 }}
            onClick={() => handleAcceptDeny(false)}
          >
            Deny
          </NERFailButton>
          <NERSuccessButton
            variant="contained"
            type="submit"
            form="review-notes-form"
            sx={{ mx: 1 }}
            onClick={() => handleAcceptDeny(true)}
          >
            Accept
          </NERSuccessButton>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      {cr.type === 'ISSUE' || cr.type === 'DEFINITION_CHANGE' || cr.type === 'OTHER'
        ? renderProposedSolutionModal(cr as StandardChangeRequest)
        : renderModal()}
      {
        <ChangeRequestBlockerWarning
          duration={selectedTimelineImpact}
          onHide={() => setShowWarning(false)}
          open={showWarning}
          onSubmit={() => onSubmitWrapper(getValues())}
          blockingWorkPackages={blockingWorkPackages ?? []}
        />
      }
    </>
  );
};

export default ReviewChangeRequestsView;
