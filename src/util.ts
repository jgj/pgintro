import * as pluralize from 'pluralize';
import * as str from 'underscore.string';

export type ColumnType = 
'int4' |
'int8' |
'int2' |
'smallint' |
'integer' |
'bigint' |
'decimal' |
'numeric' |
'double precision' |
'smallserial' |
'serial' |
'bigserial' |
'real' |
'money' |
'bool' |
'jsonb' |
'json' |
'date' |
'timestamp' |
'timestamptz' |
'text' |
'uuid' |
'character' |
'character varying' |
'varchar' |
'char';

export type ColumnTypeLookup = { [K in ColumnType]: string };

export const columnTypeLookup: ColumnTypeLookup = {
    'int4': 'number',
    'int8': 'number',
    'int2': 'number',
    'smallint': 'number',
    'integer': 'number',
    'bigint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'double precision': 'number',
    'smallserial': 'number',
    'serial': 'number',
    'bigserial': 'number',
    'real': 'number',
    'money': 'number',
    'bool': 'boolean',
    'jsonb': '{}',
    'json': '{}',
    'date': 'Date',
    'timestamp': 'Date',
    'timestamptz': 'Date',
    'text': 'string',
    'uuid': 'string',
    'character': 'string',
    'character varying': 'string',
    'varchar': 'string',
    'char': 'string',
}

export function typeName(input: string) {
    return pluralize.singular(str.classify(input));
}

export function enumMemberName(input: string) {
    return input.toUpperCase();
}

export function columnType(input: ColumnType | string, generatedTypes: { [pg_name: string]: string }, isNullable: boolean = false): string {
    let type: string = '';
    if (input.startsWith('_')) {
        type = columnType(input.slice(1), generatedTypes) + '[]';
    } else {
        type = generatedTypes[input] || columnTypeLookup[input as ColumnType];

        if(!type) {
            throw new Error(`Column type '${input}' is not supported`);
        }
    }

    return isNullable ? `${type} | null` : type;
}
