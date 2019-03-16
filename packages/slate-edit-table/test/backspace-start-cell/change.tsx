import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const { value } = change;
    const blockStart = value.document.getDescendant('anchor');
    const withCursor = change.collapseToStartOf(blockStart);

    const event = createEvent({
        key: 'Backspace'
    });

    const result = plugin.onKeyDown(event, withCursor);

    // It should have prevented the default behavior...
    expect(event.isDefaultPrevented).toBe(true);

    // ...and left the change unchanged
    expect(result).toBe(change);

    return change;
}
