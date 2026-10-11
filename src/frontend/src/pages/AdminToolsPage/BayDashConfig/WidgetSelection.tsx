/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAvailableBayDashboardWidgets } from '../../../hooks/bay-dashboard.hooks';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import { bayDashboardWidgetSizes } from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import WidgetSizeDropdown from './WidgetSizeDropdown';

interface WidgetSelectionViewProps {
  slug: string;
}

const WidgetSelectionView: React.FC<WidgetSelectionViewProps> = ({ slug }) => {
  const { data: availableWidgets, isLoading, isError, error } = useAvailableBayDashboardWidgets(slug);

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !availableWidgets) return <LoadingIndicator />;

  return (
    <>
      {bayDashboardWidgetSizes.map((size) => (
        <WidgetSizeDropdown
          key={size}
          title={size.charAt(0) + size.slice(1).toLowerCase()}
          widgets={availableWidgets.widgets.filter((widget) => widget.sizes.includes(size))}
        />
      ))}
    </>
  );
};

/**
 * Dropdowns listing the widgets available for each slot size. Display only for now.
 */
const WidgetSelection: React.FC = () => {
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !organization) return <LoadingIndicator />;

  return <WidgetSelectionView slug={organization.slug} />;
};

export default WidgetSelection;
