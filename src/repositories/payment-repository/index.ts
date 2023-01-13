import { prisma } from "@/config";
import { Payment } from "@prisma/client";

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function createPayment(ticketId: number, params: PaymentParams) {
  const [createPaymentInfo] = await prisma.$transaction([prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "PAID",
    },
  }), prisma.payment.create({
    data: {
      ticketId,
      ...params,
    },
  })]);

  return createPaymentInfo;
}
export type PaymentParams = Omit<Payment, "id" | "createdAt" | "updatedAt">;

const paymentRepository = {
  findPaymentByTicketId,
  createPayment,
};

export default paymentRepository;
