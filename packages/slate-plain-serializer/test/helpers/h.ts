import { createHyperscript } from '@gitbook/slate-hyperscript';

/*
 * Define a hyperscript.
 */
const h = createHyperscript({
    blocks: {
        line: 'line',
        paragraph: 'paragraph',
        quote: 'quote',
        code: 'code',
        image: {
            type: 'image',
            isVoid: true
        }
    },
    inlines: {
        link: 'link',
        hashtag: 'hashtag',
        comment: 'comment',
        emoji: {
            type: 'emoji',
            isVoid: true
        }
    },
    marks: {
        b: 'bold',
        i: 'italic',
        u: 'underline'
    }
});

export default h;
