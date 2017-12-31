export type IntroItem = {
    kind: 'namespace' | 'class' | 'attribute' | 'procedure' | 'type' | 'constraint',
    id: string,
    name: string,
    description: string | null
}

export type IntroSchema = IntroItem & {
    kind: 'namespace'
}

export type IntroAttribute = IntroItem & {
    kind: 'attribute',
    classId: string,
    num: number,
    name: string,
    typeId: string,
    isNullable: boolean,
    hasDefault: boolean
}

export type IntroClass = IntroItem & {
    kind: 'class',
    classKind: 'r'|'v'|'m'|'c'|'f',
    namespaceId: string,
    namespaceName: string,
    typeId: string,
    isSelectable: boolean,
    isInsertable: boolean,
    isUpdatable: boolean,
    isDeletable: boolean
}

export type IntroType = IntroItem & {
    kind: 'type',
    namespaceId: string,
    namespaceName: string,
    type: 'b' | 'c' | 'd' | 'e' | 'p' | 'r',
    category: 'A' | 'B' | 'C' | 'D' | 'E' | 'G' | 'I' | 'N' | 'P' | 'R' | 'S' | 'T' | 'U' | 'V' | 'X',
    domainIsNotNull: boolean,
    arrayItemTypeId: string,
    typeLength: number,
    isPgArray: boolean,
    classId: string | null,
    domainBaseTypeId: string | null,
    enumVariants: string[] | null,
    rangeSubTypeId: string | null
}

export type IntroConstraint = IntroItem & {
    kind: 'constraint',
    type: 'f' | 'p' | 'u',
    classId: string,
    foreignClassId: string | null,
    keyAttributeNums: number[],
    foreignKeyAttributeNums: number[] | null
}

export type Introspection = IntroSchema | IntroAttribute | IntroClass | IntroType | IntroConstraint;
