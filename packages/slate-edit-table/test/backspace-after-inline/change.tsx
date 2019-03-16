import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const event = createEvent({
        key: 'Backspace'
    });

    const result = plugin.onKeyDown(event, change);

    // It shouldn't alter the default behavior...
    expect(event.isDefaultPrevented).toBe(false);

    // ...and let Slate do the work
    expect(result).toBe(undefined);

    return change;
}
