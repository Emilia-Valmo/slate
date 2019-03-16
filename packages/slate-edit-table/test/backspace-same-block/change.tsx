import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const { value } = change;
    const blockStart = value.document.getDescendant('anchor');
    const blockEnd = value.document.getDescendant('anchor');

    const withCursor = change
        .collapseToStartOf(blockStart)
        .extendToEndOf(blockEnd);

    const result = plugin.onKeyDown(
        createEvent({
            key: 'Backspace'
        }),
        withCursor
    );

    expect(result).toBe(undefined);

    return change;
}
