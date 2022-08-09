/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../test-support/test-utils';
import { exampleWorkPackage2 } from '../../test-support/test-data/work-packages.stub';
import ChangesList from './changes-list';

/**
 * Sets up the component under test with the desired values and renders it.
 */
const renderComponent = () => {
  const RouterWrapper = routerWrapperBuilder({});
  return render(
    <RouterWrapper>
      <ChangesList changes={exampleWorkPackage2.changes} />
    </RouterWrapper>
  );
};

describe('Rendering Work Package Changes Component', () => {
  it('renders the component title', () => {
    renderComponent();

    expect(screen.getByText(`Changes`)).toBeInTheDocument();
  });

  it('renders all the changes', () => {
    renderComponent();

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText(/Decreased duration from 10 weeks to 7 weeks./i)).toBeInTheDocument();
    expect(screen.getByText('#54')).toBeInTheDocument();
    expect(screen.getByText(/Added "jet fuel burns hot" bullet./i)).toBeInTheDocument();
  });
});
