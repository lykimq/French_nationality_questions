// Core fundamental types - foundational types used across the application

// Base entity structure - foundational pattern for all entities
export interface BaseEntity {
    readonly id: string;
}

// Entity with title and description
export interface TitledEntity extends BaseEntity {
    readonly title: string;
    readonly description?: string;
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