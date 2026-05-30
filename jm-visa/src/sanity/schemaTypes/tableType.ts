import { defineType, defineField, defineArrayMember } from 'sanity'

export const tableType = defineType({
    name: 'table',
    title: 'Table',
    type: 'object',
    fields: [
        defineField({
            name: 'rows',
            title: 'Table Rows',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'tableRow',
                    title: 'Table Row',
                    fields: [
                        defineField({
                            name: 'cells',
                            title: 'Cells',
                            type: 'array',
                            of: [{ type: 'string' }],
                        }),
                    ],
                    preview: {
                        select: {
                            cells: 'cells',
                        },
                        prepare({ cells }) {
                            const preview = cells ? cells.slice(0, 3).join(' | ') : 'Empty row'
                            return {
                                title: preview,
                            }
                        },
                    },
                }),
            ],
        }),
    ],
    preview: {
        select: {
            rows: 'rows',
        },
        prepare({ rows }) {
            const rowCount = rows ? rows.length : 0
            const colCount = rows && rows[0]?.cells ? rows[0].cells.length : 0
            return {
                title: `Table (${rowCount} rows × ${colCount} columns)`,
            }
        },
    },
})


