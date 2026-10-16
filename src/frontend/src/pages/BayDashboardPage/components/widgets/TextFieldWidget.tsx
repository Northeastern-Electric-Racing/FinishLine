/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import NERWidget from '../../../../components/NERWidget';
import { BayDashboardWidgetProps, bayDashboardWidgetDisplayNames } from '../../../../utils/bay-dashboard.utils';
import { BayDashboardWidgetType } from 'shared';

/**
 * Placeholder frame until the TextField widget is built, the real widget lays itself out by size.
 */
const TextFieldWidget: React.FC<BayDashboardWidgetProps> = ({ size }) => {
  return <NERWidget size={size} title={bayDashboardWidgetDisplayNames[BayDashboardWidgetType.TEXT_FIELD]} />;
};

export default TextFieldWidget;
