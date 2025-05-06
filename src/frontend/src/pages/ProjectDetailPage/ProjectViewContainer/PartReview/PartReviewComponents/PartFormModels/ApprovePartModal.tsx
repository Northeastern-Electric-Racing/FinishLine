import { PartSubmission, Review_Status } from "shared";
import * as yup from 'yup';
import { PartPayload } from "../../../../../../hooks/part-review.hooks";
import { useToast } from "../../../../../../hooks/toasts.hooks";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import NERFormModal from "../../../../../../components/NERFormModal";
import { Grid } from "@mui/material";
import { Autocomplete, FormControl, FormHelperText, FormLabel, TextField } from "@mui/material";
import ReactHookTextField from "../../../../../../components/ReactHookTextField";
import { useState } from "react";

interface ApprovePartModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: PartPayload) => void;
  submissionsInPart: PartSubmission[];
  notes?: string;
}

const ApprovePartModal = ({ open, handleClose, onSubmit, submissionsInPart}: ApprovePartModalProps) => {
    const toast = useToast();
    const [submission, setSubmission] = useState<PartSubmission | undefined>();


    const schema = yup.object().shape({
      submissionId: yup.string().required(),
      notes: yup.string().optional()
      });

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors }
      } = useForm({
        resolver: yupResolver(schema)
      });
    
      const onFormSubmit = async (data: PartPayload) => {
        try {
          handleClose();
          await onSubmit({
            ...data,
            reviewStatus: Review_Status.APPROVED
          });
          toast.success('Part Approved!');
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message);
          }
        }
        reset();
      };

      return (
        <NERFormModal
          open={open}
          onHide={handleClose}
          title={'Approve Submission'}
          reset={() => reset()}
          handleUseFormSubmit={handleSubmit}
          onFormSubmit={onFormSubmit}
          formId={'approve-Submission-form'}
          showCloseButton
        >
          <Grid container spacing={2} alignItems="flex-start" maxWidth={'100%'}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Submission Being Approved</FormLabel>
                <Autocomplete
                  multiple
                  options={submissionsInPart}
                  getOptionLabel={(option) => option.name}
                  onChange={(_event, value) => {
                    const selectedSubmission = value[0] ?? undefined;
                    setSubmission(selectedSubmission);
                  }}
                  renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select a Submission" error={false} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel>Reviewer Notes (optional)</FormLabel>
                <ReactHookTextField
                  required={false}
                  name="notes"
                  control={control}
                  multiline
                  rows={3}
                  placeholder="Any additional comments go here...."
                />
                <FormHelperText error>{errors.notes?.message}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </NERFormModal>
      );
};

export default ApprovePartModal;
