import { Change, Value } from '@gitbook/slate';
import { EditorContainer, Plugin } from '@gitbook/slate-react';
import { isKeyHotkey } from 'is-hotkey';
import typeOf from 'type-of';

type MatcherFn = (type: string) => boolean;
type TriggerFn = (event: Event) => boolean;

type MatcherInput = MatcherFn | string[] | string;
type TriggerInput = TriggerFn | RegExp | string;

interface Matches {
    after: string | null;
    before: string | null;
}

/*
 * A Slate plugin to automatically replace a block when a string of matching
 * text is typed.
 */
function AutoReplace(opts: {
    // Trigger on the given input text
    onInput?: TriggerInput;
    // Trigger on the given hotkey, given in the format of `is-hotkey`
    onHotkey?: string;
    // Only trigger inside the given node types
    onlyIn?: MatcherInput;
    // Never trigger in the given node types
    ignoreIn?: MatcherInput;
    // Trigger if the text before the cursor matches the regexp
    // Any captured group in the regexp will be removed on transform.
    before?: RegExp;
    // Trigger if the text after the cursor matches the regexp
    // Any captured group in the regexp will be removed on transform.
    after?: RegExp;

    // What to change when triggered
    transform: (Change, Event, Matches, EditorContainer) => void;
}): Plugin {
    const { transform } = opts;
    const onHotkey = opts.onHotkey ? isKeyHotkey(opts.onHotkey) : () => false;
    const onInput = opts.onInput ? normalizeOnInput(opts.onInput) : () => false;
    const ignoreIn = opts.ignoreIn ? normalizeMatcher(opts.ignoreIn) : null;
    const onlyIn = opts.onlyIn ? normalizeMatcher(opts.onlyIn) : null;

    function onKeyDown(
        event: Event,
        change: Change,
        editor: EditorContainer
    ): boolean | void {
        if (!onHotkey(event)) {
            return;
        }

        const matches = getMatches(change.value);
        if (!matches) {
            return;
        }

        replace(matches, event, change, editor);
        return true;
    }

    function onBeforeInput(
        event: Event,
        change: Change,
        editor: EditorContainer
    ): boolean | void {
        if (!onInput(event)) {
            return;
        }

        const matches = getMatches(change.value);
        if (!matches) {
            return;
        }

        replace(matches, event, change, editor);
        return true;
    }

    /*
     * Apply the transform it.
     */
    function replace(
        matches: Matches,
        event: Event,
        change: Change,
        editor: EditorContainer
    ): boolean | void {
        const { value } = change;
        let startOffset = value.startOffset;
        let totalRemoved = 0;
        const offsets = getOffsets(matches, startOffset);

        offsets.forEach(offset => {
            change.moveOffsetsTo(offset.start, offset.end).delete();

            totalRemoved += offset.total;
        });

        startOffset -= totalRemoved;
        change.moveOffsetsTo(startOffset, startOffset);

        change.call(transform, event, matches, editor);

        event.preventDefault();
        return true;
    }

    /*
     * Try to match the current text of a `value` with the `before` and
     * `after` regexes, and other given conditions.
     */
    function getMatches(value: Value): Matches | null {
        if (value.isExpanded) {
            return null;
        }

        const { startBlock } = value;
        if (!startBlock) {
            return null;
        }

        const type = startBlock.type;
        if (onlyIn && !onlyIn(type)) {
            return null;
        }
        if (ignoreIn && ignoreIn(type)) {
            return null;
        }

        const { startText, startOffset } = value;
        const { text } = startText;
        let after = null;
        let before = null;

        if (opts.after) {
            const content = text.slice(startOffset);
            after = content.match(opts.after);
        }

        if (opts.before) {
            const content = text.slice(0, startOffset);
            before = content.match(opts.before);
        }

        // If both sides, require that both are matched, otherwise null.
        if (opts.before && opts.after && !before) {
            after = null;
        }
        if (opts.before && opts.after && !after) {
            before = null;
        }

        // Return null unless we have a match.
        if (!before && !after) {
            return null;
        }

        if (after) {
            after[0] = after[0].replace(/\s+$/, '');
        }
        if (before) {
            before[0] = before[0].replace(/^\s+/, '');
        }

        return { before, after };
    }

    /*
     * Return the offsets for `matches` with `start` offset.
     */
    function getOffsets(
        matches: { after: string | null; before: string | null },
        start: number
    ): Array<{
        start: number;
        end: number;
        total: number;
    }> {
        const { before, after } = matches;
        const offsets = [];
        let totalRemoved = 0;

        if (before) {
            const match = before[0];
            let startOffset = 0;
            let matchIndex = 0;

            before.slice(1, before.length).forEach(current => {
                if (current === undefined) {
                    return;
                }

                matchIndex = match.indexOf(current, matchIndex);
                startOffset = start - totalRemoved + matchIndex - match.length;

                offsets.push({
                    start: startOffset,
                    end: startOffset + current.length,
                    total: current.length
                });

                totalRemoved += current.length;
                matchIndex += current.length;
            });
        }

        if (after) {
            const match = after[0];
            let startOffset = 0;
            let matchIndex = 0;

            after.slice(1, after.length).forEach(current => {
                if (current === undefined) {
                    return;
                }

                matchIndex = match.indexOf(current, matchIndex);
                startOffset = start - totalRemoved + matchIndex;

                offsets.push({
                    start: startOffset,
                    end: startOffset + current.length,
                    total: 0
                });

                totalRemoved += current.length;
                matchIndex += current.length;
            });
        }

        return offsets;
    }

    return {
        onKeyDown,
        onBeforeInput
    };
}

/*
 * Normalize a 'onInput' option to a matching function.
 */
function normalizeOnInput(onInput: TriggerInput): TriggerFn {
    switch (typeOf(onInput)) {
        case 'function':
            return onInput as TriggerInput;
        case 'regexp':
            return (event: Event) =>
                !!(event.data && event.data.match(onInput));
        case 'string':
            return (event: Event) => !!(event.data && event.data === onInput);
        default:
            throw new Error('Invalid onInput option');
    }
}

/*
 * Normalize a node matching plugin option.
 */
function normalizeMatcher(matcher: MatcherInput): MatcherFn {
    switch (typeOf(matcher)) {
        case 'function':
            return matcher as MatcherFn;
        case 'array':
            return (type: string) => matcher.includes(type);
        case 'string':
            return (type: string) => type === matcher;
    }
}

export default AutoReplace;
