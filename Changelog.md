# Release notes

Slate is a monorepo. All notable changes to any of the Slate package will be documented in this file. Slate adheres to [Semantic Versioning](http://semver.org/).

All packages follow the same versions. Before 1.0.0, each package was progressing independently, and they had individual changelogs.

# 3.0.0

* [BREAKING] Remove `renderPortal`, `renderPlaceholder`, `renderNode` and `renderMark` and `renderEditor` from plugins.
* [BREAKING] Support only `react>=16.8`
* [BREAKING] Package `@gitbook/slate-prop-types` is no longer published
* [BREAKING] Props `readOnly` has been removed when rendering nodes, you should use `editor.readOnly` instead
* [BREAKING] Remove deprecated `toJSON`, `fromJSON` and `kind` properties on models
* [BREAKING] Remove deprecated `Character` model
* [BREAKING] Switch to Typescript, not all modules are typed yet. Dynamic type checks are no longer done.
* [BREAKING] Schema has been split from plugins, and should be created using `Schema.create({ ... })`
* [BREAKING] `@gitbook/slate-auto-replace` was fixed tu support input resulting from a key combination (e.g. detect `space` whether shift was pressed or not at the same time). In fixing it, the API changed from a `trigger` option to two different options `onInput` and `onHotkey`.
* Debug logs are no longer emitted during rendering (you can use the React dev tools instead)
* Compatibility with react strict/concurrent modes 
* Added `@gitbook/slate-raw-paste` to allow pasting without formatting on Shift+Mod+V


# 2.0.1

* Fixed a mistake that would crash when a DOM node could not be found.
* Fix an error on Edge when copying content

# 2.0.0

* [BREAKING] Added "normalize" options to Table utils. This has changed the signature of some of them.
* Fixed invalid selection when pasting fragments that were normalized away
* Avoid crashes when a native selection cannot be made to match the current selection. Added some error reporting in when it happens.

# 1.0.0

* Now releasing all packages under the same version for simplicity.
* Slate is now compiled for evergreen browsers (https://github.com/GitbookIO/slate/pull/18)
