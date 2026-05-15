type CallableErrorShape = {
    code?: string;
    message?: string;
    details?: unknown;
};

export const formatCallableError = (error: unknown): string => {
    if (!error || typeof error !== "object") {
        return String(error);
    }

    const callable = error as CallableErrorShape;
    const parts: string[] = [];

    if (callable.code) {
        parts.push(`code=${callable.code}`);
    }
    if (callable.message) {
        parts.push(callable.message);
    }
    if (callable.details) {
        parts.push(`details=${JSON.stringify(callable.details)}`);
    }

    return parts.length > 0 ? parts.join(" | ") : String(error);
};
