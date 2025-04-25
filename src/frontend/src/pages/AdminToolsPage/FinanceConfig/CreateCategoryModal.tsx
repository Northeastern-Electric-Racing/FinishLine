// import LoadingIndicator from '../../../components/LoadingIndicator';
// import { useCreateAccountCode } from '../../../hooks/finance.hooks';
// import ErrorPage from '../../ErrorPage';
// import AccountCodeFormModal from './AccountCodeFormModal';

// interface CreateCategoryModalProps {
//   showModal: boolean;
//   handleClose: () => void;
// }

// const CreateCategoryModal = ({ showModal, handleClose }: CreateCategoryModalProps) => {
//   const { isLoading, isError, error, mutateAsync } = useCreateAccountCode();

//   if (isError) return <ErrorPage message={error?.message} />;
//   if (isLoading) return <LoadingIndicator />;

//   return <IndexCodeFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} />;
// };

// export default CreateCategoryModal;
