# HEAD

- Added new option `postfix` to add a postfix string to every loaded dependency.

# 1.2.4

- It's possible to register a dependency with an undefined/null function as result.

# 1.2.3

- Added new feature to also load subdirectories by calling `load(file, Array.<Sub-Dirs>)`.

# 1.2.2

- Fixed: added custom util methods which don't exist in Node.js v0.8.0 and v0.10.0

# 1.2.1

- Extended unit tests.
- Updated readme.
- Updated dev dependencies.
- Added prefix to dependencies loaded via `load()`.

# 1.2.0

- Added new method "registerLibrary" to register external node modules e.g. "lodash".
- Minor bugfixes

# 1.1.1

- Do not clear container every time a new container is created.

# 1.1.0

- Critical fix: module and factory dependencies are now stored the complete node runtime, not only while the package is included into the current file.

# 1.0.2

- Updated readme
- Updated .npmignore

# 1.0.1

- Updated package name
- Updated readme file

# 1.0.0

- Initial version
