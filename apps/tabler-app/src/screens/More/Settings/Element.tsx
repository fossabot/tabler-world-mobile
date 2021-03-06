import React from 'react';
import { View, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
import { styles } from './Styles';

export const Element = ({ theme, field, text }) => (
    <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
        <Text numberOfLines={1} style={styles.rowLabel}>{field}</Text>
        {typeof (text) === 'string' && <Text selectable={Platform.OS === 'ios'} numberOfLines={1} style={styles.rowValue}>{text}</Text>}
        {typeof (text) !== 'string' && text}
    </View>
);
