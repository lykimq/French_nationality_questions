// Core fundamental types - foundational types used across the application
export type Language = 'fr' | 'vi';

// Multi-language text support - functional approach with readonly properties
export type MultiLangText = Readonly<{
    readonly fr: string;
    readonly vi: string;
}>;

// Utility functions for MultiLangText handling
export const getTextFromMultiLang = (text: string | MultiLangText, language: Language = 'fr'): string => {
    if (typeof text === 'string') {
        return text;
    }
    return text[language];
};

export const getTextPreview = (text: string | MultiLangText, maxLength: number = 50): string => {
    const textString = typeof text === 'string' ? text : text.fr;
    return textString.length > maxLength ? textString.substring(0, maxLength) + '...' : textString;
};

export const isMultiLangText = (text: string | MultiLangText): text is MultiLangText => {
    return typeof text === 'object' && text !== null && 'fr' in text && 'vi' in text;
};

// Base entity structure - foundational pattern for all entities
export interface BaseEntity {
    readonly id: string;
}

// Multilingual entity - adds language support to base entity
export interface MultilingualEntity extends BaseEntity {
    readonly title: string;
    readonly title_vi?: string;
    readonly description?: string;
    readonly description_vi?: string;
}

// Visual entity - adds visual representation
export interface VisualEntity {
    readonly icon?: string;
    readonly image?: string | null;
}

// Categorizable entity - for items that belong to categories
export interface CategorizableEntity {
    readonly categoryId?: string;
    readonly categoryTitle?: string;
}

// Timestamped entity - for entities with time tracking
export interface TimestampedEntity {
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly lastAccessed?: Date;
}