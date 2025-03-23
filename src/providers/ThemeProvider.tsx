import { useState } from "react";
import {
  MantineProvider,
  ColorSchemeProvider,
  type ColorScheme,
  type MantineThemeOverride,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");

  const theme: MantineThemeOverride = {
    primaryColor: "indigo",
    fontFamily: "Inter, sans-serif",
    colors: {
      // Modern color palette
      indigo: [
        "#E6E6FF", // 0
        "#C7C7FF", // 1
        "#A8A8FF", // 2
        "#8989FF", // 3
        "#6A6AFF", // 4
        "#4B4BFF", // 5
        "#3C3CFF", // 6
        "#2D2DFF", // 7
        "#1E1EFF", // 8
        "#0F0FFF", // 9
      ],
      // Accent colors
      teal: [
        "#E6FFFA",
        "#B2F5EA",
        "#81E6D9",
        "#4FD1C5",
        "#38B2AC",
        "#319795",
        "#2C7A7B",
        "#285E61",
        "#234E52",
        "#1D4044",
      ],
      // Neutral colors
      gray: [
        "#F7FAFC",
        "#EDF2F7",
        "#E2E8F0",
        "#CBD5E0",
        "#A0AEC0",
        "#718096",
        "#4A5568",
        "#2D3748",
        "#1A202C",
        "#171923",
      ],
    },
    components: {
      Button: {
        styles: (theme: MantineThemeOverride) => ({
          root: {
            borderRadius: theme.radius?.md,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows?.md,
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors?.indigo?.[5]
                  : theme.colors?.indigo?.[4],
              color: theme.white,
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
        }),
      },
      ActionIcon: {
        styles: (theme: MantineThemeOverride) => ({
          root: {
            borderRadius: theme.radius?.md,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows?.md,
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors?.indigo?.[7]
                  : theme.colors?.indigo?.[6],
              color: theme.white,
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
        }),
      },
      Card: {
        styles: (theme: MantineThemeOverride) => ({
          root: {
            borderRadius: theme.radius?.lg,
            boxShadow: theme.shadows?.sm,
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: theme.shadows?.md,
            },
          },
        }),
      },
      Menu: {
        styles: (theme: MantineThemeOverride) => ({
          dropdown: {
            borderRadius: theme.radius?.md,
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors?.dark?.[7]
                : theme.white,
            border: `1px solid ${
              theme.colorScheme === "dark"
                ? theme.colors?.dark?.[5]
                : theme.colors?.gray?.[3]
            }`,
            boxShadow: theme.shadows?.md,
          },
          item: {
            borderRadius: theme.radius?.sm,
            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors?.dark?.[6]
                  : theme.colors?.gray?.[0],
            },
          },
        }),
      },
      Input: {
        styles: (theme: MantineThemeOverride) => ({
          input: {
            borderRadius: theme.radius?.md,
            "&:focus": {
              borderColor: theme.colors?.indigo?.[6],
              boxShadow: `0 0 0 2px ${theme.colors?.indigo?.[0]}`,
            },
          },
        }),
      },
      Select: {
        styles: (theme: MantineThemeOverride) => ({
          input: {
            borderRadius: theme.radius?.md,
            "&:focus": {
              borderColor: theme.colors?.indigo?.[6],
              boxShadow: `0 0 0 2px ${theme.colors?.indigo?.[0]}`,
            },
          },
        }),
      },
      Table: {
        styles: (theme: MantineThemeOverride) => ({
          root: {
            borderRadius: theme.radius?.md,
            overflow: "hidden",
            "& th": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors?.dark?.[7]
                  : theme.colors?.gray?.[0],
            },
            "& tr:hover": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors?.dark?.[6]
                  : theme.colors?.gray?.[0],
            },
          },
        }),
      },
      Navbar: {
        styles: (theme: MantineThemeOverride) => ({
          root: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors?.dark?.[8]
                : theme.white,
            borderRight: `1px solid ${
              theme.colorScheme === "dark"
                ? theme.colors?.dark?.[6]
                : theme.colors?.gray?.[3]
            }`,
            "& .mantine-Navbar-section": {
              color: theme.colorScheme === "dark" 
                ? theme.white 
                : theme.colors?.gray?.[9],
            },
            "& .mantine-Navbar-section a": {
              color: theme.colorScheme === "dark" 
                ? theme.white 
                : theme.colors?.gray?.[9],
            },
          },
        }),
      },
      Header: {
        styles: (theme: MantineThemeOverride) => ({
          root: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors?.dark?.[8]
                : theme.white,
            borderBottom: `1px solid ${
              theme.colorScheme === "dark"
                ? theme.colors?.dark?.[6]
                : theme.colors?.gray?.[3]
            }`,
            "& .mantine-Header-section": {
              color: theme.colorScheme === "dark" 
                ? theme.white 
                : theme.colors?.gray?.[9],
            },
            "& .mantine-Header-section a": {
              color: theme.colorScheme === "dark" 
                ? theme.white 
                : theme.colors?.gray?.[9],
            },
          },
        }),
      },
    },
    defaultRadius: "md",
    shadows: {
      xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
  };

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={() =>
        setColorScheme(colorScheme === "light" ? "dark" : "light")
      }
    >
      <MantineProvider theme={theme}>
        <Notifications />
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
