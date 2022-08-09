/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequestType, ChangeRequestReason } from 'shared';
import { act, fireEvent, render, screen } from '../../../test-support/test-utils';
import ChangeRequestsFilter from './change-requests-filter';

let temp: any[] = [];

const mockUpdate = (
  type: string,
  impact: number[],
  reason: string,
  state: number[],
  implemented: string
) => {
  temp = [];
  temp.push(type);
  temp.push(impact);
  temp.push(reason);
  temp.push(state);
  temp.push(implemented);
};

// Sets up the component under test with the desired values and renders it.
const renderComponent = () => {
  render(<ChangeRequestsFilter update={mockUpdate} />);
};

describe('change requests table filter component', () => {
  it('checking that title and labels are there', async () => {
    renderComponent();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Impact')).toBeInTheDocument();
    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Not Reviewed')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Denied')).toBeInTheDocument();
    expect(screen.getByText('Implemented')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('checking if data in the type menu is correct', async () => {
    renderComponent();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Issue)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Redefinition)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Other)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.StageGate)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Activation)).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('type-toggle'));
    });
    expect(screen.queryByText('None')).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Issue)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Redefinition)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Other)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.StageGate)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestType.Activation)).toBeInTheDocument();
  });

  it('checking if data in the reason dropdown menu is correct', async () => {
    renderComponent();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Estimation)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.School)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Manufacturing)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Design)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Rules)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.OtherProject)).not.toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Other)).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('reason-toggle'));
    });
    expect(screen.queryByText('None')).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Estimation)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.School)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Manufacturing)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Design)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Rules)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.OtherProject)).toBeInTheDocument();
    expect(screen.queryByText(ChangeRequestReason.Other)).toBeInTheDocument();
  });

  it('checking if data in the implemented dropdown menu is correct', async () => {
    renderComponent();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
    expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    expect(screen.queryByText('No')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('implemented-toggle'));
    });
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('checking if text in the apply button is correct', async () => {
    renderComponent();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    }); // Clicking it should do nothing to its visibility, not change the page, etc.
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('checking if text in the clear button is correct', async () => {
    renderComponent();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('Clear'));
    }); // Clicking it should do nothing to its visibility, not change the page, etc.
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('checking if type dropdown sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[0]).toBe('');
    await act(async () => {
      fireEvent.click(screen.getByTestId('type-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(ChangeRequestType.Other));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[0]).toBe(ChangeRequestType.Other);
    await act(async () => {
      fireEvent.click(screen.getByTestId('type-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('None'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[0]).toBe('');
  });

  it('checking if reason dropdown sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[2]).toBe('');
    await act(async () => {
      fireEvent.click(screen.getByTestId('reason-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(ChangeRequestReason.School));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[2]).toBe(ChangeRequestReason.School);
    await act(async () => {
      fireEvent.click(screen.getByTestId('reason-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('None'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[2]).toBe('');
  });

  it('checking if implemented dropdown sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[4]).toBe('');
    await act(async () => {
      fireEvent.click(screen.getByTestId('implemented-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Yes'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[4]).toBe('Yes');
    await act(async () => {
      fireEvent.click(screen.getByTestId('implemented-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('None'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[4]).toBe('');
  });

  it('checking if impact selector sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[1]).toStrictEqual([]);
    await act(async () => {
      fireEvent.click(screen.getByText('Scope'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[1]).toStrictEqual([0]);
    await act(async () => {
      fireEvent.click(screen.getByText('Budget'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[1]).toStrictEqual([0, 1]);
    await act(async () => {
      fireEvent.click(screen.getByText('Scope'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[1]).toStrictEqual([1]);
  });

  it('checking if state selector sets filter setting correctly', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[3]).toStrictEqual([]);
    await act(async () => {
      fireEvent.click(screen.getByText('Not Reviewed'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[3]).toStrictEqual([0]);
    await act(async () => {
      fireEvent.click(screen.getByText('Accepted'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[3]).toStrictEqual([0, 1]);
    await act(async () => {
      fireEvent.click(screen.getByText('Not Reviewed'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp[3]).toStrictEqual([1]);
  });

  it('clear button clears all settings', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByText('Clear'));
    });
    expect(temp).toStrictEqual(['', [], '', [], '']);
    await act(async () => {
      fireEvent.click(screen.getByTestId('type-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(ChangeRequestType.Other));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Scope'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Budget'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Timeline'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('reason-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(ChangeRequestReason.Manufacturing));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Not Reviewed'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Accepted'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Denied'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('implemented-toggle'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Yes'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Apply'));
    });
    expect(temp).not.toStrictEqual(['', [], '', [], '']);
    await act(async () => {
      fireEvent.click(screen.getByText('Clear'));
    });
    expect(temp).toStrictEqual(['', [], '', [], '']);
  });
});
