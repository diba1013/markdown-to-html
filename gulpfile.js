const gulp = require("gulp")
const del = require("del")
const rename = require("gulp-rename")
const fs = require("fs");

const sass = require("gulp-sass")
const csso = require("gulp-csso")

const markdown = require("gulp-markdownit")

const handlebars = require("gulp-hb");
const inline = require('gulp-inline-source')

const config = require("./config.json")

const src = {
    markdown: `${config.root}`,
    template: `${config.root}/assets/template.hbs`,
    css: `${config.root}/assets/css/*.sass`,
    images: `${config.root}/assets/images/**`,
}

const out = {
    root: `${config.out}`,
    raw: `${config.out}/raw`,
    standalone: `${config.out}/standalone`,
    css: `${config.out}/assets/css`,
    images: `${config.out}/assets/images`
}

const articles = config.files.map(article => {
    return {
        title: article.title,
        name: article.name,
        src: `${src.markdown}/${article.name}.md`,
    }
})

// Gulp pipeline options

const options = {
    sass: {
        includePaths: ["node_modules"]
    },
    markdown: {
        options: {
            html: true,
            linkify: true,
            typographer: true,
        },
        plugins: [
            {
                plugin: require("markdown-it-footnote")
            },
            {
                plugin: require("markdown-it-github-headings"),
            },
            {
                plugin: require("markdown-it-attrs"),
                options: {
                    allowedAttributes: ["id", "class", /^data(-\w+)+$/]
                }
            },
        ]
    }
}

/* Tasks */

function exists(path) {
    return fs.existsSync(path)
}

function read(path) {
    if (exists(path)) {
        return fs.readFileSync(path).toString()
    }
    return undefined;
}

function name(task, name) {
    task.displayName = name;
    return task;
}

function copy(src, dest, alt) {
    return name(
        () => gulp.src(src).pipe(gulp.dest(dest)),
        "copy:" + (alt ? alt : ` "${src}" to "${dest}"`)
    );
}

function clean(src, alt) {
    return name(
        () => del(src, {
            force: true
        }),
        "clean:" + (alt ? alt : ` "${src}"`)
    );
}

// Misc

gulp.task("copy:img", copy(src.images, out.images, "img"))

// CSS

gulp.task("compile:css", () => {
    return gulp.src(src.css)
        .pipe(sass(options.sass))
        .pipe(csso())
        .pipe(gulp.dest(out.css))
})

// Markdown to HTML

function compileMarkdown(article) {
    return name(
        () => gulp.src(article.src)
            .pipe(markdown(options.markdown))
            .pipe(gulp.dest(out.raw)),
        `compile:html:${article.name}`
    )
}

function injectHTML(article) {
    return name(
        () => {
            const template = gulp.src(src.template)
                .pipe(handlebars()
                    .data({
                        title: article.title,
                        name: article.name,
                        content: read(`${out.raw}/${article.name}.html`),
                    })) //
                .pipe(rename(`${article.name}.html`))
                .pipe(gulp.dest(out.root))

            if (config.standalone) {
                return template
                    .pipe(inline({
                        attribute: false,
                        rootpath: out.root,
                        saveRemote: false,
                        svgAsImage: true,
                    }))
                    .pipe(gulp.dest(out.standalone))
            }

            return template;
        },
        `build:html:${article.name}`
    )
}

gulp.task("build:md", gulp.parallel(
    articles.map(article => {
        return gulp.series(
            compileMarkdown(article),
            injectHTML(article)
        )
    })
))

// Global

gulp.task("clean", clean(out.root));

gulp.task("watch", () => {
    return gulp.watch([
        `${src.markdown}/*.md`,
        src.template,
        src.css,
        src.images
    ], gulp.series("build"))
});

gulp.task("build", gulp.series(
    gulp.parallel("copy:img", "compile:css"), // Ensure these compiled files are available for markdown html
    "build:md"
));

gulp.task("install", gulp.series("clean", "build"));