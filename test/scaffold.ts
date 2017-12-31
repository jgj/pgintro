import * as util from '../src/util';

export type EnumTestCase = {
    name: string;
    members: string[];
};

export type ColumnTestCase = {
    name: string;
    type: string;
    notNull?: true;
};

export type TableTestCase = {
    name: string;
    columns: ColumnTestCase[];
    comment?: string;
};

export const DATABASE = 'pg_ts_test';
export const SCHEMA = 'test_schema';

export const ENUMS: EnumTestCase[] = [
    {
        name: 'basic_enum',
        members: [
            'one',
            'two',
            'three'
        ]
    }
]
export const TABLES: TableTestCase[] = [
    {
        name: 'basic_table',
        columns: [
            {
                name: 'id',
                type: 'serial',
                notNull: true,
            },
            {
                name: 'name',
                type: 'text',
            },
            {
                name: 'type',
                type: `${SCHEMA}.basic_enum`
            },
            {
                name: 'aliases',
                type: `text[]`
            },
        ],
        comment: 'A basic table.'
    }
];

export function getSqlStatements() {
    const statements: string[] = [];
    statements.push(`create schema ${SCHEMA};`);

    ENUMS.forEach(obj => {
        statements.push(`create type ${SCHEMA}.${obj.name} as enum ( ${obj.members.map(m => `'${m}'`).join(',')} );`);
    });

    TABLES.forEach(obj => {
        let q = `create table ${SCHEMA}.${obj.name} (\n`;
        q += obj.columns.map(col => {
            let c = `  ${col.name}    ${col.type}`;
            if(col.notNull) c += ' not null';
            return c;
        }).join(',\n');
        q += '\n);';
        statements.push(q);

        if(obj.comment) {
            statements.push(`comment on table ${SCHEMA}.${obj.name} is '${obj.comment}';`)
        }
    });

    return statements;
}

export function getColumnType(scaffoldType: string, typeLookup: any) {
    const type = scaffoldType.endsWith('[]') ? `_${scaffoldType.replace('[]', '')}` : scaffoldType;
    return util.columnType(type.replace(`${SCHEMA}.`, ''), typeLookup);
}
