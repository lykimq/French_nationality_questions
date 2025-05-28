import { StyleSheet } from 'react-native';

export const historyStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3F51B5',
        flex: 1,
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E8EAF6',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3F51B5',
        borderRadius: 4,
    },
    questionCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    questionText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 16,
        lineHeight: 24,
    },
    explanationLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3F51B5',
        marginBottom: 8,
    },
    explanationText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
        marginBottom: 16,
    },
    showAnswerButton: {
        backgroundColor: '#3F51B5',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#3F51B5',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageContainer: {
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    questionImage: {
        width: '100%',
        height: 200,
    },
});