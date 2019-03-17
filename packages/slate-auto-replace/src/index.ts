import { Change, Value } from '@gitbook/slate';
import { EditorContainer, Plugin } from '@gitbook/slate-react';
import isHotkey from 'is-hotkey';
import typeOf from 'type-of';

type MatcherFn = (type: string) => boolean;
type TriggerFn = (event: Event) => boolean;

type MatcherInput = MatcherFn | string[] | string;
type TriggerInput = TriggerFn | RegExp | string;

/*
 * A Slate plugin to automatically replace a block when a string of matching
 * text is typed.
 */
function AutoReplace(
    opts: {
        trigger: MatcherInput;
        transform?: () => void;
        ignoreIn?: MatcherInput;
        onlyIn?: MatcherInput;
    } = {}
): Plugin {
    const { transform } = opts;
    const trigger = normalizeTrigger(opts.trigger);
    const ignoreIn = opts.ignoreIn ? normalizeMatcher(opts.ignoreIn) : null;
    const onlyIn = opts.onlyIn ? normalizeMatcher(opts.onlyIn) : null;

    /*
     * On key down.
     */
    function onKeyDown(event: Event, change: Change, editor: EditorContainer) {
        if (trigger(event)) {
            return replace(event, change, editor);
        }
    }

    /*
     * Replace a block's properties.
     */
    function replace(
        event: Event,
        change: Change,
        editor: EditorContainer
    ): Change | void {
        const { value } = change;
        if (value.isExpanded) {
            return;
        }

        const { startBlock } = value;
        if (!startBlock) {
            return;
        }

        const type = startBlock.type;
        if (onlyIn && !onlyIn(type)) {
            return;
        }
        if (ignoreIn && ignoreIn(type)) {
            return;
        }

        const matches = getMatches(value);
        if (!matches) {
            return;
        }

        event.preventDefault();

        let startOffset = value.startOffset;
        let totalRemoved = 0;
        const offsets = getOffsets(matches, startOffset);

        offsets.forEach(offset => {
            change.moveOffsetsTo(offset.start, offset.end).delete();

            totalRemoved += offset.total;
        });

        startOffset -= totalRemoved;
        change.moveOffsetsTo(startOffset, startOffset);

        return change.call(transform, event, matches, editor);
    }

    /*
     * Try to match the current text of a `value` with the `before` and
     * `after` regexes.
     */
    function getMatches(
        value: Value
    ): { after: string | null; before: string | null } | null {
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
    return { onKeyDown };
}

/*
 * Normalize a `trigger` option to a matching function.
 */
function normalizeTrigger(trigger: TriggerInput): TriggerFn {
    switch (typeOf(trigger)) {
        case 'function':
            return trigger as TriggerInput;
        case 'regexp':
            return (event: Event) => !!(event.key && event.key.match(trigger));
        case 'string':
            return isHotkey(trigger);
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
