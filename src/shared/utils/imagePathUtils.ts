const IMAGE_PATH_ALIASES: Record<string, string> = {
    "pics/Construction_de_la_France.png":
        "pics/Construction_de_la_France_Chronologie.png",
    "pics/chart_elcole.png": "pics/chart_ecole.png",
};

export const resolveImagePath = (
    imagePath: string | null | undefined
): string | null => {
    if (!imagePath) {
        return null;
    }
    return IMAGE_PATH_ALIASES[imagePath] ?? imagePath;
};

export const extractImagePathFromMarkdown = (text: string): string | null => {
    const match = text.match(/!\[[^\]]*\]\(([^)]+)\)/);
    return match?.[1] ?? null;
};

export const getQuestionImagePath = (
    image: string | null | undefined,
    explanation?: string | null
): string | null => {
    return (
        resolveImagePath(image) ??
        resolveImagePath(extractImagePathFromMarkdown(explanation ?? ""))
    );
};
