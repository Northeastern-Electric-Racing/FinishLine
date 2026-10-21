/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAvailableBayDashboardWidgets } from '../../../hooks/bay-dashboard.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import {
  BayDashboardWidgetSelection,
  bayDashboardWidgetDisplayNames,
  bayDashboardWidgetSizes
} from '../../../utils/bay-dashboard.utils';
import ErrorPage from '../../ErrorPage';
import WidgetSizeDropdown from './WidgetSizeDropdown';

interface WidgetSelectionProps {
  // highlighted widget per size, only one per size (until phase 3 widget rotations)
  selection: BayDashboardWidgetSelection;
  onSelectionChange: (selection: BayDashboardWidgetSelection) => void;
}

/**
 * Dropdowns listing the widgets available for each slot size.
 * Clicking a widget highlights it, one per size, and clicking it again unselects it.
 */
const WidgetSelection: React.FC<WidgetSelectionProps> = ({ selection, onSelectionChange }) => {
  const { data: availableWidgets, isLoading, isError, error } = useAvailableBayDashboardWidgets();
  const toast = useToast();

  const handleSelect = (size: BayDashboardWidgetSize, type: BayDashboardWidgetType) => {
    const widgetName = bayDashboardWidgetDisplayNames[type];
    const sizeName = size.toLowerCase();
    if (selection[size] === type) {
      onSelectionChange({ ...selection, [size]: undefined });
      toast.success(`Removed ${sizeName} ${widgetName} widget`);
    } else {
      onSelectionChange({ ...selection, [size]: type });
      toast.success(`Added ${sizeName} ${widgetName} widget`);
    }
  };

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !availableWidgets) return <LoadingIndicator />;

  return (
    <>
      {bayDashboardWidgetSizes.map((size) => (
        <WidgetSizeDropdown
          key={size}
          size={size}
          widgets={availableWidgets.widgets.filter((widget) => widget.sizes.includes(size))}
          selectedType={selection[size]}
          onSelect={(type) => handleSelect(size, type)}
        />
      ))}
    </>
  );
};

export default WidgetSelection;
