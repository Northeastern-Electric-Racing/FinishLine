/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import PageBlock from '../../layouts/PageBlock';
import { Box, Button } from '@mui/material';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProposedSolution } from 'shared';
import { TextField, Typography } from '@mui/material';

interface ProposedSolutionFormProps {
  description?: string;
  budgetImpact?: number;
  timelineImpact?: number;
  scopeImpact?: string;
  readOnly?: boolean;
  onAdd: (data: ProposedSolution) => void;
}

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  budgetImpact: yup
    .number()
    .typeError('Budget Impact must be a number')
    .min(0, 'Budget Impact must be greater than or equal to $0')
    .required('Budget Impact is required')
    .integer('Budget Impact must be an integer'),
  scopeImpact: yup.string().required('Scope Impact is required'),
  timelineImpact: yup
    .number()
    .typeError('Timeline Impact must be a number')
    .min(0, 'Timeline Impact must be greater than or equal to 0 weeks')
    .required('Timeline Impact is required')
    .integer('Timeline Impact must be an integer')
});

const ProposedSolutionForm: React.FC<ProposedSolutionFormProps> = ({
  description,
  budgetImpact,
  timelineImpact,
  scopeImpact,
  readOnly,
  onAdd
}) => {
  const { formState, handleSubmit, control } = useForm<ProposedSolution>({
    resolver: yupResolver(schema),
    defaultValues: { description, budgetImpact, timelineImpact, scopeImpact }
  });

  return (
    <PageBlock title="" style={{ my: 0 }}>
      <form
        id={'individual-proposed-solution-form'}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onAdd)(e);
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
                defaultValue={value}
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
                defaultValue={value}
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
                defaultValue={value}
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
                defaultValue={value}
                fullWidth
                sx={{ width: 400 }}
                disabled={readOnly}
                placeholder="# needed"
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
            <Button
              color="success"
              variant="contained"
              type="submit"
              form="individual-proposed-solution-form"
              sx={{ textTransform: 'none', fontSize: 16, marginTop: 3 }}
            >
              Add
            </Button>
          </Box>
        )}
      </form>
    </PageBlock>
  );
};

export default ProposedSolutionForm;
