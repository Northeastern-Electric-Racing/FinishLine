// import { WbsElement } from 'shared';
// import LoadingIndicator from '../../../../../components/LoadingIndicator';
// import { useToast } from '../../../../../hooks/toasts.hooks';
// import ErrorPage from '../../../../ErrorPage';
// import { useCreateAssembly } from '../../../../../hooks/bom.hooks';
// import ReviewFormView from './ReviewFormView';
// import { ReviewFormInput } from './ReviewForm';

// export interface CreateReviewModalProps {
//   open: boolean;
//   onHide: () => void;
//   wbsElement: WbsElement;
// }

// const CreateReviewModal: React.FC<CreateReviewModalProps> = ({ open, onHide, wbsElement }) => {
//   const { mutateAsync: createAssembly, isLoading, isError, error } = useCreateAssembly(wbsElement.wbsNum);
//   const toast = useToast();

//   if (isLoading) return <LoadingIndicator />;
//   if (isError) return <ErrorPage message={error?.message} />;

//   const onSubmit = async (data: ReviewFormInput): Promise<void> => {
//     try {
//       await createAssembly(data);
//       toast.success('Review Created Successfully');
//       onHide();
//     } catch (error) {
//       if (error instanceof Error) {
//         toast.error(error.message);
//       }
//     }
//   };

//   return <ReviewFormView submitText="Add" onSubmit={onSubmit} onHide={onHide} open={open} />;
// };

// export default CreateReviewModal;
