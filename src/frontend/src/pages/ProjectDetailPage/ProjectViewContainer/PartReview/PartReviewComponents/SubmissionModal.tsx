// import { WbsElement } from 'shared';
// import LoadingIndicator from '../../../../../components/LoadingIndicator';
// import { useToast } from '../../../../../hooks/toasts.hooks';
// import ErrorPage from '../../../../ErrorPage';
// import { useCreateAssembly } from '../../../../../hooks/bom.hooks';
// import { SubmissionFormInput } from './SubmissionForm';
// import SubmissionFormView from './SubmissionFormView';

// export interface CreateSubmissionModalProps {
//   open: boolean;
//   onHide: () => void;
//   wbsElement: WbsElement;
// }

// const CreateSubmissionModal: React.FC<CreateSubmissionModalProps> = ({ open, onHide, wbsElement }) => {
//   const { mutateAsync: createAssembly, isLoading, isError, error } = useCreateAssembly(wbsElement.wbsNum);
//   const toast = useToast();

//   if (isLoading) return <LoadingIndicator />;
//   if (isError) return <ErrorPage message={error?.message} />;

//   const onSubmit = async (data: SubmissionFormInput): Promise<void> => {
//     try {
//       await createAssembly(data);
//       toast.success('Submission Created Successfully');
//       onHide();
//     } catch (error) {
//       if (error instanceof Error) {
//         toast.error(error.message);
//       }
//     }
//   };

//   return <SubmissionFormView submitText="Add" onSubmit={onSubmit} onHide={onHide} open={open} />;
// };

// export default CreateSubmissionModal;
