import { Prisma } from '@prisma/client';
import { ExpenseType } from 'shared';

const expenseTypeTransformer = (expenseType: Prisma.Expense_TypeGetPayload<null>): ExpenseType => {
  return {
    expenseTypeId: expenseType.expenseTypeId,
    name: expenseType.name,
    code: expenseType.code,
    allowed: expenseType.allowed
  };
};

export default expenseTypeTransformer;
