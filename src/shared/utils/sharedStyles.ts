import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
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

    container: {
        flex: 1,
    },

    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },

    subtitle: {
        fontSize: 14,
        marginBottom: 8,
    },

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

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    spaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

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

    // New Header Styles
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
    },
    headerTopAccent: {
        height: 3,
        flexDirection: 'row',
        width: '100%',
    },
    accentBlue: { flex: 1, backgroundColor: '#002395' }, // French Blue
    accentWhite: { flex: 1, backgroundColor: '#FFFFFF' }, // French White
    accentRed: { flex: 1, backgroundColor: '#ED2939' }, // French Red

    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
        opacity: 0.8,
    },

    // Premium Card Styles
    premiumCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },

    section: {
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 5,
        overflow: 'hidden',
    },

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

    // Mastery Stamps
    stampContainer: {
        position: 'absolute',
        top: 50,
        zIndex: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 4,
        transform: [{ rotate: '-15deg' }],
    },
    stampText: {
        fontSize: 32,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    masteredStamp: {
        borderColor: '#4CAF50',
        right: 40,
        transform: [{ rotate: '15deg' }],
    },
    reviewStamp: {
        borderColor: '#FF5722',
        left: 40,
        transform: [{ rotate: '-15deg' }],
    },

    // Rating Buttons
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        gap: 8,
    },
    ratingButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    ratingButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
});

export const getCardContainerStyle = (theme: { colors: { card: string; divider: string } }) => ({
    backgroundColor: theme.colors.card,
    borderBottomColor: theme.colors.divider,
});