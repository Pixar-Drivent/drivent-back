import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import activitiesRepository from "@/repositories/activities-repository";
import { notFoundError, requestError, unauthorizedError } from "@/errors";
import { Activity, Local } from "@prisma/client";
import localsRepository from "@/repositories/locals-repository";

async function listActivities(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.status === "RESERVED") {
    throw requestError(402, "PaymentRequired");
  }
  if (ticket.TicketType.isRemote) {
    throw unauthorizedError();
  }

  try {
    const datesObj = await activitiesRepository.getActivitiesDates();
    type LocalEvents = {id: number, name: string, events?: Activity[]};
    const locals: LocalEvents[] = await localsRepository.getLocals();

    const datesLocalsObj = datesObj.map(activity => {
      return { ...activity, locals: JSON.parse(JSON.stringify(locals)) };
    });

    for (let i = 0; i < datesLocalsObj.length; i++) {
      const dateObj = datesLocalsObj[i];
      for (let j = 0; j < dateObj.locals.length; j++) {
        const events = await activitiesRepository.getActivitiesByDateAndLocal(dateObj.date, dateObj.locals[j].id);
        dateObj.locals[j].events = events;
      }
    }

    return datesLocalsObj;
  } catch (error) {
    throw requestError(400, "BadRequest");
  }
}

const activitiesService = {
  listActivities
};
  
export default activitiesService;
