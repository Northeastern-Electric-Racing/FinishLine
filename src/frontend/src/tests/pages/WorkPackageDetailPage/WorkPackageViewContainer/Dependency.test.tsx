/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../TestSupport/TestUtils';
import { exampleWbsWorkPackage1 } from '../../../TestSupport/TestData/WbsNumbers.stub';
import { wbsPipe } from '../../../../utils/Pipes';
import Dependency from '../../../../pages/WorkPackageDetailPage/WorkPackageViewContainer/Dependency';

describe('rendering a dependency', () => {
  it('renders with edit mode disabled', () => {
    render(<Dependency wbsNumber={exampleWbsWorkPackage1} handleDelete={() => {}} />);
    expect(screen.getByText(wbsPipe(exampleWbsWorkPackage1))).toBeInTheDocument();
  });
});
