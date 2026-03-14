import React, { useEffect } from 'react';

import { DataProvider } from '../contexts/DataContext';
import { IconProvider } from '../contexts/IconContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TextFormattingProvider } from '../contexts/TextFormattingContext';
import { CivicExamProvider } from '../../test_civic/contexts/CivicExamContext';
import { startCacheCleanup, stopCacheCleanup } from '../services/dataService';

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
                            {children}
                        </CivicExamProvider>
                    </TextFormattingProvider>
                </ThemeProvider>
            </IconProvider>
        </DataProvider>
    );
};

export default AppProviders;

// Start cache cleanup when providers mount and stop when the module is unloaded.
startCacheCleanup();
if (typeof module !== 'undefined') {
    const hotModule = module as { hot?: { dispose: (cb: () => void) => void } };
    hotModule.hot?.dispose(() => {
        stopCacheCleanup();
    });
}

