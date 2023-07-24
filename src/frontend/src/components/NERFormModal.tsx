import { ReactNode } from 'react';
import { UseFormHandleSubmit, UseFormReset } from 'react-hook-form';
import NERModal from './NERModal';

interface NERFormModalProps {
  open: boolean;
  formId: string;
  title: string;
  reset: UseFormReset<any>;
  handleUseFormSubmit: UseFormHandleSubmit<any, undefined>;
  onFormSubmit: (data: any) => void;
  onHide: () => void;
  disabled?: boolean;
  submitText?: string;
  cancelText?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
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
  showCloseButton
}: NERFormModalProps) => {
  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: any) => {
    await onFormSubmit(data);
    reset({ confirmDone: false });
  };

  return (
    <NERModal
      open={open}
      onHide={onHide}
      formId={formId}
      title={title}
      cancelText={cancelText ? cancelText : 'Cancel'}
      submitText={submitText ? submitText : 'Submit'}
      disabled={disabled}
      showCloseButton={showCloseButton}
    >
      <form id={formId} onSubmit={handleUseFormSubmit(onSubmitWrapper)}>
        {children}
      </form>
    </NERModal>
  );
};

export default NERFormModal;
