/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../../../../test-support/test-utils';
import { exampleWbsWorkPackage1 } from '../../../../../test-support/test-data/wbs-numbers.stub';
import { wbsPipe } from '../../../../../pipes';
import Dependency from './dependency';

describe('rendering a dependency', () => {
  it('renders with edit mode disabled', () => {
    render(<Dependency wbsNumber={exampleWbsWorkPackage1} handleDelete={() => {}} />);
    expect(screen.getByText(wbsPipe(exampleWbsWorkPackage1))).toBeInTheDocument();
  });
});
