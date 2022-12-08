/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react'; // avoid circular dependency
import AppContext from '../../app/AppContext';

jest.mock('../../app/AppContextQuery', () => {
  return {
    __esModule: true,
    default: (props: any) => {
      return <div>app context query {props.children}</div>;
    }
  };
});

jest.mock('../../app/AppContextAuth', () => {
  return {
    __esModule: true,
    default: (props: any) => {
      return <div>app context auth {props.children}</div>;
    }
  };
});

jest.mock('../../app/AppContextTheme', () => {
  return {
    __esModule: true,
    default: (props: any) => {
      return <div>app context theme {props.children}</div>;
    }
  };
});

// Sets up the component under test with the desired values and renders it
const renderComponent = () => {
  render(
    <AppContext>
      <p>full context</p>
    </AppContext>
  );
};

describe('app context', () => {
  it('renders the app context query component', () => {
    renderComponent();
    expect(screen.getByText('app context query')).toBeInTheDocument();
    expect(screen.getByText('app context auth')).toBeInTheDocument();
    expect(screen.getByText('app context theme')).toBeInTheDocument();
    expect(screen.getByText('full context')).toBeInTheDocument();
  });
});
