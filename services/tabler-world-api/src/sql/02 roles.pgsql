SET ROLE 'tw_read_dev';

------------------------------
-- CLEANUP
------------------------------

drop materialized view if exists structure_groups cascade;
drop view if exists structure_parentgroups cascade;
drop view if exists tabler_roles cascade;

------------------------------
-- Base
------------------------------

-- type is
--  family
--  assoc
--  area
--  club
CREATE MATERIALIZED VIEW structure_groups
as
WITH RECURSIVE groups_objects (type, assoc, id, name, path, object) AS (
  SELECT
    'family' as type
    ,'null' as assoc
    ,data->>'id' as id
    ,data->>'name' as name
    ,ARRAY[data->>'id'] as path
    ,jsonb_array_elements(data->'children') as object
  FROM groups
  where id = 'rti'
  UNION

  SELECT type, assoc, id, name, path, jsonb_array_elements(children)
  FROM (
    SELECT
        -- based on the current node, the child gets a ...
        case
            WHEN object->>'name' = 'Associations' THEN 'assoc'
            when object->>'name' = 'Areas' THEN 'area'
            when object->>'name' = 'Tables' THEN 'club'
            else 'node'
        end as type
        -- we pull the association down to make that unique
        ,case
            WHEN type  = 'assoc' THEN object->>'name'
            else assoc
        end as assoc
        ,object->>'id' as id
        ,object->>'name' as name
        ,array_append(path, object->>'id') as path
        ,object->'children' children
    FROM groups_objects
    WHERE jsonb_array_length(object->'children') > 0
  ) s
)
SELECT type, assoc, id::int as parentId, (object->>'id')::int as id, path::int[], object->>'name' as name
FROM groups_objects
;

create unique index idx_structure_groups_id on
structure_groups (id);

create view structure_parentgroups as
select
    parent.type
    ,parent.assoc
    ,parent.name as parentname
    ,child.id
    ,child.name as groupname
from
    structure_groups child
    ,structure_groups parent
where
        parent.id = child.parentid
    and child.type = 'node'
UNION ALL
select
    'family'
    ,NULL
    ,'Round Table International'
    ,id
    ,name
from
    structure_groups
where
        type = 'family'
    AND name <> 'Associations'
;

------------------------------
-- Functions
------------------------------

CREATE or replace FUNCTION get_role_reference(type text, assoc text, name text) RETURNS text AS $$
DECLARE
    associations_row associations%ROWTYPE;
    areas_row areas%ROWTYPE;
    clubs_row clubs%ROWTYPE;

BEGIN
    if type = 'family' then
        return 'rti';
    end if;

    if type = 'assoc' THEN
        SELECT * INTO associations_row
        from associations
        where data->>'name' = name;

        return associations_row.id;
    end if;

    SELECT * INTO associations_row
    from associations
    where data->>'name' = assoc;

    if type = 'area' THEN
        SELECT * INTO areas_row
        from areas
        where
            data->>'name' = name
        AND id like associations_row.id || '_%';

        return areas_row.id;
    end if;

    if type = 'club' THEN
        SELECT * INTO clubs_row
        from clubs
        where
            data->>'name' = name
        AND id like associations_row.id || '_%';

        return clubs_row.id;
    end if;

    return null;
END;
$$
LANGUAGE plpgsql;

------------------------------
-- tabler_roles
------------------------------

CREATE or replace VIEW tabler_roles
as
select
	tabler.id

    ,cast(t->>'start_date' as date) as start_date
    ,cast(t->>'end_date' as date) as end_date
    ,case when
        cast(t->>'start_date' as date) <= now()
            and (
				    cast(t->>'end_date' as date) is null
			    or  cast(t->>'end_date' as date) >= now()
		    )
            then TRUE
        ELSE
            FALSE
    END as isvalid

    ,cast(t->'combination'->>'function' as integer) as function
    ,rtrim(
        ltrim(
            (
                regexp_matches(
                    t->'combination'->>'short_description',
                    '.*\/\s([\s\w\d\.\-]+)$'
                )
            )[1]
        )
    ) as functionname

    ,structure_parentgroups.id as groupid
    ,structure_parentgroups.groupname as groupname
    ,structure_parentgroups.type as reftype
    ,structure_parentgroups.assoc as assoc
    ,get_role_reference(
       structure_parentgroups.type,
       structure_parentgroups.assoc,
       structure_parentgroups.parentname
     ) as refid
    ,structure_parentgroups.parentname as refname

from
    tabler,
    structure_parentgroups,
    jsonb_array_elements(tabler.data->'rt_global_positions') t

WHERE
    structure_parentgroups.id = cast(t->'combination'->>'group' as integer)
 ;

 ------------------------------
-- Helper view
------------------------------

create materialized view structure_tabler_roles
as
    select * from tabler_roles
    where
        isvalid = TRUE
    and functionname not like 'Placeholder%'
;

create unique index idx_structure_roles_update on
structure_tabler_roles (id, groupid, functionname, start_date, end_date);

create index idx_structure_roles_ref on
structure_tabler_roles (reftype, refid, groupname);

create index idx_structure_roles_member on
structure_tabler_roles (id);