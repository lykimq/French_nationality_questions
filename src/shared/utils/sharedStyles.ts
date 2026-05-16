import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    container: {
        flex: 1,
    },

    centeredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },

    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    spaceBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    mediumShadow: {
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
    },
    headerTopAccent: {
        height: 3,
        flexDirection: "row",
        width: "100%",
    },
    accentBlue: { flex: 1, backgroundColor: "#002395" },
    accentWhite: { flex: 1, backgroundColor: "#FFFFFF" },
    accentRed: { flex: 1, backgroundColor: "#ED2939" },

    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
});

export const getCardContainerStyle = (theme: {
    colors: { card: string; divider: string };
}) => ({
    backgroundColor: theme.colors.card,
    borderBottomColor: theme.colors.divider,
});
