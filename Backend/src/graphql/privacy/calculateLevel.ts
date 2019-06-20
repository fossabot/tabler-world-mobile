import { FieldNames } from "./FieldNames";
import { FilterContext } from "./FilterContext";
import { FilterLevel } from "./FilterLevel";
import { AnyType } from "./WhiteList";

export function calculateLevel(ctx: FilterContext, tabler: AnyType): FilterLevel {
    if (tabler[FieldNames.Id] === ctx.id) {
        return FilterLevel.SamePerson;
    }

    if (tabler[FieldNames.Association] === ctx.association
        && tabler[FieldNames.Area] === ctx.area
        && tabler[FieldNames.Club] === ctx.club) {
        return FilterLevel.SameClub;
    }

    if (tabler[FieldNames.Association] === ctx.association
        && tabler[FieldNames.Area] === ctx.area) {
        return FilterLevel.SameArea;
    }

    if (tabler[FieldNames.Association] === ctx.association) {
        return FilterLevel.SameAssociation;
    }

    return FilterLevel.Public;
}