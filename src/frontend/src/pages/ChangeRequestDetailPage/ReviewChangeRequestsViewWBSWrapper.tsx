import { ChangeRequest } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetBlockingWorkPackages } from '../../hooks/work-packages.hooks';
import ErrorPage from '../ErrorPage';
import ReviewChangeRequestsView from './ReviewChangeRequestView';
import { FormInput } from './ReviewChangeRequest';

interface ReviewChangeRequestViewWBSWrapperProps {
  cr: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const ReviewChangeRequestsViewWBSWrapper: React.FC<ReviewChangeRequestViewWBSWrapperProps> = ({
  cr,
  modalShow,
  onHide,
  onSubmit
}: ReviewChangeRequestViewWBSWrapperProps) => {
  const { isLoading, isError, error, data: blockingWorkPackages } = useGetBlockingWorkPackages(cr.wbsNum!);

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} />;

  return (
    <ReviewChangeRequestsView
      cr={cr}
      modalShow={modalShow}
      onHide={onHide}
      onSubmit={onSubmit}
      blockingWorkPackages={blockingWorkPackages ?? []}
    />
  );
};

export default ReviewChangeRequestsViewWBSWrapper;
