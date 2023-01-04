import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import activitiesService from "@/services/activities-service";
import httpStatus from "http-status";

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const activities = await activitiesService.listActivities(userId);
    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.statusText === "PaymentRequired") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    } 
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
