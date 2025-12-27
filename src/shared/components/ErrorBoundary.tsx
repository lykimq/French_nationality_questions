import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FormattedText from './FormattedText';
import { useTheme } from '../contexts/ThemeContext';
import { createLogger } from '../utils/logger';
import { Sentry } from '../../config/sentryConfig';

const logger = createLogger('ErrorBoundary');

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('ErrorBoundary caught an error:', error, errorInfo);
        
        Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack,
                },
            },
            tags: {
                errorBoundary: true,
            },
        });
        
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
        }

        return this.props.children;
    }
}

interface ErrorFallbackProps {
    error: Error | null;
    onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
                <FormattedText style={[styles.title, { color: theme.colors.error }]}>
                    Une erreur s'est produite
                </FormattedText>
                <FormattedText style={[styles.message, { color: theme.colors.text }]}>
                    L'application a rencontré une erreur inattendue. Veuillez réessayer.
                </FormattedText>
                {__DEV__ && error && (
                    <FormattedText style={[styles.errorDetails, { color: theme.colors.textMuted }]}>
                        {error.toString()}
                    </FormattedText>
                )}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={onReset}
                >
                    <FormattedText style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                        Réessayer
                    </FormattedText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        padding: 24,
        borderRadius: 12,
        maxWidth: 400,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    errorDetails: {
        fontSize: 12,
        marginBottom: 20,
        fontFamily: 'monospace',
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export const ErrorBoundary: React.FC<Props> = (props) => <ErrorBoundaryClass {...props} />;

export default ErrorBoundary;

