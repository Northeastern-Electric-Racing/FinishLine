// services/calendar.services.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCalendarData {
  name: string;
  description: string;
  colorHexCode: string;
  userCreatedId: string;
}

interface EditCalendarData {
  name: string;
  description: string;
  colorHexCode: string;
}

export default class CalendarService {
  static async getAllCalendars() {
    return await prisma.calendar.findMany({
      where: {
        dateDeleted: null
      },
      include: {
        userCreated: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  static async getSingleCalendar(calendarId: string) {
    const calendar = await prisma.calendar.findUnique({
      where: {
        calendarId,
        dateDeleted: null
      },
      include: {
        userCreated: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!calendar) {
      throw new Error('Calendar not found');
    }

    return calendar;
  }

  static async createCalendar(data: CreateCalendarData) {
    return await prisma.calendar.create({
      data: {
        name: data.name,
        description: data.description,
        colorHexCode: data.colorHexCode,
        userCreatedId: data.userCreatedId
      },
      include: {
        userCreated: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  static async editCalendar(calendarId: string, data: EditCalendarData) {
    // First check if calendar exists
    const existingCalendar = await prisma.calendar.findUnique({
      where: {
        calendarId,
        dateDeleted: null
      }
    });

    if (!existingCalendar) {
      throw new Error('Calendar not found');
    }

    return await prisma.calendar.update({
      where: { calendarId },
      data: {
        name: data.name,
        description: data.description,
        colorHexCode: data.colorHexCode
      },
      include: {
        userCreated: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  static async deleteCalendar(calendarId: string, deletedByUserId: string) {
    const existingCalendar = await prisma.calendar.findUnique({
      where: {
        calendarId,
        dateDeleted: null
      }
    });

    if (!existingCalendar) {
      throw new Error('Calendar not found');
    }
    return await prisma.calendar.update({
      where: { calendarId },
      data: {
        dateDeleted: new Date(),
        userDeletedId: deletedByUserId
      }
    });
  }
}
