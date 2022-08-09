/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import { FormContext } from '../../pages/WorkPackageDetailPage/work-package-edit-container/work-package-edit-container';
import EditableDetail from './editable-detail';

describe.skip('Rendering Editable Detail Component', () => {
  const setField = (field: string, value: any) => {};
  const renderComponent = (editMode: boolean, readOnly?: boolean) => {
    return render(
      <FormContext.Provider value={{ editMode, setField }}>
        <EditableDetail
          title="testTitle"
          value="testValue"
          readOnly={readOnly}
          suffix="testSuffix"
          type="text"
        />
      </FormContext.Provider>
    );
  };

  it('renders the content with edit mode disabled', () => {
    renderComponent(false);
    expect(screen.getByText('testTitle:')).toBeInTheDocument();
    expect(screen.getByText('testValue testSuffix')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('testValue')).not.toBeInTheDocument();
  });

  it('renders the content with edit mode enabled', () => {
    renderComponent(true);
    expect(screen.getByText('testTitle:')).toBeInTheDocument();
    expect(screen.queryByText('testValue')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('testValue')).toBeInTheDocument();
    expect(screen.queryByText('testSuffix')).toBeInTheDocument();
  });
  it('renders the content with edit mode enabled and readOnly mode enabled', () => {
    renderComponent(true, true);
    expect(screen.getByText('testTitle:')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('testValue')).toBeInTheDocument();
  });
});
