import { DarkTheme, Theme } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT, ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR } from './colors';
import { light } from './light';

export const dark: Theme & { colors: { notification } } = {
    ...DarkTheme,
    roundness: 2,
    fonts: light.fonts,
    colors: {
        ...DarkTheme.colors,
        backdrop: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR,

        // backdrop: '#3a3a3a',
        // surface: Colors.white,
        // background: "#eceef2",
        // // background: "green",
        // surface: "red",

        primary: DarkTheme.colors.background,
        accent: ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT,

        notification: 'red',
    },
};
