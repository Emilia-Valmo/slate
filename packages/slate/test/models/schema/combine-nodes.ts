import { Schema } from '@gitbook/slate';

export default function() {
    const a = Schema.create({
        blocks: {
            'code-tab': {
                nodes: [
                    {
                        types: ['code-line']
                    }
                ]
            },
            'code-line': {
                nodes: [
                    {
                        objects: ['text'],
                        min: 1
                    }
                ],
                parent: {
                    types: ['code-tab']
                },
                marks: []
            }
        }
    });

    const b = Schema.create({
        blocks: {
            code: {
                nodes: [
                    {
                        types: ['code-tab']
                    }
                ]
            },
            'code-tab': {
                parent: {
                    types: ['code']
                }
            }
        }
    });

    const combined = a.combineWith(b);
    expect(combined.blocks).toEqual({
        'code-tab': {
            nodes: [
                {
                    types: ['code-line']
                }
            ],
            parent: {
                types: ['code']
            }
        },
        'code-line': {
            nodes: [
                {
                    objects: ['text'],
                    min: 1
                }
            ],
            parent: {
                types: ['code-tab']
            },
            marks: []
        },
        code: {
            nodes: [
                {
                    types: ['code-tab']
                }
            ]
        }
    });
}
