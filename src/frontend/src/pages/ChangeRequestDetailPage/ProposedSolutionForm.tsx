/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NERSuccessButton from '../../components/NERSuccessButton';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProposedSolution } from 'shared';
import { TextField, Typography, IconButton } from '@mui/material';
import { uuidv4 } from '../../utils/form';

interface ProposedSolutionFormProps {
  description?: string;
  budgetImpact?: number;
  timelineImpact?: number;
  scopeImpact?: string;
  id?: string;
  readOnly?: boolean;
  onSubmit: (data: ProposedSolution) => void;
  open: boolean;
  onClose: () => void;
  isEditing?: boolean;
}

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  budgetImpact: yup
    .number()
    .typeError('Budget Impact must be a number')
    .required('Budget Impact is required')
    .integer('Budget Impact must be an integer'),
  scopeImpact: yup.string().required('Scope Impact is required'),
  timelineImpact: yup
    .number()
    .typeError('Timeline Impact must be a number')
    .required('Timeline Impact is required')
    .integer('Timeline Impact must be an integer')
});

const ProposedSolutionForm: React.FC<ProposedSolutionFormProps> = ({
  description,
  budgetImpact,
  timelineImpact,
  scopeImpact,
  id,
  readOnly,
  onSubmit,
  open,
  onClose,
  isEditing: editing
}) => {
  const { formState, handleSubmit, control } = useForm<ProposedSolution>({
    resolver: yupResolver(schema),
    defaultValues: {
      description,
      budgetImpact,
      timelineImpact,
      scopeImpact,
      id: id ? id : uuidv4()
    }
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editing ? 'Edit Proposed Solution' : 'Propose a Solution'}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        <form
          id={'individual-proposed-solution-form'}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }}
        >
          <Controller
            name="description"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <>
                <Typography sx={{ paddingTop: 2, paddingBottom: 2 }}>{'Description'}</Typography>
                <TextField
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                  id="description-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  fullWidth
                  sx={{ width: 400 }}
                  disabled={readOnly}
                  placeholder="Describe the proposed solution..."
                  error={!!formState.errors.description}
                  helperText={formState.errors.description?.message}
                />
              </>
            )}
          />
          <Controller
            name="scopeImpact"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <>
                <Typography sx={{ paddingTop: 2, paddingBottom: 2 }}>{'Scope Impact'}</Typography>
                <TextField
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                  id="scopeImpact-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  fullWidth
                  sx={{ width: 400 }}
                  disabled={readOnly}
                  placeholder="What changes to the scope does this entail?"
                  error={!!formState.errors.scopeImpact}
                  helperText={formState.errors.scopeImpact?.message}
                />
              </>
            )}
          />
          <Controller
            name="budgetImpact"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <>
                <Typography sx={{ paddingTop: 2, paddingBottom: 2 }}>{'Budget Impact'}</Typography>
                <TextField
                  multiline
                  rows={1}
                  required
                  variant="outlined"
                  id="budgetImpact-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  fullWidth
                  sx={{ width: 400 }}
                  disabled={readOnly}
                  placeholder="$ needed"
                  error={!!formState.errors.budgetImpact}
                  helperText={formState.errors.budgetImpact?.message}
                />
              </>
            )}
          />
          <Controller
            name="timelineImpact"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <>
                <Typography sx={{ paddingTop: 2, paddingBottom: 2 }}>{'Timeline Impact'}</Typography>
                <TextField
                  multiline
                  rows={1}
                  required
                  variant="outlined"
                  id="timelineImpact-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  fullWidth
                  sx={{ width: 400 }}
                  disabled={readOnly}
                  placeholder="# of weeks needed"
                  error={!!formState.errors.timelineImpact}
                  helperText={formState.errors.timelineImpact?.message}
                />
              </>
            )}
          />
          {readOnly ? (
            ''
          ) : (
            <Box display="flex" flexDirection="row-reverse">
              <NERSuccessButton
                color="success"
                variant="contained"
                type="submit"
                form="individual-proposed-solution-form"
                sx={{ textTransform: 'none', fontSize: 16, marginTop: 3 }}
              >
                {editing ? 'Save' : 'Add'}
              </NERSuccessButton>
            </Box>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProposedSolutionForm;
