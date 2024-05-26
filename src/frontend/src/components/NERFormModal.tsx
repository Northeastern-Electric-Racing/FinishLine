import { ReactNode } from 'react';
import { FieldValues, UseFormHandleSubmit, UseFormReset } from 'react-hook-form';
import NERModal, { NERModalProps } from './NERModal';

interface NERFormModalProps<T extends FieldValues> extends NERModalProps {
  reset: UseFormReset<T>;
  handleUseFormSubmit: UseFormHandleSubmit<T, any>;
  onFormSubmit: (data: T) => void;
  children?: ReactNode;
}

const NERFormModal = ({
  open,
  onHide,
  formId,
  title,
  reset,
  handleUseFormSubmit,
  onFormSubmit,
  cancelText,
  submitText,
  disabled,
  children,
  showCloseButton,
  hideBackDrop = false
}: NERFormModalProps<any>) => {
  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: any) => {
    await onFormSubmit(data);
    reset();
  };

  return (
    <NERModal
      open={open}
      onHide={() => {
        onHide();
        reset();
      }}
      formId={formId}
      title={title}
      cancelText={cancelText ? cancelText : 'Cancel'}
      submitText={submitText ? submitText : 'Submit'}
      disabled={disabled}
      showCloseButton={showCloseButton}
      hideBackDrop={hideBackDrop}
    >
      <form id={formId} onSubmit={handleUseFormSubmit(onSubmitWrapper)} noValidate>
        {children}
      </form>
    </NERModal>
  );
};

export default NERFormModal;
