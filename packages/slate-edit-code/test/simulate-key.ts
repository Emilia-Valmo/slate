import { createEvent } from '@gitbook/slate-simulator';
import { parseHotkey } from 'is-hotkey';

// Returns a fake Event object for the given hotkey
export default function simulateKey(hotkey: string): Event {
    return createEvent(parseHotkey(hotkey, { byKey: true }));
}
