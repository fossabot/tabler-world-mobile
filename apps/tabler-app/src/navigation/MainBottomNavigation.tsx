import React from 'react';
import { Text } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { defaultNavigationOptions } from '../components/ReloadNavigationOptions';
import { I18N } from '../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT, ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR } from '../theme/colors';
import { MainNavRoutes } from './MainNavRoutes';
import { MainRoutes } from './MainRoutes';

export const MainBottomNavigation = createMaterialBottomTabNavigator(
    MainNavRoutes,
    {
        initialRouteName: MainRoutes.Members,
        shifting: true,

        drawBehind: false,
        visible: true,
        keyboardHidesNavigationBar: false,

        renderLabel: ({ color, route }) => {
            return (
                <Text
                    style={{ ...I18N.NavigationStyle, color }}
                >
                    {MainNavRoutes[route.routeName].navigationOptions.tabBarLabel()}
                </Text>
            );
        },

        activeColor: ___DONT_USE_ME_DIRECTLY___COLOR_ACCENT,

        barStyle: {
            backgroundColor: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR,
            paddingBottom: 0,
        },

        // tslint:disable-next-line: object-shorthand-properties-first
        defaultNavigationOptions,
    },
);
