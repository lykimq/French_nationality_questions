import React, { useEffect } from "react";

import { DataProvider } from "../contexts/DataContext";
import { IconProvider } from "../contexts/IconContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TextFormattingProvider } from "../contexts/TextFormattingContext";
import { CivicExamProvider } from "../../test_civic/contexts/CivicExamContext";
import { MasteryProvider } from "../contexts/MasteryContext";
import { startCacheCleanup, stopCacheCleanup } from "../services/dataService";

interface AppProvidersProps {
    children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    useEffect(() => {
        startCacheCleanup();
        return () => {
            stopCacheCleanup();
        };
    }, []);

    return (
        <DataProvider>
            <IconProvider>
                <ThemeProvider>
                    <TextFormattingProvider>
                        <CivicExamProvider>
                            <MasteryProvider>{children}</MasteryProvider>
                        </CivicExamProvider>
                    </TextFormattingProvider>
                </ThemeProvider>
            </IconProvider>
        </DataProvider>
    );
};

export default AppProviders;
