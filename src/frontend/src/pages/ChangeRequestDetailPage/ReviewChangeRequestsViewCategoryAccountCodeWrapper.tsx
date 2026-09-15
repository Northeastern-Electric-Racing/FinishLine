import { ChangeRequest } from 'shared';
import ReviewChangeRequestsView from './ReviewChangeRequestView';
import { FormInput } from './ReviewChangeRequest';

interface ReviewChangeRequestViewCategoryAccountCodeWrapperProps {
  cr: ChangeRequest;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
}

const ReviewChangeRequestsViewCategoryAccountCodeWrapper: React.FC<
  ReviewChangeRequestViewCategoryAccountCodeWrapperProps
> = ({ cr, modalShow, onHide, onSubmit }: ReviewChangeRequestViewCategoryAccountCodeWrapperProps) => {
  return (
    <ReviewChangeRequestsView cr={cr} modalShow={modalShow} onHide={onHide} onSubmit={onSubmit} blockingWorkPackages={[]} />
  );
};

export default ReviewChangeRequestsViewCategoryAccountCodeWrapper;
