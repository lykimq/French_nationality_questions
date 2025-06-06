import { StyleSheet } from 'react-native';

// Shared style patterns to reduce duplication across components
export const sharedStyles = StyleSheet.create({
    // Common card styles
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },

    smallCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    // Common icon container styles
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },

    largeIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },

    // Common modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    closeButton: {
        padding: 4,
    },

    // Common container styles
    container: {
        flex: 1,
    },

    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Common text styles
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },

    subtitle: {
        fontSize: 14,
        marginBottom: 8,
    },

    // Common button styles
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },

    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
    },

    // Common layout styles
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    spaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // Common shadow styles
    lightShadow: {
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },

    mediumShadow: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    heavyShadow: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },

    // Common header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },

    backButton: {
        padding: 8,
    },

    // Common section styles
    section: {
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 5,
        overflow: 'hidden',
    },

    // Common progress styles
    progressBar: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        overflow: 'hidden',
    },

    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Common language selector styles
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    languageLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 8,
    },

    // Common option styles for selectors
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    optionContent: {
        flex: 1,
    },

    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },

    optionDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
});

// Common style combinations
export const cardWithShadow = [sharedStyles.card, sharedStyles.mediumShadow];
export const smallCardWithShadow = [sharedStyles.smallCard, sharedStyles.lightShadow];
export const iconContainerStyle = sharedStyles.iconContainer;
export const largeIconContainerStyle = sharedStyles.largeIconContainer;