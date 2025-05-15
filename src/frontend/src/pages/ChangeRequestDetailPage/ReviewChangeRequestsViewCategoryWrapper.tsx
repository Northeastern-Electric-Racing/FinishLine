import { ChangeRequest } from 'shared';
import ReviewChangeRequestsView from './ReviewChangeRequestView';
import { FormInput } from './ReviewChangeRequest';

interface ReviewChangeRequestViewCategoryWrapperProps {
  cr: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const ReviewChangeRequestsViewCategoryWrapper: React.FC<ReviewChangeRequestViewCategoryWrapperProps> = ({
  cr,
  modalShow,
  onHide,
  onSubmit
}: ReviewChangeRequestViewCategoryWrapperProps) => {
  return (
    <ReviewChangeRequestsView cr={cr} modalShow={modalShow} onHide={onHide} onSubmit={onSubmit} blockingWorkPackages={[]} />
  );
};

export default ReviewChangeRequestsViewCategoryWrapper;
