import { AuthenticatedRequest } from "@/middlewares";
import paymentService from "@/services/payments-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketId = Number(req.query.ticketId);
    const { userId } = req;

    if (!ticketId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    const payment = await paymentService.getPaymentByTicketId(userId, ticketId);

    if (!payment) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function paymentProcess(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { ticketId } = req.body;

    if (!userId || !ticketId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    const paymentUrl = await paymentService.generateStripeUrl(userId, ticketId);

    return res.status(httpStatus.OK).send({ url: paymentUrl });
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function paymentVerification(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;

    if (!userId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    
    const status = await paymentService.verifyUserPayment(userId);
    return res.status(httpStatus.OK).send({ paid: status });
  } catch(error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
