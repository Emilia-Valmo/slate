import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    plugin.plugin.onKeyDown(
        createEvent({
            key: 'Backspace'
        }),
        change,
        {}
    );

    // Selection check
    expect(change.value.startBlock.text).toEqual('Second item');
    expect(change.value.selection.anchorOffset).toEqual(0);
    expect(change.value.selection.isCollapsed).toBe(true);
    return change;
}
