import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    safeArea: {
        backgroundColor: '#3F51B5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#3F51B5',
    },
    backButton: {
        marginRight: 16,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    count: {
        fontSize: 14,
        color: '#E8EAF6',
        marginTop: 2,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    languageLabel: {
        color: '#fff',
        marginHorizontal: 5,
        fontWeight: '600',
        fontSize: 12,
    },
});

export const listViewStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
});

export const slideViewStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    slideContent: {
        flex: 1,
        paddingHorizontal: 20,
        position: 'relative',
    },
    navigationIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    navButton: {
        padding: 10,
    },
    pageIndicator: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    middleNavigation: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        zIndex: 1,
        transform: [{ translateY: -20 }],
    },
    middleNavButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    middleNavButtonDisabled: {
        opacity: 0.5,
    },
});