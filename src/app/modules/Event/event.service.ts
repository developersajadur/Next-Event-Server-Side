import { PrismaClient } from "@prisma/client";
import { IEvent } from "./event.interface";

const prisma = new PrismaClient();


const createEvent = async (payload: IEvent) => {
    const result = await prisma.event.create({
        data: payload

    })
    return result
}
const getAllEvents = async () => {

}


export const eventService = {
    createEvent,
};