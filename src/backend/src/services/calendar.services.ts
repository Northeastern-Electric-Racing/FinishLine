import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCalendarData {
  name: string;
  description: string;
  colorHexCode: string;
  userCreatedId: string;
}

export default class CalendarService {
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
}