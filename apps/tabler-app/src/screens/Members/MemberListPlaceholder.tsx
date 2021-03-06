import React from 'react';
import { Surface } from 'react-native-paper';
import { MemberListItemPlaceholder } from '../../components/Placeholder/MemberListItemPlaceholder';

export const MemberListPlaceholder = ({ count = 10 }) => (
    <Surface>
        <MemberListItemPlaceholder icon={48 + 16} padding={16} width={200} />

        {Array.apply(null, { length: count } as [])
            .map(Number.call, Number)
            .map((i: any) => (<MemberListItemPlaceholder width={200} key={i.toString()} />))}
    </Surface>
);
