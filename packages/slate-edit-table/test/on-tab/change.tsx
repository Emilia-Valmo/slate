import { createEvent } from '@gitbook/slate-simulator';

export default function(plugin, change) {
    const cursorBlock = change.value.document.getDescendant('anchor');
    change.moveToRangeOf(cursorBlock);

    const initialPosition = plugin.utils.getPosition(change.value);

    plugin.onKeyDown(
        createEvent({
            key: 'Tab'
        }),
        change
    );

    const position = plugin.utils.getPosition(change.value);

    // Same row
    expect(position.getRowIndex()).toEqual(initialPosition.getRowIndex());

    // Moved to next column
    expect(position.getColumnIndex()).toEqual(
        initialPosition.getColumnIndex() + 1
    );

    return change;
}
