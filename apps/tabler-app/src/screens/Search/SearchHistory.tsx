import { take } from 'lodash';
import React from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { Divider, List, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { I18N } from '../../i18n/translation';
import { IAppState } from '../../model/IAppState';

type State = {
};

type OwnProps = {
    theme: Theme,
    limit?: number,
    applyFilter: (text: string) => void,

    contentContainerStyle?: any,
};

type StateProps = {
    history: string[],
};

type DispatchPros = {
};

type Props = OwnProps & StateProps & DispatchPros;

class SearchHistoryBase extends React.Component<Props, State> {
    _renderSearchHistoryItem = (c: ListRenderItemInfo<string>) => (
        <React.Fragment>
            <List.Item
                style={{ backgroundColor: this.props.theme.colors.surface }}
                // workarround
                title={<Text style={{ fontSize: 14 }}>{c.item}</Text>}
                onPress={() => this.props.applyFilter(c.item)} />
            <Divider />
        </React.Fragment>
    )

    _keyExtractor = (item: string) => item;

    render() {
        if (this.props.history == null || this.props.history.length === 0) return null;

        return (
            <List.Section style={{ flex: 1, flexBasis: 1 }} title={I18N.Screen_Search.history}>
                <Divider />
                <FlatList
                    data={take(this.props.history, this.props.limit || 20)}
                    renderItem={this._renderSearchHistoryItem}
                    keyExtractor={this._keyExtractor}
                    bounces={true}
                    style={{ flex: 1 }}
                    contentContainerStyle={this.props.contentContainerStyle}
                />
            </List.Section>
        );
    }
}

export const SearchHistory = connect(
    (state: IAppState) => ({
        history: state.searchHistory.members,
    }), {
})(
    withTheme(SearchHistoryBase),
);
