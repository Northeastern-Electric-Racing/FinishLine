import { ReactNode } from 'react';
import { FieldValues, UseFormHandleSubmit, UseFormReset } from 'react-hook-form';
import NERModal, { NERModalProps } from './NERModal';
import { useToast } from '../hooks/toasts.hooks';

interface NERFormModalProps<T extends FieldValues> extends NERModalProps {
  reset: UseFormReset<T>;
  handleUseFormSubmit: UseFormHandleSubmit<T, any>;
  onFormSubmit: (data: T) => void;
  formId: string;
  children?: ReactNode;
  paperProps?: any;
  titleChildren?: ReactNode;
  actionsLeftChildren?: ReactNode;
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
  hideBackDrop = false,
  paperProps,
  titleChildren,
  actionsLeftChildren
}: NERFormModalProps<any>) => {
  const toast = useToast();
  /**
   * Wrapper function for onSubmit so that form data is reset after submit
   */
  const onSubmitWrapper = async (data: any) => {
    try {
      await onFormSubmit(data);
      reset();
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message, 6000);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    await handleUseFormSubmit(onSubmitWrapper)(e);
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
      paperProps={paperProps}
      titleChildren={titleChildren}
      actionsLeftChildren={actionsLeftChildren}
    >
      <form id={formId} onSubmit={handleFormSubmit} noValidate>
        {children}
      </form>
    </NERModal>
  );
};

export default NERFormModal;
