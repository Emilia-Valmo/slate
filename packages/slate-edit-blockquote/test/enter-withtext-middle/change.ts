export default function(plugin, change) {
    const newChange = plugin.onKeyDown(
        {
            preventDefault() {},
            stopPropagation() {},
            key: 'Enter'
        },
        change,
        {}
    );

    expect(newChange).toBe(undefined);

    return change;
}
