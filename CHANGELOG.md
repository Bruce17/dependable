# HEAD

- Update unit tests:
    - Add missing asserts.
    - Add tests to register a function (in preparation of ES6 fat arrow functions).
- Add new script `lint` (run via `npm run lint`) to lint project files using eslint.
    - Adjust usage of `'use strict'` in `source/utils.js`.
    - Adjust eslint rule to warn if function is used before it was defined.
    - Convert jshint-ignore statements to eslint.

# 1.2.7

- Update dependencies to their latest version.
- Update travis build.

# 1.2.6

- Implemented new method `find` to search for registered dependencies by a search string containing placeholder fields e.g. search for "foo*" to receive all dependencies starting with "foo".
- Added jsdoc doc generation. Callable via `npm run-script generate-docs`.

# 1.2.5

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
