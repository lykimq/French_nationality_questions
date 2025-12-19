import { StyleSheet } from 'react-native';

// Settings-specific styles that extend or differ from sharedStyles
// Note: For iconContainer, use sharedStyles.iconContainer directly
export const settingsStyles = StyleSheet.create({
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    settingTitle: {
        flex: 1,
        fontSize: 15,
    },
    // Modal styles specific to settings modals (e.g., RatingModal)
    // Note: sharedStyles.modalTitle is more generic (fontSize: 18)
    modalContainer: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        minWidth: 300,
        maxWidth: 350,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

