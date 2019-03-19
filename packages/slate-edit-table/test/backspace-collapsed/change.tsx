import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const { value } = change;
    const blockStart = value.document.getDescendant('anchor');

    const withCursor = change.collapseToStartOf(blockStart);

    plugin.plugin.onKeyDown(
        createEvent({
            key: 'Backspace'
        }),
        withCursor
    );

    return change;
}
