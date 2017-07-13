/* eslint import/no-extraneous-dependencies: "off" */
import R from 'ramda';
import fs from 'fs';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import path from 'path';
import livereload from 'gulp-livereload';
import YAML from 'yamljs';

const reload = livereload;
const startsWith = R.invoker(1, 'startsWith');

const sources = {
    main_js: './Resources/js/src/index.js',
    config_yaml: './Resources/js/src/config.yml',
    config_json: './Resources/js/src/config.json',
    js: './Resources/js/src/**/*.js',
    css: './Resources/scss/**/*.scss',
};

const targets = {
    js: './Resources/js/test/server/assets/js/',
    css: './Resources/js/test/server/assets/css/',
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
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest(path.join(targets.js)))
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
    b.transform(babelify.configure({
        compact: false,
        presets: ['es2015', 'react', 'stage-0', 'flow'],
        // plugins: ['transform-decorators-legacy'],
    }));

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
        plugins: ['transform-decorators-legacy'],
    }));
    return b.bundle()
    .on('error', logBrowserifyError)
    .pipe(source('app.js'))
    .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true,
        }))
        .pipe(sourcemaps.write(path.join('./')))
    .pipe(gulp.dest(targets.js));
});

const buildCss = () => gulp.src(sources.css)
    .pipe(sass({
        includePaths: ['node_modules'],
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('app.css'))
    .pipe(gulp.dest(targets.css));
gulp.task('build_css', buildCss);

gulp.task('watch_css', () => gulp.watch(sources.css,
    () => buildCss().pipe(reload()),
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
    'build_css',
    'watch_js',
    // 'live_reload',
    gulp.parallel(
        'watch_css',
    ),
));
