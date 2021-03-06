import React from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import { Appbar, Divider, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { HeaderStyles, TOTAL_HEADER_HEIGHT } from '../theme/dimensions';

export type Props = {
    title?: React.ReactNode,
    subtitle?: React.ReactNode,
    backgroundColor?: string,
    showBack?: React.ReactElement | boolean,
    showAppBar?: boolean,
    content?: any,
    style?: any,
    showLine?: boolean,
};

class HeaderBase extends React.Component<Props & NavigationInjectedProps & { theme: Theme }> {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        if (typeof (this.props.showBack) === 'boolean') {
            (async () => this.props.navigation.goBack(null))();
        }

        return true;
    }

    render() {
        return (
            <React.Fragment>
                <View
                    style={{
                        ...HeaderStyles.header,
                        backgroundColor: this.props.backgroundColor
                            ? this.props.backgroundColor
                            : this.props.theme.colors.primary,
                    }}
                />

                {this.props.showAppBar == null || this.props.showAppBar && (
                    <Appbar
                        style={[this.props.style, {
                            elevation: 0,
                            backgroundColor: this.props.backgroundColor ?
                                this.props.backgroundColor : this.props.theme.colors.primary,
                        }]}
                    >
                        {/* {this.props.showBack && <BackButtonWithText title="Go Back" theme={this.props.theme} onPress={() => this.props.navigation.goBack(null)} />} */}
                        {this.props.showBack &&
                            typeof (this.props.showBack) === 'boolean'
                            ? <Appbar.BackAction color={this.props.theme.dark ? 'white' : 'black'} onPress={() => this.props.navigation.goBack(null)} />
                            : this.props.showBack
                        }
                        {this.props.content != null
                            ? this.props.content
                            : this.props.title
                                ? (
                                    <Appbar.Content
                                        titleStyle={{ fontFamily: this.props.theme.fonts.medium }}
                                        title={this.props.title}
                                        subtitle={this.props.subtitle}
                                    />
                                )
                                : null
                        }
                    </Appbar>
                )}

                {(this.props.showLine == null || this.props.showLine) && (
                    <Divider
                        style={{
                            position: 'absolute',
                            top: TOTAL_HEADER_HEIGHT,
                            left: 0,
                            right: 0,
                        }}
                    />
                )}
            </React.Fragment>
        );
    }
}

export const Header = withNavigation(withTheme(HeaderBase));

export const StandardHeader = ({ ...args }) => (
    <Header style={HeaderStyles.topBar} showAppBar={true} {...args} />
);

// tslint:disable-next-line: max-classes-per-file
class StandardStatusBarBase extends React.PureComponent<{ theme: Theme }> {
    render() {
        return (
            <StatusBar
                translucent={true}
                barStyle={this.props.theme.dark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                showHideTransition={'slide'}
                animated={false}
            />
        );
    }
}

export const StandardStatusBar = withTheme(StandardStatusBarBase);
