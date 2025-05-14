import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Switch,
    ScrollView,
    TouchableOpacity,
    Share,
    Linking,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type SettingItemProps = {
    title: string;
    icon: string;
    iconColor: string;
    isSwitch?: boolean;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
};

const SettingItem: React.FC<SettingItemProps> = ({
    title,
    icon,
    iconColor,
    isSwitch = false,
    value,
    onValueChange,
    onPress,
}) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={isSwitch || !onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
        {isSwitch ? (
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#d1d1d1', true: '#3F51B5' }}
                thumbColor="#fff"
            />
        ) : (
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
    </TouchableOpacity>
);

const SettingsScreen = () => {
    const [showTranslation, setShowTranslation] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const shareApp = async () => {
        try {
            await Share.share({
                message: 'Découvrez cette application de préparation à l\'entretien de naturalisation française!',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const rateApp = () => {
        // This would normally open the app store but for now we'll just show a link
        alert('Cette fonctionnalité ouvrira le Play Store/App Store dans la version finale');
    };

    const openPrivacyPolicy = () => {
        // Replace with your actual privacy policy URL
        Linking.openURL('https://example.com/privacy-policy');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Paramètres</Text>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Préférences</Text>
                    <SettingItem
                        title="Afficher les traductions"
                        icon="language"
                        iconColor="#3F51B5"
                        isSwitch
                        value={showTranslation}
                        onValueChange={setShowTranslation}
                    />
                    <SettingItem
                        title="Mode sombre"
                        icon="moon"
                        iconColor="#5C6BC0"
                        isSwitch
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>À propos</Text>
                    <SettingItem
                        title="Partager l'application"
                        icon="share-social"
                        iconColor="#FF9800"
                        onPress={shareApp}
                    />
                    <SettingItem
                        title="Évaluer l'application"
                        icon="star"
                        iconColor="#FFC107"
                        onPress={rateApp}
                    />
                    <SettingItem
                        title="Politique de confidentialité"
                        icon="shield-checkmark"
                        iconColor="#4CAF50"
                        onPress={openPrivacyPolicy}
                    />
                    <SettingItem
                        title="Version de l'application"
                        icon="information-circle"
                        iconColor="#9C27B0"
                        onPress={() => { }}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    safeArea: {
        backgroundColor: '#3F51B5',
    },
    header: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#3F51B5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 5,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingTitle: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
});

export default SettingsScreen;