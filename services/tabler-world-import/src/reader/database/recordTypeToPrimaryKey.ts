import { reverse } from 'lodash';
import { RecordType } from '../../shared/RecordType';

const associationPK = (r: any) => r.subdomain as string;
const clubPK = (r: any) => `${r.subdomain.replace(/[^a-z]/ig, '')}_${r.subdomain.replace(/[^0-9]/ig, '')}`;
const areaPK = (r: any) => reverse(r.subdomain.split('-')).join('_');
const memberPK = (r: any) => r.id;
const familyPK = (r: any) => r.subdomain;
const groupPK = (_r: any) => 'rti';

const mapping = {
    [RecordType.member]: memberPK,
    [RecordType.association]: associationPK,
    [RecordType.area]: areaPK,
    [RecordType.club]: clubPK,
    [RecordType.family]: familyPK,
    [RecordType.group]: groupPK,
};

export function recordTypeToPrimaryKey(t: RecordType): (p: any) => number | string {
    return mapping[t];
}
