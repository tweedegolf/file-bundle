/* eslint import/no-extraneous-dependencies: "off" */
import R from 'ramda';
import fs from 'fs';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';
import sass from 'gulp-sass';
import copy from 'gulp-copy';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import envify from 'envify';
import watchify from 'watchify';
import babelify from 'babelify';
import path from 'path';
import livereload from 'gulp-livereload';
import YAML from 'yamljs';

const reload = livereload;
const startsWith = R.invoker(1, 'startsWith');

const sources = {
    main_js: './src/js/index.js',
    config_yaml: './src/js/config.yml',
    config_json: './src/js/config.json',
    js: './src/js/**/*.js',
    css: './src/scss/app.scss',
    cssComplete: './src/scss/app-complete.scss',
    cssNoBootstrap: './src/scss/app-no-bootstrap.scss',
    cssNoFontAwesome: './src/scss/app-no-font-awesome.scss',
};

const targets = {
    js1: '../_backend/web/assets/scripts',
    js2: '../_backend/src/TweedeGolf/FileBundle/Resources/scripts',
    css: './build/styles/',
};

const logBrowserifyError = (e) => {
    gutil.log(gutil.colors.red(e.message));
    if (e.codeFrame) {
        if (startsWith('false', e.codeFrame)) {
            gutil.log(gutil.colors.red(e.codeFrame.substr(5)));
        } else {
            gutil.log(gutil.colors.red(e.codeFrame));
        }
    }
};

const rebundle = b => b.bundle()
    .on('error', logBrowserifyError)
    .pipe(source('file-bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.join(targets.js1)))
    .pipe(gulp.dest(path.join(targets.js2)))
    .pipe(reload());

gulp.task('watch_js', () => {
    const opts = {
        debug: true,
        paths: sources.js,
    };

    opts.cache = {};
    opts.packageCache = {};

    const b = watchify(browserify(opts));
    b.add(sources.main_js);
    b.transform(
        babelify.configure({
            compact: false,
            presets: ['es2015', 'react', 'stage-0', 'flow'],
            // plugins: ['transform-decorators-legacy'],
        }),
    );
    b.transform(envify);
    b.on('update', () => {
        gutil.log('update js bundle');
        rebundle(b);
    });

    return rebundle(b);
});

gulp.task('build_js', () => {
    const opts = {
        debug: true,
        path: sources.js,
    };
    const b = browserify(opts);
    b.add(sources.main_js);
    b.transform(babelify.configure({
        compact: false,
        presets: ['es2015', 'react', 'stage-0'],
        // plugins: ['transform-decorators-legacy'],
    }));
    return b.bundle()
        .on('error', logBrowserifyError)
        .pipe(source('file-bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true,
        }))
        .pipe(sourcemaps.write(path.join('./')))
        .pipe(gulp.dest(targets.js1))
        .pipe(gulp.dest(targets.js2));
});

const buildCss = () => gulp.src(sources.css)
    .pipe(sass({
        outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('file-bundle-complete.css'))
    .pipe(gulp.dest(targets.css));
gulp.task('build_css', buildCss);

const buildCssComplete = () => gulp.src(sources.cssComplete)
    .pipe(sass({
        includePaths: ['node_modules'],
        outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('file-bundle-complete.css'))
    .pipe(gulp.dest(targets.css));
gulp.task('build_css_complete', buildCssComplete);


const buildCssNoBootStrap = () => gulp.src(sources.cssNoBootstrap)
    .pipe(sass({
        includePaths: ['node_modules'],
        outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('file-bundle-no-bootstrap.css'))
    .pipe(gulp.dest(targets.css));
gulp.task('build_css_no_bootstrap', buildCssNoBootStrap);


const buildCssNoFontAwesome = () => gulp.src(sources.cssNoFontAwesome)
    .pipe(sass({
        includePaths: ['node_modules'],
        outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('file-bundle-no-font-awesome.css'))
    .pipe(gulp.dest(targets.css));
gulp.task('build_css_no_font-awesome', buildCssNoFontAwesome);


const copySource = () => gulp.src(['src/**'])
    .pipe(copy('../_backend/src/TweedeGolf/FileBundle/Resources/'));

const copyFonts = () => gulp.src(['./fonts/**'])
    .pipe(gulp.dest('../_backend/src/TweedeGolf/FileBundle/Resources/fonts'))
    .pipe(gulp.dest('../_backend/web/assets/fonts'));

const copyBuild = () => gulp.src(['./build/**'])
    .pipe(gulp.dest('../_backend/src/TweedeGolf/FileBundle/Resources/'))
    .pipe(gulp.dest('../_backend/web/assets/'))

const copyHtml = () => gulp.src(['./src/*.html'])
    .pipe(gulp.dest('../_backend/web/assets/'))

gulp.task('copy', gulp.series(
    copySource,
    copyBuild,
    copyFonts,
    copyHtml,
));


gulp.task('watch_css', () => gulp.watch('./src/scss/*.scss',
    () => {
        console.log('rebuild css');
        return buildCssComplete().pipe(reload());
    },
));

gulp.task('live_reload', (done) => {
    livereload.listen();
    done();
});

gulp.task('generate_config', (done) => {
    const c = YAML.load(sources.config_yaml);
    fs.writeFile(sources.config_json, JSON.stringify(c), () => {
        done();
    });
});

gulp.task('develop', gulp.series(
    'generate_config',
    'build_css_complete',
    'watch_js',
    'live_reload',
    gulp.parallel(
        'watch_css',
    ),
));


gulp.task('production', gulp.series(
    'generate_config',
    'build_css',
    'build_css_complete',
    'build_css_no_bootstrap',
    'build_css_no_font-awesome',
));
