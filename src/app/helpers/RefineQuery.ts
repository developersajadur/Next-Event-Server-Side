/* eslint-disable @typescript-eslint/no-explicit-any */
const RefineQuery = (obj: Record<string, any>, keys: string[]) => {
    const query: Record<string, any> = {};
    keys?.forEach(item => {
        if (Object.prototype.hasOwnProperty.call(obj, item)) {
            query[item] = obj[item];
        }
    });
    return query;
};

export default RefineQuery;  