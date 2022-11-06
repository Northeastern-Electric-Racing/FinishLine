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
import { Dialog, DialogActions, DialogContent, DialogTitle, Link, makeStyles, TextField, Typography } from '@mui/material';
import { NERButton } from '../../components/NERButton';

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

  const overflow: object = {
    'overflow-y': 'scroll',
    'max-height': '300px'
  };

  const proposedSolutionStyle = {
    cursor: 'pointer',
    width: 'auto',
    margin: 'auto',
    display: 'block'
  };

  const renderProposedSolutionModal: (scr: StandardChangeRequest) => JSX.Element = (scr: StandardChangeRequest) => {
    return (
      <Dialog open={modalShow} onClose={onHide} style={{ color: 'black' }}>
        <DialogTitle className={'font-weight-bold'}>{`Review Change Request #${cr.crId}`}</DialogTitle>
        <DialogContent>
          <div style={overflow}>
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
          </div>
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
                    defaultValue={value}
                    fullWidth
                    sx={{ width: 500 }}
                  />
                </>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <NERButton
            color="success"
            variant="contained"
            type="submit"
            form="review-notes-form"
            onClick={() => {
              selected > -1 ? handleAcceptDeny(true) : alert('Please select a proposed solution!');
            }}
          >
            Accept
          </NERButton>
          <NERButton
            className={'ml-3'}
            variant="contained"
            type="submit"
            form="review-notes-form"
            onClick={() => handleAcceptDeny(false)}
          >
            Deny
          </NERButton>
        </DialogActions>
      </Dialog>
    );
  };

  const renderModal: () => JSX.Element = () => {
    return (
      <Dialog open={modalShow} onClose={onHide}>
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
                    defaultValue={value}
                    fullWidth
                    sx={{ width: 500 }}
                  />
                </>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <NERButton
            variant="contained"
            color="success"
            type="submit"
            form="review-notes-form"
            onClick={() => handleAcceptDeny(true)}
          >
            Accept
          </NERButton>
          <NERButton
            type="submit"
            form="review-notes-form"
            variant="contained"
            color="error"
            onClick={() => handleAcceptDeny(false)}
          >
            Deny
          </NERButton>
        </DialogActions>
      </Dialog>
    );
  };

  return cr.type === 'ISSUE' || cr.type === 'DEFINITION_CHANGE' || cr.type === 'OTHER'
    ? renderProposedSolutionModal(cr as StandardChangeRequest)
    : renderModal();
};

export default ReviewChangeRequestsView;
