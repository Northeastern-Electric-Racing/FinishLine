/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { act, fireEvent, render, screen } from '../../../test-support/test-utils';
import ProjectsTableFilter from './projects-table-filter';
import {
  exampleAdminUser,
  exampleLeadershipUser,
  exampleProjectLeadUser,
  exampleProjectManagerUser
} from '../../../test-support/test-data/users.stub';
import { WbsElementStatus } from 'shared';

let temp: any[] = [];

const mockOnClick = (
  status: string,
  projectLead: number,
  projectManager: number,
  carNumber: number
) => {
  temp = [];
  temp.push(status);
  temp.push(projectLead);
  temp.push(projectManager);
  temp.push(carNumber);
};

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  render(
    <ProjectsTableFilter
      onClick={mockOnClick}
      leads={[exampleProjectLeadUser, exampleLeadershipUser]}
      managers={[exampleLeadershipUser, exampleProjectManagerUser, exampleAdminUser]}
    />
  );
};

describe('projects table filter component', () => {
  it('checking that title and labels are there', async () => {
    renderComponent();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Car Number')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Project Lead')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
  });

  it('checking if data in the car dropdown menu is correct', async () => {
    renderComponent();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('car-num-toggle'));
    });
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('checking if data in the status dropdown menu is correct', async () => {
    renderComponent();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText(WbsElementStatus.Active)).not.toBeInTheDocument();
    expect(screen.queryByText(WbsElementStatus.Inactive)).not.toBeInTheDocument();
    expect(screen.queryByText(WbsElementStatus.Complete)).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('status-toggle'));
    });
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText(WbsElementStatus.Active)).toBeInTheDocument();
    expect(screen.getByText(WbsElementStatus.Inactive)).toBeInTheDocument();
    expect(screen.getByText(WbsElementStatus.Complete)).toBeInTheDocument();
  });

  it('checking if data in the project lead dropdown menu is correct', async () => {
    renderComponent();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('Amy Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Joe Blow')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('lead-toggle'));
    });
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Amy Smith')).toBeInTheDocument();
    expect(screen.getByText('Joe Blow')).toBeInTheDocument();
  });

  it('checking if data in the project manager dropdown menu is correct', async () => {
    renderComponent();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('Joe Blow')).not.toBeInTheDocument();
    expect(screen.queryByText('Rachel Barmatha')).not.toBeInTheDocument();
    expect(screen.queryByText('Joe Schmoe')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('manager-toggle'));
    });
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Joe Blow')).toBeInTheDocument();
    expect(screen.getByText('Rachel Barmatha')).toBeInTheDocument();
    expect(screen.getByText('Joe Shmoe')).toBeInTheDocument();
  });

  it('checking if text in the apply button is correct', async () => {
    renderComponent();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    }); // Clicking it should do nothing to its visibility, not change the page, etc.
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('checking if car number dropdown sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[3]).toBe(-1);
    await act(async () => {
      fireEvent.click(screen.getByTestId('car-num-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('1'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[3]).toBe(1);
    await act(async () => {
      fireEvent.click(screen.getByTestId('car-num-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('None'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[3]).toBe(-1);
  });

  it('checking if status dropdown sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[0]).toBe('');
    await act(async () => {
      fireEvent.click(screen.getByTestId('status-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(WbsElementStatus.Active));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[0]).toBe(WbsElementStatus.Active);
    await act(async () => {
      fireEvent.click(screen.getByTestId('status-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('None'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[0]).toBe('');
  });

  it('checking if project lead dropdown sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[1]).toBe(-1);
    await act(async () => {
      fireEvent.click(screen.getByTestId('lead-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Amy Smith'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[1]).toBe(4);
    await act(async () => {
      fireEvent.click(screen.getByTestId('lead-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('None'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[1]).toBe(-1);
  });

  it('checking if project manager dropdown sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[2]).toBe(-1);
    await act(async () => {
      fireEvent.click(screen.getByTestId('manager-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Joe Blow'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[2]).toBe(3);
    await act(async () => {
      fireEvent.click(screen.getByTestId('manager-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('None'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[2]).toBe(-1);
  });

  it('should have the correct text in the Clear button', async () => {
    renderComponent();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('Clear'));
    }); // Clicking it should do nothing to its visibility, not change the page, etc.
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should set all the filter values back to default after pressing clear', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[0]).toBe('');
    expect(temp[1]).toBe(-1);
    expect(temp[2]).toBe(-1);
    expect(temp[3]).toBe(-1);
    // manager
    await act(async () => {
      fireEvent.click(screen.getByTestId('manager-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Joe Blow'));
    });
    // status
    await act(async () => {
      fireEvent.click(screen.getByTestId('status-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(WbsElementStatus.Active));
    });
    // lead
    await act(async () => {
      fireEvent.click(screen.getByTestId('lead-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Amy Smith'));
    });
    // car number
    await act(async () => {
      fireEvent.click(screen.getByTestId('car-num-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('1'));
    });
    // apply all these filters
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    // all filter values should have been set
    expect(temp[0]).toBe(WbsElementStatus.Active);
    expect(temp[1]).toBe(4);
    expect(temp[2]).toBe(3);
    expect(temp[3]).toBe(1);
    // now clear
    await act(async () => {
      fireEvent.click(screen.getByText('Clear'));
    });
    // all filter values should now be back to defaults
    expect(temp[0]).toBe('');
    expect(temp[1]).toBe(-1);
    expect(temp[2]).toBe(-1);
    expect(temp[3]).toBe(-1);
  });
});
