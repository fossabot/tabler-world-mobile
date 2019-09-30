import { Ionicons } from '@expo/vector-icons';
import emojiRegexCreator from 'emoji-regex';
import React from 'react';
import { Clipboard, Platform, StyleSheet, View } from 'react-native';
import { Bubble, Composer, LoadEarlier, Message, Send } from 'react-native-gifted-chat';
import { Theme, withTheme } from 'react-native-paper';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';
import { FixedChat } from './FixedChat';
import { IChatMessage } from './IChatMessage';

const logger = new Logger(Categories.Screens.Conversation);

const emojiRegex = emojiRegexCreator();
function isPureEmojiString(text) {
    if (!text || !text.trim()) {
        return false;
    }

    return text.replace(emojiRegex, '').trim() === '';
}

type Props = {
    theme: Theme,

    extraData?: any,
    isLoadingEarlier: boolean,
    loadEarlier: boolean,
    onLoadEarlier: () => void,

    messages?: IChatMessage[],
    sendMessage: (messages: IChatMessage[]) => void,
    subscribe?: () => void,
};

class ChatBase extends React.Component<Props> {
    _renderLoadEarlier = (props: any) => {
        logger.log('loadEarlier', this.props.loadEarlier, 'isLoadingEarlier', this.props.isLoadingEarlier);

        return (
            <LoadEarlier {...props} />
        );
    }

    _renderBubble = (props: any) => {
        return (
            <Bubble
                // @ts-ignore
                wrapperStyle={{
                    left: {
                        backgroundColor: this.props.theme.colors.background,
                    },

                    right: {
                        backgroundColor: this.props.theme.colors.accent,
                    },
                }}

                timeTextStyle={{
                    left: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                    },
                    right: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                    },
                }}

                {...props}

                isCustomViewBottom={true}
                renderCustomView={this._renderCustomView}
            />
        );
    }

    /**
     * Make pure emojis bigger
     */
    _renderMessage = (props) => {
        const { currentMessage: { text: currText } } = props;
        let messageTextStyle = {};

        // Make "pure emoji" messages much bigger than plain text.
        if (isPureEmojiString(currText)) {
            messageTextStyle = {
                fontSize: 48,
                lineHeight: Platform.OS === 'android' ? 60 : 54,
                fontFamily: undefined,
            };
        }

        return (
            <Message
                {...props}
                textProps={{
                    style: {
                        fontFamily: this.props.theme.fonts.regular,
                        color: this.props.theme.colors.text,
                        ...messageTextStyle,
                    },
                }}
            />
        );
    }

    _renderSend = (props) => {
        return (
            <Send {...props}>
                <Ionicons
                    style={styles.sendIcon}
                    size={20}
                    name="md-send"
                    color={this.props.theme.colors.accent}
                />
            </Send>
        );
    }

    _renderComposer = (props) => {
        return (
            <Composer
                {...props}
                textInputStyle={{
                    fontFamily: this.props.theme.fonts.regular,
                    marginVertical: 10,
                    lineHeight: 20,
                }}
            />
            // </View>
        );
    }

    _onLongPress = (context: any, currentMessage: IChatMessage) => {
        if (currentMessage && currentMessage.text) {
            const options = ['Copy Text'];

            if (currentMessage.failedSend) {
                options.push('Retry');
            }

            options.push('Cancel');

            const cancelButtonIndex = options.length - 1;
            context.actionSheet().showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex,
                },
                (buttonIndex) => {
                    switch (buttonIndex) {
                        case 0:
                            Clipboard.setString(currentMessage.text);
                            break;
                        case 1:
                            if (options.length === 3) {
                                this.props.sendMessage([currentMessage]);
                            }
                            break;

                        default:
                            break;
                    }
                },
            );
        }
    }

    _renderCustomView = (props) => {
        const { currentMessage } = props;

        if (currentMessage.failedSend) {
            return (
                <Ionicons
                    style={{
                        marginLeft: 10,
                        marginRight: 10,
                        marginBottom: 5,
                    }}

                    size={24}
                    name="md-alert"
                    color="red"
                />
            );
        }

        return null;
    }

    _renderTicks = (currentMessage: IChatMessage) => {
        if (
            currentMessage
            && (currentMessage.sent || currentMessage.received || currentMessage.pending)
            && !currentMessage.failedSend
        ) {
            return (
                <View style={styles.tickView}>
                    {!!currentMessage.sent && (
                        <Ionicons name="md-checkmark" color={this.props.theme.colors.disabled} size={10} />
                    )}
                    {!!currentMessage.received && (
                        <Ionicons name="md-checkmark" color={this.props.theme.colors.disabled} size={10} />
                    )}
                    {!!currentMessage.pending && (
                        <Ionicons name="md-time" color={this.props.theme.colors.disabled} size={10} />
                    )}
                </View>
            );
        }
        return null;
    }

    componentWillMount() {
        if (this.props.subscribe) {
            this.props.subscribe();
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: this.props.theme.colors.background, flex: 1 }}>
                <View
                    style={[styles.footer, { backgroundColor: this.props.theme.colors.primary }]}
                />

                <FixedChat
                    user={{ _id: 10430 }}
                    // bottomOffset={BOTTOM_HEIGHT}

                    // style={{ height: Dimensions.get('window').height - TOTAL_HEADER_HEIGHT - BOTTOM_HEIGHT }}
                    isAnimated={true}
                    locale={I18N.id}

                    onLongPress={this._onLongPress}

                    dateFormat={'ddd D. MMM'}
                    timeFormat={'hh:HH'}

                    extraData={this.props.extraData}
                    renderAvatar={null}
                    onSend={this.props.sendMessage}
                    renderMessage={this._renderMessage}

                    showUserAvatar={false}
                    showAvatarForEveryMessage={false}

                    loadEarlier={this.props.loadEarlier}
                    isLoadingEarlier={this.props.isLoadingEarlier}
                    onLoadEarlier={this.props.onLoadEarlier}
                    renderLoadEarlier={this._renderLoadEarlier}

                    messages={this.props.messages || []}

                    renderBubble={this._renderBubble}
                    maxInputLength={10 * 1024}

                    // renderComposer={this._renderComposer}
                    renderSend={this._renderSend}
                    renderComposer={this._renderComposer}

                    renderTicks={this._renderTicks}
                // shouldUpdateMessage={() => true}
                />
            </View>

        );
    }
}

const styles = StyleSheet.create({
    sendIcon: {
        marginBottom: 12,
        marginLeft: 10,
        marginRight: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 33,
    },
    tick: {
        fontSize: 10,
    },
    tickView: {
        flexDirection: 'row',
        marginRight: 10,
    },
});

export const Chat = withTheme(ChatBase);
