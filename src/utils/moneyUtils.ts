
export const formatAmount = (value: number): string => {
    if (Number.isInteger(value)) {
        return String(value) + ' €';
    }
    return value.toFixed(2) + ' €';
};