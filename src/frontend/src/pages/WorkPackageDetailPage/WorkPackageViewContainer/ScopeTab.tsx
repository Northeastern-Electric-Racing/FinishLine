import { WbsElementStatus, WorkPackage, isGuest } from 'shared';
import CheckList, { CheckListItem } from '../../../components/CheckList';
import { useCurrentUser } from '../../../hooks/users.hooks';

const ScopeTab = ({ workPackage }: { workPackage: WorkPackage }) => {
  const user = useCurrentUser();

  const checkListDisabled = workPackage.status !== WbsElementStatus.Active || isGuest(user.role);

  return (
    <>
      <CheckList
        title={'Expected Activities'}
        items={workPackage.expectedActivities
          .filter((ea) => !ea.dateDeleted)
          .map((ea): CheckListItem => {
            return { ...ea, resolved: !!ea.userChecked, user: ea.userChecked, dateChecked: ea.dateChecked };
          })}
        isDisabled={checkListDisabled}
      />
      <div style={{ marginTop: 5 }}>
        <CheckList
          title={'Deliverables'}
          items={workPackage.deliverables
            .filter((del) => !del.dateDeleted)
            .map((del): CheckListItem => {
              return { ...del, resolved: !!del.userChecked, user: del.userChecked, dateChecked: del.dateChecked };
            })}
          isDisabled={checkListDisabled}
        />
      </div>
    </>
  );
};

export default ScopeTab;
