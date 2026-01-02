import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import AppProviders from '../shared/providers/AppProviders';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AppProviders>{children}</AppProviders>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };

