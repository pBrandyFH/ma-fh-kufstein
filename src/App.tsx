import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from "./providers/I18nProvider";
import { RouterProvider } from "./providers/RouterProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

export default function App() {
  return (
    <MantineProvider>
      <Notifications />
      <AuthProvider>
        <I18nProvider>
          <ThemeProvider>
              <RouterProvider />
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
