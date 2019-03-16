# `EditorContainer`

The Editor container singleton is passed to plugin callbacks and renderer. It allows access to the current value and methods to run changes.

## `editor.value`

```js
const { document } = editor.value;
```

## `editor.change`

```js
editor.change((change: Change) => {
    change.focus()
})
```

## `readOnly`


