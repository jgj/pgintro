import { Client } from 'pg';

import * as scaffold from './scaffold';
import { Introspecter } from '../src/introspect';
import * as util from '../src/util';
import * as findup from 'find-up';

let pg: Client;
let intro: Introspecter;

describe('PG Typescript', () => {
    describe('Introspection', () => {
        it('should create typescript enums from postgres enums', () => {
            const source = intro.source;

            scaffold.ENUMS.forEach(testCase => {
                const decl = source.getEnumOrThrow(util.typeName(testCase.name));
                decl.getMembers().forEach((member, i) => {
                    expect(util.enumMemberName(testCase.members[i])).toBe(member.getName());
                });
            });
        });

        it('should create typescript interfaces from postgres tables', () => {
            const source = intro.source;
            
            scaffold.TABLES.forEach(testCase => {
                const decl = source.getInterfaceOrThrow(util.typeName(testCase.name));
                decl.getProperties().forEach((prop, i) => {
                    const column = testCase.columns[i];
                    expect(prop.getName()).toBe(column.name);

                    const propType = prop.getType();
                    const type = scaffold.getColumnType(column.type, intro.enumLookup);
                    expect(propType.getText()).toBe(type);
                });
            });
        });
    });
});

beforeAll(async () => {
    const envPath = await findup('.test.env');
    if (!envPath) {
        throw new Error('No environment file found.');
    }
    require('dotenv').config({ path: envPath });
    let connectionString = process.env.TEST_DATABASE_URL;

    if (!connectionString) {
        throw new Error(`TEST_DATABASE_URL not present in environment.`);
    }

    pg = new Client({ connectionString });
    await pg.connect();
    await query(`drop database if exists ${scaffold.DATABASE};`);
    await query(`create database ${scaffold.DATABASE};`);
    await pg.end();

    connectionString = `${connectionString}/${scaffold.DATABASE}`;
    pg = new Client({ connectionString });
    await pg.connect();

    const statements: string[] = scaffold.getSqlStatements();

    try {
        await query(statements.join('\n'));
    } catch(e) {
        console.error(`An error occured while bootstrapping the database`);
        console.error(e);
        await pg.end();
        process.exit(1);
    }

    try {
        intro = new Introspecter({ connectionString });
        await intro.Instrospect([scaffold.SCHEMA,], '.reference/test_types.ts');
        return pg.end();
    } catch(e) {
        console.error(`An error occured while introspecting the database`);
        console.error(e);
        await pg.end();
        process.exit(1);
    }
});

afterAll(async () => {
    let connectionString = process.env.TEST_DATABASE_URL;
    pg = new Client({ connectionString });
    await pg.connect();
    await pg.query(`drop database if exists ${scaffold.DATABASE}`);
    return pg.end();
});

const query = async (statement: string) => {
    try {
        console.log(statement);
        return pg.query(statement);
    } catch (e) {
        console.error(e);
        await pg.end();
        process.exit(1);
    }
};
