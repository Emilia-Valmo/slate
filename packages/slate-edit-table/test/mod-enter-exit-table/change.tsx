import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const blockStart = change.value.document.getDescendant('anchor');
    const withCursor = change.collapseToStartOf(blockStart);

    const result = plugin.onKeyDown(
        createEvent({
            key: 'Enter',
            metaKey: true
        }),
        withCursor
    );

    expect(result.value.startBlock.type).toBe('paragraph');

    return result;
}
