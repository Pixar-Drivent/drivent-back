import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import bookingRepository from "@/repositories/booking-repository";
import roomRepository from "@/repositories/room-repository";
import { notFoundError, requestError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { HotelType } from "@/protocols";

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (ticket.status === "PAID" && !ticket.TicketType.includesHotel) {
    throw requestError(410, "erro 410");
  } 
  
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotels = await hotelRepository.findHotels();
  const response: HotelType[] = [];

  for(let j=0; j< hotels.length; j++) {
    const hotelType: HotelType = {
      id: hotels[j].id,
      name: hotels[j].name,
      image: hotels[j].image,
      type: "",
      vacancy: 0
    };
    const typeArray: string[] = [];

    for(let i=0; i< hotels[j].Rooms.length; i++) {
      if(hotels[j].Rooms[i].capacity === 1 && !typeArray.includes("Single"))
        typeArray.push("Single");
      if(hotels[j].Rooms[i].capacity === 2 && !typeArray.includes("Double"))
        typeArray.push("Double");
      if(hotels[j].Rooms[i].capacity === 3 && !typeArray.includes("Triple"))
        typeArray.push("Triple");

      hotelType.vacancy += await roomVacancy(hotels[j].Rooms[i].id); 
    }

    if(typeArray.length === 1)
      hotelType.type = typeArray[0];
    if(typeArray.length === 2)
      if(typeArray[0] === "Single" || typeArray[1] === "Triple")
        hotelType.type = typeArray[0] + " e " + typeArray[1];
      else hotelType.type = typeArray[1] + " e " + typeArray[0];
    if(typeArray.length === 3)
      hotelType.type = "Single, Double e Triple";
    
    response.push(hotelType);    
  }
  return response;
}

async function roomVacancy(roomId: number) { 
  const room = await roomRepository.findById(roomId);
  const bookings = await bookingRepository.findByRoomId(roomId);

  return (room.capacity - bookings.length);
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
};

export default hotelService;
