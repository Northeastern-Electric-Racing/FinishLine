/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useParams } from 'react-router-dom';
import ErrorPage from '../../ErrorPage';
import DesignReviewDetailPage from './DesignReviewDetailPage';
import { useSingleDesignReview } from '../../../hooks/design-reviews.hooks';

const DesignReviewDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: designReview, isError, error, isLoading } = useSingleDesignReview(id);

  if (isError) return <ErrorPage error={error} />;
  if (!designReview || isLoading) return <LoadingIndicator />;

  return <DesignReviewDetailPage designReview={designReview} />;
};

export default DesignReviewDetails;
