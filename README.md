# gistpkg

gistpkg is a "package manager" backed by gist.github.com.

It will download and sync the specified gists and keep them up to date as you desire.

### Use Case

The intended use case is for very small pieces of code that will either never change, or are unlikely to. For anything more than that, it should just be a regular NPM package.

You should commit both the `gistpkg.json` and any code that it downloads.

### Examples

#### Initialise

This will create a `gistpkg.json` to store the gist locations, descriptions and any aliases, as well as the base directory to install to.

```
$ npx @block65/gistpkg init
```

#### Add a gist and always use the latest gist

This also uses the alias feature to alias the directory as `recat-hooks`

```
$ npx @block65/gistpkg add https://gist.github.com/maxholman/ad1673591a6f226d8385f027f842eca4 react-hooks
```

### Add a gist pinned to a specific commit

```
$ npx @block65/gistpkg add https://gist.github.com/maxholman/ad1673591a6f226d8385f027f842eca4/3889d8a55d82004d2e3d9b66c6917665ba690b70
```

### Install / re-install gists

```
$ npx @block65/gistpkg install
```
