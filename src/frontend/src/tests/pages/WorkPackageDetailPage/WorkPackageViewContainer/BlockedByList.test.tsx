/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen, routerWrapperBuilder } from '../../../test-support/test-utils';
import { exampleDesignWorkPackage } from '../../../test-support/test-data/work-packages.stub';
import { wbsPipe } from '../../../../utils/pipes';
// import DependenciesList from './dependencies-list';
// import { FormContext } from '../../work-package-container';

// Sets up the component under test with the desired values and renders it
const renderComponent = (_editMode?: boolean, path?: string, route?: string) => {
  // TODO: Cleanup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const RouterWrapper = routerWrapperBuilder({ path, route });
  // const setField = (field: string, value: any) => {};
  return render(
    <p>it's fucked</p>
    // <RouterWrapper>
    //   {editMode ? (
    //     <FormContext.Provider value={{ editMode, setField }}>
    //       <DependenciesList dependencies={exampleDesignWorkPackage.dependencies} />
    //     </FormContext.Provider>
    //   ) : (
    //     <DependenciesList dependencies={exampleDesignWorkPackage.dependencies} />
    //   )}
    // </RouterWrapper>
  );
};

describe.skip('Rendering Work Package Blocked By Component', () => {
  test('Rendering example 2', () => {
    renderComponent();
    expect(screen.getByText(`Blocked By`)).toBeInTheDocument();

    exampleDesignWorkPackage.blockedBy.forEach((wbs) => {
      expect(screen.getByText(`${wbsPipe(wbs)}`)).toBeInTheDocument();
    });
  });
  test('Rendering example 2, in edit mode', () => {
    renderComponent(true);
    expect(screen.getByText(`Blocked By`)).toBeInTheDocument();

    exampleDesignWorkPackage.blockedBy.forEach((wbs) => {
      expect(screen.getByText(`${wbsPipe(wbs)}`)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('New WBS #')).toBeInTheDocument();
  });
});
