/**
 * Extracts a numeric ID from various input types.
 * Handles both direct numbers and strings containing numeric IDs.
 * 
 * @param rawId - The raw ID value (number, string, or other)
 * @returns The extracted numeric ID, or undefined if extraction fails
 * 
 * @example
 * extractNumericId(123) // 123
 * extractNumericId("Q123") // 123
 * extractNumericId("abc") // undefined
 */
export const extractNumericId = (rawId: unknown): number | undefined => {
    if (typeof rawId === 'number') {
        return Number.isFinite(rawId) ? rawId : undefined;
    }
    if (typeof rawId === 'string') {
        const match = rawId.match(/(\d+)/);
        if (match) {
            const value = Number(match[1]);
            return Number.isFinite(value) ? value : undefined;
        }
    }
    return undefined;
};

/**
 * Validates that an ID is a positive finite number.
 * 
 * @param id - The ID to validate
 * @returns True if the ID is valid
 */
export const isValidId = (id: unknown): id is number => {
    return typeof id === 'number' && Number.isFinite(id) && id > 0;
};

/**
 * Extracts and validates a numeric ID.
 * 
 * @param rawId - The raw ID value
 * @returns The validated numeric ID, or undefined if invalid
 */
export const extractValidId = (rawId: unknown): number | undefined => {
    const id = extractNumericId(rawId);
    return id !== undefined && isValidId(id) ? id : undefined;
};

