/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { FormControl, FormHelperText, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';

export const TEXT_FIELD_MAX_LENGTH = 100;

interface TextFieldWidgetFormValues {
  text: string;
}

const schema = yup.object().shape({
  text: yup
    .string()
    .trim()
    .required('Text is required')
    .max(TEXT_FIELD_MAX_LENGTH, `Text must be ${TEXT_FIELD_MAX_LENGTH} characters or fewer`)
});

interface TextFieldWidgetFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: TextFieldWidgetFormValues;
  onSubmit: (data: TextFieldWidgetFormValues) => void;
}

/**
 * Modal form for editing the text shown in the text field widget
 */
const TextFieldWidgetFormModal: React.FC<TextFieldWidgetFormModalProps> = ({
  showModal,
  handleClose,
  defaultValues,
  onSubmit
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<TextFieldWidgetFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { text: defaultValues?.text ?? '' }
  });

  const onFormSubmit = (data: TextFieldWidgetFormValues) => {
    onSubmit(data);
    handleClose();
  };

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="Edit Text Field"
      reset={() => reset({ text: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="edit-text-field-widget-form"
      showCloseButton
    >
      <FormControl fullWidth>
        <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          Text:*
        </Typography>
        <ReactHookTextField
          name="text"
          control={control}
          placeholder="Enter the text to show on the bay dashboard"
          fullWidth
          multiline
          rows={3}
        />
        <FormHelperText error>{errors.text?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default TextFieldWidgetFormModal;
