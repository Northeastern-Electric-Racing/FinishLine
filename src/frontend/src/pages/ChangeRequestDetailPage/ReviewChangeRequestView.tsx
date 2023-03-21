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
  const toast = useToast();

  const { register, setValue, getFieldState, reset, handleSubmit, control } = useForm<FormInput>({
    resolver: yupResolver(schema)
  });

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

  const renderProposedSolutionModal: (scr: StandardChangeRequest) => JSX.Element = (scr: StandardChangeRequest) => {
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
        <DialogTitle className={'font-weight-bold'}>{`Review Change Request #${cr.crId}`}</DialogTitle>
        <DialogContent
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          <Typography sx={{ paddingBottom: 1 }}>{'Select Proposed Solution'}</Typography>
          <Box
            sx={{
              width: dialogContentWidthRatio,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              ...overflowStyle
            }}
          >
            {scr.proposedSolutions.map((solution: ProposedSolution, i: number) => {
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
          <form id={'review-notes-form'} onSubmit={handleSubmit(onSubmitWrapper)}>
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
              selected > -1 ? handleAcceptDeny(true) : toast.error('Please select a proposed solution!', 4500);
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
        <DialogTitle className={'font-weight-bold'}>{`Review Change Request #${cr.crId}`}</DialogTitle>
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

  return cr.type === 'ISSUE' || cr.type === 'DEFINITION_CHANGE' || cr.type === 'OTHER'
    ? renderProposedSolutionModal(cr as StandardChangeRequest)
    : renderModal();
};

export default ReviewChangeRequestsView;
