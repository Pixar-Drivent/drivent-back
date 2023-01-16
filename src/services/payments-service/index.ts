import { notFoundError, unauthorizedError } from "@/errors";
import paymentRepository from "@/repositories/payment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";

async function verifyTicketAndEnrollment(ticketId: number, userId: number) {
  const ticket = await ticketRepository.findTickeyById(ticketId);

  if (!ticket) {
    throw notFoundError();
  }
  const enrollment = await enrollmentRepository.findById(ticket.enrollmentId);

  if (enrollment.userId !== userId) {
    throw unauthorizedError();
  }
}

async function getPaymentByTicketId(userId: number, ticketId: number) {
  await verifyTicketAndEnrollment(ticketId, userId);

  const payment = await paymentRepository.findPaymentByTicketId(ticketId);

  if (!payment) {
    throw notFoundError();
  }
  return payment;
}

async function generateStripeUrl(userId: number, ticketId: number) {
  //await verifyTicketAndEnrollment(ticketId, userId);

  //generate stripeUrl and save it on the back end;

  const paymentUrl = await paymentRepository.handleNewPayment(userId, ticketId);

  return paymentUrl;
}

async function verifyUserPayment(userId: number) {
  const status = await paymentRepository.verifyPayment(userId);
  return status;
}

export type CardPaymentParams = {
  issuer: string,
  number: number,
  name: string,
  expirationDate: Date,
  cvv: number
}

const paymentService = {
  getPaymentByTicketId,
  generateStripeUrl,
  verifyUserPayment
};

export default paymentService;
