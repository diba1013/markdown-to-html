# Markdown To HTML

This project aims to provide an easy way to compile [Markdown](https://github.github.com/gfm/) files to HTML. It will generate a fully functional HTML page with CSS similar to [GitHubs' markdown](https://github.com/sindresorhus/github-markdown-css). The generated HTML files are placed inside an dedicated folder to be served by a web server, allowing for example a deployment of [GithHub Pages](https://pages.github.com/).

A deployed example can be found [here](https://diba1013.github.io/markdown-to-html/).

## Installation

This project requires [Node.js](https://nodejs.org/) to run, however [Yarn](https://yarnpkg.com) is the prefered package manager. To execute the compilation step, [gulp](https://gulpjs.com/) is used. Note that not all gulp tasks are exposed to Node.js; it is adviced to use a task detector or to look into [`gulpfile.js`](./gulpfile.js) for available tasks.

*This project is designed to be used within Visual Studio Code, so that you may easily execute the defined gulp tasks.*

```sh
yarn install
yarn upgrade --latest
yarn run build
```

## Configuration

This projects' configuration is available in [`config.json`](./config.json). 

| Config       | Type                    | Description                                                                                                                                                                                                                                                                                                                       |
| :----------- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| root         | `string`                | The directory of the markdown and assets files.                                                                                                                                                                                                                                                                                   |
| out          | `string`                | The output directory where the `${root}` is compiled to. This directory can be served. For serving GitHub Pages, it is recommended to name this the same name as the repository and starting the webserver in the project root. This simulates the behaviour of GitHub Pages and ensures that the files are correctly referenced. |
| server       | `Server`                | The configuration for the web server, the files are served on. Used for referencing external files (stylesheet, ...).                                                                                                                                                                                                             |
| standalone   | `bool`                  | If a standalone HTML without dependencies should be generated.                                                                                                                                                                                                                                                                    |
| files        | `Category[]`            | The markdown files to be compiled to HTML.                                                                                                                                                                                                                                                                                        |
|              |                         |                                                                                                                                                                                                                                                                                                                                   |
| **Server**   |                         |                                                                                                                                                                                                                                                                                                                                   |
| path         | `string` or `undefined` | The path of the server to serve on. For GitHub Pages, it is recommended to name this `/${repository.name}` (similarily to `out`) to ensure that files are referenced from the server root, instead of relatively. This is most important for categories to find the global files correctly.                                       |
|              |                         |                                                                                                                                                                                                                                                                                                                                   |
| **Category** |                         |                                                                                                                                                                                                                                                                                                                                   |
| name         | `string`                | The name of the category. This is used to store the articles within this directory `${server.root}/${category.name}/${article.name}.html`.                                                                                                                                                                                        |
| root         | `string` or `undefined` | The root path of the category. If specified, this must be placed within `${project.root}/${category.root}/`. It may only be ommited once (such as for `index` in the example) in which case the root is used from `${project.root}/src`.                                                                                          |
| files        | `Article[]`             | The articles specified for this category. They must be placed in `${project.root}/${category.root}/*.md`                                                                                                                                                                                                                          |
|              |                         |                                                                                                                                                                                                                                                                                                                                   |
| **Article**  |                         |                                                                                                                                                                                                                                                                                                                                   |
| title        | `string`                | The title of the article displayed in HTML.                                                                                                                                                                                                                                                                                       |
| name         | `string`                | The name of the file without extension.                                                                                                                                                                                                                                                                                           |

#### Files

All files necessary are to be placed in `${root}`. The below structure is transfered to `${out}` upon compilation.

```
${root} / ${out}
 +- assets
 |   +- css 
 |   +- images
 +- *.md / *.html
```

* All stylesheets are placed in `${root}/assets/css` as [`.sass`](https://sass-lang.com/) files.
* All images are placed in `${root}/assets/images` as any file you choose.

#### Standalone

The `standalone` option allows for independent HTML to be generated into `${out}/standalone/`. All external dependecies like *stylesheets* as `style`, *JavaScript* as `script` and *images* as base64) are inlined.

## Extending this template

This template is supposed to be just a starter with some useful default configuration. It might gain additional features, but it is left to the user to define additional configurations, plugins or expand the template.

#### HTML

The content for the HTMl is compiled by [markdown-it](https://github.com/markdown-it/markdown-it). There are plenty of [plugins](https://www.npmjs.com/search?q=keywords:markdown-it-plugin) available which extend both the markdown syntax as well as the generated HTML.

The external structure is injected by [handlebars](https://handlebarsjs.com/) with `${root}/assets/template.hbs` where the compiled content is inserted into `<article>`.

You may choose to throw the markdown file against [GitHub's `/markdown` API](https://developer.github.com/v3/markdown/).
