# Using named AMD

AMD modules can have a name. This allows them to be loaded using that name,
instead of loading them from a path.

Doing this means that we can have a *much* faster development bundler, that just
concatenates all the JavaScript files together. It's okay for this bundler to
lose the path information, so long as it wasn't used in the module declarations
or require locations.
