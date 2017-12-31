import * as _ from 'lodash';
import * as fs from 'fs-extra';
import Ast, { SourceFile } from "ts-simple-ast";
import { Client } from 'pg';

import { Introspection, IntroType, IntroClass, IntroAttribute } from './introspection-types';
import * as util from './util';

export class Introspecter {
    enumLookup: { [key: string]: string } = {};
    columnLookup: { [key: string]: string } = {};
    source: SourceFile;
    constructor(readonly connectionOptions: any = {}) { }

    public async Instrospect(schemas: string[], filename: string, write: boolean = true) {
        const pg = await this.connect();
        const rows = await this.runIntrospectionQuery(pg, schemas);
        const objects = _.groupBy(rows, 'kind');
        const lookup = _.keyBy(rows, 'id');
        const ids = objects.namespace.map(o => o.id);

        const enums = objects.type.filter(row => row.kind === 'type' && ids.includes(row.namespaceId) && row.type === 'e') as IntroType[];
        const interfaces = objects.class.filter(row => row.kind === 'class' && ids.includes(row.namespaceId) && (row.classKind === 'r' || row.classKind === 'v')) as IntroClass[];

        const ast = new Ast();
        if (fs.existsSync(filename)) await fs.remove(filename);
        const sourceFile = ast.createSourceFile(filename);

        enums.forEach(declaration => {
            if (!declaration.enumVariants) return;

            const name = util.typeName(declaration.name);
            const members = declaration.enumVariants.map(variant => ({
                name: util.enumMemberName(variant),
                value: util.enumMemberName(variant),
            }));

            this.enumLookup[declaration.name] = name;

            const en = sourceFile.addEnum({
                name,
                members,
            });

            en.setIsExported(true);

            if (declaration.description) {
                en.addDoc({
                    description: declaration.description
                });
            }
        });

        interfaces.forEach(table => {
            const int = sourceFile.addInterface({
                name: util.typeName(table.name),
                isExported: true
            });

            int.setIsExported(true);

            if (table.description) {
                int.addDoc({
                    description: table.description
                });
            }

            const columns = rows.filter(row => row.kind === 'attribute' && row.classId === table.id) as IntroAttribute[];

            columns.forEach(column => {
                const type = lookup[column.typeId];
                const prop = int.addProperty({
                    name: column.name,
                    type: util.columnType(type.name, this.enumLookup, column.isNullable)
                });

                if(column.description) {
                    prop.addDoc({
                        description: column.description
                    });
                }
            });
        });

        if(write) {
            await sourceFile.save();
        }
        await pg.end();

        this.source = sourceFile;
        return sourceFile;
    }

    protected async connect() {
        const pg = new Client(this.connectionOptions);
        await pg.connect();
        return pg;
    }

    protected async runIntrospectionQuery(pg: Client, schemas: string[]) {
        const sqlFile = await fs.readFile(__dirname + '/introspect.sql');
        const sql = sqlFile.toString();

        try {
            const result = await pg.query(sql, [schemas,]);
            return result.rows.map(row => row.object) as Introspection[];
        } catch (e) {
            console.error(`An error occured executing the introspection query.`);
            throw e;
        }
    }
}
