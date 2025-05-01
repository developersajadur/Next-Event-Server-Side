export { };

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: "ADMIN" | "USER";
                isBlocked: boolean;
                isDeleted: boolean;
            };
        }
    }
}