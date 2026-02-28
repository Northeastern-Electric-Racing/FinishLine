-- AlterTable: Change date-only fields from timestamp to date type
-- PostgreSQL truncates the time portion automatically when casting timestamp to date

ALTER TABLE "Activation_CR" ALTER COLUMN "startDate" SET DATA TYPE date;
ALTER TABLE "Work_Package" ALTER COLUMN "startDate" SET DATA TYPE date;
ALTER TABLE "Task" ALTER COLUMN "deadline" SET DATA TYPE date;
ALTER TABLE "Task" ALTER COLUMN "startDate" SET DATA TYPE date;
ALTER TABLE "Reimbursement_Request" ALTER COLUMN "dateOfExpense" SET DATA TYPE date;
ALTER TABLE "Reimbursement_Request" ALTER COLUMN "dateDelivered" SET DATA TYPE date;
ALTER TABLE "Sponsor" ALTER COLUMN "joinDate" SET DATA TYPE date;
ALTER TABLE "Sponsor_Task" ALTER COLUMN "dueDate" SET DATA TYPE date;
ALTER TABLE "Sponsor_Task" ALTER COLUMN "notifyDate" SET DATA TYPE date;
ALTER TABLE "Availability" ALTER COLUMN "dateSet" SET DATA TYPE date;
ALTER TABLE "Milestone" ALTER COLUMN "dateOfEvent" SET DATA TYPE date;
ALTER TABLE "Graph" ALTER COLUMN "startDate" SET DATA TYPE date;
ALTER TABLE "Graph" ALTER COLUMN "endDate" SET DATA TYPE date;
