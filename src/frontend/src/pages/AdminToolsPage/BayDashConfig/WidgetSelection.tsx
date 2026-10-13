/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAvailableBayDashboardWidgets } from '../../../hooks/bay-dashboard.hooks';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import { BayDashboardWidgetSelection, bayDashboardWidgetSizes } from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import WidgetSizeDropdown from './WidgetSizeDropdown';

interface WidgetSelectionProps {
  // highlighted widget per size, only one per size (until phase 3 widget rotations)
  selection: BayDashboardWidgetSelection;
  onSelectionChange: (selection: BayDashboardWidgetSelection) => void;
}

interface WidgetSelectionViewProps extends WidgetSelectionProps {
  slug: string;
}

const WidgetSelectionView: React.FC<WidgetSelectionViewProps> = ({ slug, selection, onSelectionChange }) => {
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
          selectedType={selection[size]}
          onSelect={(type) => onSelectionChange({ ...selection, [size]: selection[size] === type ? undefined : type })}
        />
      ))}
    </>
  );
};

/**
 * Dropdowns listing the widgets available for each slot size.
 * Clicking a widget highlights it, one per size, and clicking it again unselects it.
 */
const WidgetSelection: React.FC<WidgetSelectionProps> = ({ selection, onSelectionChange }) => {
  const { data: organization, isLoading, isError, error } = useCurrentOrganization();

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !organization) return <LoadingIndicator />;

  return <WidgetSelectionView slug={organization.slug} selection={selection} onSelectionChange={onSelectionChange} />;
};

export default WidgetSelection;
