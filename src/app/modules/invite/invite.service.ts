import { participantService } from './../participant/participant.service';
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { EmailHelper } from "../../helpers/emailHelper";
import config from "../../config";

const sentInvite = async (payload: {
  inviteReceiverId: string;
  eventId: string;
  inviteSenderId: string;
}) => {
  const { inviteReceiverId, eventId, inviteSenderId } = payload;

  
  const inviteReceiver = await prisma.user.findUnique({
    where: { id: inviteReceiverId },
  });

  if (
    !inviteReceiver ||
    inviteReceiver.isDeleted ||
    inviteReceiver.isBlocked
  ) {
    throw new AppError(
      status.NOT_FOUND,
      "Invite receiver does not exist or is inactive"
    );
  }


  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event does not exist");
  }


  const sender = await prisma.user.findUnique({
    where: { id: inviteSenderId },
  });

  if (!sender || sender.isDeleted || sender.isBlocked) {
    throw new AppError(
      status.NOT_FOUND,
      "Inviter does not exist or is inactive"
    );
  }

  const existingInvite = await prisma.invite.findFirst({
    where: {
      eventId,
      inviteReceiverId,
      isDeleted: false,
    },
  });

  if (existingInvite) {
    throw new AppError(
      status.BAD_REQUEST,
      "User has already been invited to this event"
    );
  }


  const invite = await prisma.invite.create({
    data: payload
  });



  const html = await EmailHelper.createEmailContent(
    {
      name: inviteReceiver.name,
      senderName: sender.name,
      eventTitle: event.title,
      eventLink: `${config.client_site_url}/events/${event.id}`,
    },
    "invite" 
  );


  await EmailHelper.sendEmail(
    inviteReceiver.email,
    html,
    `You're Invited to "${event.title}"`
  );

  return invite;
};

const getMyAllSendInvites = async (userId: string) => {
    const invites = await prisma.invite.findMany({
        where: {
        inviteSenderId: userId,
        isDeleted: false,
        },
        include: {
          event: {
            select: {
              id: true,
              slug: true,
              title: true,
              bannerImage: true,
              fee: true,
              isPaid: true,
              type: true,
              venue: true
            }
          },
          invitee:{
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              profileImage: true
            }
          }
          },
    });
    
    return invites;
}

const getMyAllReceivedInvites = async (userId: string) => {
    const invites = await prisma.invite.findMany({
        where: {
        inviteReceiverId: userId,
        isDeleted: false,
        },
        include: {
          event: {
            select: {
              id: true,
              slug: true,
              title: true,
              bannerImage: true,
              fee: true,
              isPaid: true,
              type: true,
              venue: true
            }
          },
          inviter:{
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              profileImage: true
            }
          },
          },
    });
    
    return invites;
}

const acceptInvite = async (inviteId: string) => {
    const result = await prisma.$transaction(async (tx) => {

        const invite = await tx.invite.findUnique({
            where: { id: inviteId },
            include: {
              event: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  bannerImage: true,
                  fee: true,
                  isPaid: true,
                  type: true,
                  venue: true
                }
              },
              invitee:{
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true,
                  profileImage: true
                }
              },
              inviter:{
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true,
                  profileImage: true
                }
              },
              },
        });
        if(!invite) {
            throw new AppError(status.NOT_FOUND, "Invite not found");
        }
        // console.log(invite.inviteReceiverId, invite.eventId);
        const dataToCreateParticipant = {
            eventId: invite.eventId,
            userId: invite.inviteReceiverId,
            hasPaid: true,
          };


      const participant =  await participantService.createParticipant(dataToCreateParticipant);
      // console.log(participant);
      
     if(participant){
        await tx.invite.update({
            where: { id: inviteId },
            data: { status: "ACCEPTED" },
          })
          await tx.participant.update({
            where: { id: participant.id },
            data: { status: "APPROVED" },
          })
     }

    });

    return result;
};

const getAllInvite = async() => {
  const result = prisma.invite.findMany({
    where:{
      isDeleted: false
    },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          bannerImage: true,
          fee: true,
          isPaid: true,
          type: true,
          venue: true
        }
      },
      invitee:{
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          profileImage: true
        }
      },
      inviter:{
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          profileImage: true
        }
      },
      },
  })
  return result
}



export const InviteService = {
  sentInvite,
  getMyAllSendInvites,
  getMyAllReceivedInvites,
  acceptInvite,
  getAllInvite
};
