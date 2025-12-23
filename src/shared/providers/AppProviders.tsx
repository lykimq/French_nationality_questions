import React from 'react';

import { DataProvider } from '../contexts/DataContext';
import { IconProvider } from '../contexts/IconContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TextFormattingProvider } from '../contexts/TextFormattingContext';
import { CivicExamProvider } from '../../test_civic/contexts/CivicExamContext';

interface AppProvidersProps {
    children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
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

export default AppProviders;

