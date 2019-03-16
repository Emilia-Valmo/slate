export default function(plugin, change) {
    plugin.onKeyDown(
        {
            preventDefault() {},
            stopPropagation() {},
            key: 'Enter'
        },
        change,
        {}
    );

    return change;
}
