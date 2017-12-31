PGIntro
=======

PGIntro introspects your Postgres database and generates corresponding TypeScript types.

Currently, the following database objects are utilized:

* Enums: Generate string enums
* Tables: Generate interfaces
* Views: Generate interfaces

## Example

The following SQL:
```sql
create type my_schema.age_group as enum (
    'child',
    'adolescent',
    'adult'
);

create table my_schema.person (
    id  uuid    primary key,
    first_name  text not null,
    last_name   text,
    aliases     text[],
    birth_date  timestamp not null,
    age_group   age_group not null
);

comment on table my_schema.person is 'A single person.';
```

would generate the following typescript code:
```typescript
export enum AgeGroup {
    CHILD = "CHILD",
    ADOLESCENT = "ADOLESCENT",
    ADULT = "ADULT"
}

/**
 * A single person.
 */
export interface Person {
    id: string;
    first_name: string;
    last_name: string | null;
    aliases: string[] | null;
    birth_date: Date;
    age_group: AgeGroup;
}
```

## Usage

```typescript
import { Introspecter } from 'pgintro';

const intro = new Introspecter();
await intro.Instrospect(['my_schema'], 'my_database_types.ts');
```

The only argument required for constructing `Introspecter` are optional postgres connection options. These are passed as-is to `pg.Client` constructor. If omitted, `pg.Client` will attempt to use environment variables as specified here: [https://node-postgres.com/features/connecting](https://node-postgres.com/features/connecting)

## About

PGIntro is a small amount of glue that utilizes the [excellent introspection query](https://github.com/graphile/graphile-build/blob/master/packages/graphile-build-pg/res/introspection-query.sql) from [PostGraphQL](https://github.com/postgraphql/postgraphql) and the also excellent [ts-simple-ast](https://dsherret.github.io/ts-simple-ast/) project. It's lightly tested and far from full-featured at the moment.

**Pull requests are extremely welcome**

## Running the tests
Create a file `.test.env` in the root of the repository that contains a TEST_DATABASE_URL value, like so:

```
# .test.env
TEST_DATABASE_URL='http://user:doplhin1@localhost:5432'
```

The tests will create a temporary database upon startup and delete it once the tests have completed.
