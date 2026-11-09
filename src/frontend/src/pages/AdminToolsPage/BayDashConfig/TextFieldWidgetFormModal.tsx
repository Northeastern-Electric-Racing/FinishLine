/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { FormControl, FormHelperText, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BayDashboardWidgetSize, TEXT_FIELD_MAX_LENGTH } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';

interface TextFieldWidgetFormValues {
  text: string;
}

// the text can be as long as the size of the widget it's shown in allows
const buildTextFieldSchema = (size: BayDashboardWidgetSize) => {
  const maxLength = TEXT_FIELD_MAX_LENGTH[size] ?? 0;
  return yup.object().shape({
    text: yup
      .string()
      .trim()
      .required('Text is required')
      .max(maxLength, `Text must be ${maxLength} characters or fewer`)
  });
};

interface TextFieldWidgetFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  size: BayDashboardWidgetSize;
  defaultValues?: TextFieldWidgetFormValues;
  onSubmit: (data: TextFieldWidgetFormValues) => void;
}

/**
 * Modal form for editing the text shown in the text field widget
 */
const TextFieldWidgetFormModal: React.FC<TextFieldWidgetFormModalProps> = ({
  showModal,
  handleClose,
  size,
  defaultValues,
  onSubmit
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<TextFieldWidgetFormValues>({
    resolver: yupResolver(buildTextFieldSchema(size)),
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
      paperProps={{ width: '500px' }}
      showCloseButton
    >
      <FormControl fullWidth>
        <Typography color="#EF4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20, mb: 2 }}>
          Text:
        </Typography>
        <ReactHookTextField
          name="text"
          control={control}
          placeholder="Enter text to display on the bay dashboard"
          fullWidth
        />
        <FormHelperText error>{errors.text?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default TextFieldWidgetFormModal;
