import { Prisma, Role, Task_Priority, Task_Status, User } from '@prisma/client';
import { TaskPriority, TaskStatus } from 'shared';
import prisma from '../prisma/prisma';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import { HttpException } from './errors.utils';

export const convertTaskPriority = (priority: Task_Priority): TaskPriority =>
  ({
    LOW: TaskPriority.Low,
    MEDIUM: TaskPriority.Medium,
    HIGH: TaskPriority.High
  }[priority]);

export const convertTaskStatus = (status: Task_Status): TaskStatus =>
  ({
    IN_BACKLOG: TaskStatus.IN_BACKLOG,
    IN_PROGRESS: TaskStatus.IN_PROGRESS,
    DONE: TaskStatus.DONE
  }[status]);

export const hasPermissionToEditTask = async (user: User, taskId: string): Promise<boolean> => {
  if (user.role === Role.ADMIN || user.role === Role.APP_ADMIN) return true;

  const task = await prisma.task.findUnique({
    where: { taskId },
    select: {
      createdByUserId: true,
      assignees: true,
      wbsElement: {
        select: {
          projectLeadId: true,
          projectManagerId: true,
          project: {
            select: {
              team: {
                select: {
                  leaderId: true,
                  members: {
                    select: {
                      userId: true
                    }
                  }
                }
              }
            }
          },
          workPackage: {
            select: {
              project: {
                select: {
                  team: {
                    select: {
                      leaderId: true,
                      members: {
                        select: {
                          userId: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!task) return false;

  // Check if the user created the task
  if (task.createdByUserId === user.userId) return true;

  // Check if the task's wbsElement's projectLead or projectManager created the task
  if (task.wbsElement.projectLeadId === user.userId) return true;
  if (task.wbsElement.projectManagerId === user.userId) return true;

  // Check if the user is one of the assignees
  if (task.assignees.map((user) => user.userId).includes(user.userId)) return true;

  // Check if the user is the project leader or on the project team
  if (task.wbsElement.project?.team?.leaderId === user.userId) return true;

  // Do the same thing, but for the work package's project
  if (task.wbsElement.workPackage?.project?.team?.leaderId === user.userId) return true;

  return false;
};

//validates that the assignees are part of the project team
export const validateAssignees = (users: User[], projectTeam: Prisma.TeamGetPayload<typeof teamQueryArgs> | undefined | null) => {
  //checks if the project exists
  if (!projectTeam) throw new HttpException(400, `Project team does not exist!`);

  //checks if the assignees are part of the project team
  const teamMembersIds = projectTeam.members.concat(projectTeam.leader).map((user) => user.userId);
  if (users.some((assignee) => !teamMembersIds.includes(assignee.userId)))
    throw new HttpException(400, `Assignees must be part of the project team!`);
};
