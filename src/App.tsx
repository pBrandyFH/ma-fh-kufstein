import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from "./providers/I18nProvider";
import { QueryProvider } from './providers/QueryProvider';
import { RouterProvider } from "./providers/RouterProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

export default function App() {
  return (
    <MantineProvider>
      <Notifications />
      <AuthProvider>
        <I18nProvider>
          <ThemeProvider>
            <QueryProvider>
              <RouterProvider />
            </QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
