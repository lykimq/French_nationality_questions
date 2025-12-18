import React from 'react';

import { DataProvider } from '../contexts/DataContext';
import { IconProvider } from '../contexts/IconContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TextFormattingProvider } from '../contexts/TextFormattingContext';
import { DisplaySettingsProvider } from '../../test/contexts/DisplaySettingsContext';
import { TestProvider } from '../../test/contexts/TestContext';
import { CivicExamProvider } from '../../test_civic/contexts/CivicExamContext';

interface AppProvidersProps {
    children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
    <DataProvider>
        <IconProvider>
            <ThemeProvider>
                <TextFormattingProvider>
                    <DisplaySettingsProvider>
                        <TestProvider>
                            <CivicExamProvider>
                                {children}
                            </CivicExamProvider>
                        </TestProvider>
                    </DisplaySettingsProvider>
                </TextFormattingProvider>
            </ThemeProvider>
        </IconProvider>
    </DataProvider>
);

export default AppProviders;

