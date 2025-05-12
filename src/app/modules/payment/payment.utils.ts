
export const generateTransactionId = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${"NEXT"}${timestamp}${randomString}`;
};