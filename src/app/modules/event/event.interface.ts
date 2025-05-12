export interface IEvent {
    title: string
    slug: string
    description: string
    dateTime: string
    venue: string
    bannerImage?: string
    type: "PUBLIC" | "PRIVATE"
    isPaid: boolean
    fee: number
    isDeleted: boolean
    organizerId: string

}