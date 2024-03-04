JSR Badge
=========

This is a simple badge generator for [JSR] (JavaScript Registry).  It is
intended to be used in the README files of JSR packages to indicate that the
package is registered with JSR.  Here is an example of the badge:

<https://jsr-badge.deno.dev/@std/path/stable.svg>  
![@std/path](https://jsr-badge.deno.dev/@std/path/stable.svg)

The pattern for the URL is:

    https://jsr-badge.deno.dev/@<scope>/<name>/stable.svg
    https://jsr-badge.deno.dev/@<scope>/<name>/unstable.svg

Note that the unstable badge includes pre-releases, while the stable badge does
not.

Optionally, you can specify the following options in the query string:

| Option         | Format                                                      | Description                                          |
|----------------|-------------------------------------------------------------|------------------------------------------------------|
| `label`        | string without new line                                     | Shown in the left side.  The package URL by default. |
| `color`        | hex color code                                              | The right side color.  Red by default.               |
| `labelColor`   | hex color code                                              | The left side color.  Gray by default.               |
| `style`        | `plastic`, `flat`, `flat-square`, `for-the-badge`, `social` | The badge style.  `flat` by default.                 |
| `cacheSeconds` | seconds in decimal                                          | How long the cache to be alive.  An hour by default. |

[JSR]: https://jsr.io/
