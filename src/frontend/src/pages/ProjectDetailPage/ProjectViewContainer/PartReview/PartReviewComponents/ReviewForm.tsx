// import { yupResolver } from '@hookform/resolvers/yup';
// import { useForm } from 'react-hook-form';
// import * as yup from 'yup';
// import ReviewFormView from './ReviewFormView';

// export interface ReviewFormInput {
//   partId: string;
//   fileIds: string[];
//   submissionId: string;
//   notes?: string;
// }

// export interface ReviewFormProps {
//   submitText: 'Add' | 'Edit';
//   onSubmit: (payload: ReviewFormInput) => void;
//   defaultValues?: ReviewFormInput;
//   onHide: () => void;
//   open: boolean;
// }

// const schema = yup.object().shape({
//   partId: yup.string().required('Select a Part!'),
//   fileIds: yup.array().of(yup.string().defined()).required(),
//   submissionId: yup.string().required('Select a Submission!'),
//   notes: yup.string().optional()
// });

// const ReviewForm: React.FC<ReviewFormProps> = ({ submitText, onSubmit, defaultValues, onHide, open }) => {
//   const {
//     handleSubmit,
//     control,
//     formState: { errors },
//   } = useForm<ReviewFormInput>({
//     defaultValues: {
//       partId: defaultValues?.partId ?? '',
//       fileIds: defaultValues?.fileIds ?? [],
//       submissionId: defaultValues?.submissionId ?? '',
//       notes: defaultValues?.notes ?? ''
//     },
//     resolver: yupResolver(schema)
//   });

//   const { data: parts, isLoading: isLoadingParts, isError: partsIsError, error: partsError } = getReviewsFromProject(wbsNum);

//   return (
//     <ReviewFormView
//       onSubmit={onSubmit}
//       handleSubmit={handleSubmit}
//       submitText={submitText}
//       onHide={onHide}
//       control={control}
//       errors={errors}
//       open={open}
//     />
//   );
// };

// export default ReviewForm;
