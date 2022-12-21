import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
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

  hotels.map( (hotel) => {
    const hotelType: HotelType = {
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      type: "",
      vacancy: 0
    };
    const typeArray: string[] = [];

    hotel.Rooms.map( (room) => {
      if(room.capacity === 1 && !typeArray.includes("Single"))
        typeArray.push("Single");
      if(room.capacity === 2 && !typeArray.includes("Double"))
        typeArray.push("Double");
      if(room.capacity === 3 && !typeArray.includes("Triple"))
        typeArray.push("Triple");
    });

    if(typeArray.length === 1)
      hotelType.type = typeArray[0];
    if(typeArray.length === 2)
      if(typeArray[0] === "Single" || typeArray[1] === "Triple")
        hotelType.type = typeArray[0] + " e " + typeArray[1];
      else hotelType.type = typeArray[1] + " e " + typeArray[0];
    if(typeArray.length === 3)
      hotelType.type = "Single, Double e Triple";
    
    response.push(hotelType);    
  });
  return response;
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
