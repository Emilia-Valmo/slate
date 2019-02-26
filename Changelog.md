# Release notes

Slate is a monorepo. All notable changes to any of the Slate package will be documented in this file. Slate adheres to [Semantic Versioning](http://semver.org/).

All packages follow the same versions. Before 1.0.0, each package was progressing independently, and they had individual changelogs.

# 2.0.0

* [BREAKING] Added "normalize" options to Table utils. This has changed the signature of some of them.
* Fixed invalid selection when pasting fragments that were normalized away
* Avoid crashes when a native selection cannot be made to match the current selection. Added some error reporting in when it happens.

# 1.0.0

* Now releasing all packages under the same version for simplicity.
* Slate is now compiled for evergreen browsers (https://github.com/GitbookIO/slate/pull/18)
