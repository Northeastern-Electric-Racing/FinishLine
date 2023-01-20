/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { wbsPipe } from '../../../utils/pipes';
import { mockUtils } from '../../test-support/test-data/test-utils.stub';
import { exampleWbsWorkPackage1, exampleWbsWorkPackage2 } from '../../test-support/test-data/wbs-numbers.stub';
import { render, screen } from '../../test-support/test-utils';
import CreateWPFormView from '../../../pages/CreateWorkPackagePage/CreateWPFormView';

const mockDependencies = [wbsPipe(exampleWbsWorkPackage2), wbsPipe(exampleWbsWorkPackage1)];
const mockEA = ['yooooo', 'wassup', 'bruh', 'whoosh'];
const mockDeliverables = ['go vroom'];
const mockStates = {
  name: () => null,
  wbsNum: () => null,
  crId: () => null,
  startDate: () => null,
  duration: () => null
};

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = (allowSubmit = true) => {
  return render(
    <CreateWPFormView
      states={mockStates}
      dependencies={mockDependencies}
      initialValues={{ name: '', wbsNum: '', duration: -1, crId: -1 }}
      depUtils={mockUtils}
      expectedActivities={mockEA}
      eaUtils={mockUtils}
      deliverables={mockDeliverables}
      delUtils={mockUtils}
      onSubmit={() => null}
      onCancel={() => null}
      allowSubmit={allowSubmit}
    />
  );
};

describe('create wp form view test suite', () => {
  it('disables submit button when allowSubmit is false', () => {
    renderComponent(false);

    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables submit button when allowSubmit is true', () => {
    renderComponent(true);

    expect(screen.getByText('Create')).not.toBeDisabled();
  });
});
