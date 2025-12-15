import React from 'react';

import { LanguageProvider } from '../contexts/LanguageContext';
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
    <LanguageProvider>
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
    </LanguageProvider>
);

export default AppProviders;

