process.env.DISABLE_NOTIFIER = true;
/**
 * Main build script for the @Large Research Group site.
 */

'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');
const gulpUtil = require('gulp-util');
const notify = require('gulp-notify');
const eventStream = require('event-stream');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const browserify = require('gulp-browserify');
const del = require('del');
const webServer = require('gulp-webserver');


/**
 * Global locations of static resources.
 */
const STATIC_SOURCE_ROOT = './public/src/';
const STATIC_DIST_ROOT = './public/dist/';
const DATA_ROOT = './wta-data/';

/**
 * Stylesheets task.
 *
 * These are written in the SASS preprocessor language.
 */
const stylesRootDir = STATIC_SOURCE_ROOT + 'styles/';
const stylesDistDir = STATIC_DIST_ROOT + 'css/';

const styleFileNames = ['main'];
const styleFilePaths = styleFileNames.map(fileName => stylesRootDir + fileName + '.sass');

gulp.task('styles', () => {
    gulp.src(styleFilePaths)
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest(stylesDistDir))
        .pipe(notify({message: 'Styles task complete', onLast: true}));
});


/**
 * ESLint task.
 *
 * Performs static code analysis for all JS scripts.
 */
gulp.task('eslint', () => {
    gulp.src([scriptsRootDir + '**/*.js', './app/**/*.js', './gulpfile.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});


/**
 * Scripts task.
 *
 * Scripts are written in plain Javascript and bundled using browserify.
 */
const scriptsRootDir = STATIC_SOURCE_ROOT + 'scripts/';
const scriptsDistDir = STATIC_DIST_ROOT + 'js/';

const scriptsFileNames = ['main', 'publications'];
const scriptsFilePaths = scriptsFileNames.map(fileName => scriptsRootDir + fileName + '.js');

// Add the bootstrap JS file (not included explicitly by any of the JS files)
scriptsFilePaths.push('./node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js');

gulp.task('scripts', () => {
    gulp.src(scriptsFilePaths)
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest(scriptsDistDir))
        .pipe(notify({message: 'Scripts task complete', onLast: true}));
});


/**
 * View templates task.
 *
 * These are the templates for the HTML files that are produced. They are written in the Pug language (formerly known as
 * Jade).
 */
const viewsRootDir = './views/';
const viewsDistDir = STATIC_DIST_ROOT;

const viewController = require('./app/view-controller');

gulp.task('views', ['validate'], () => {
    const tasks = viewController.generateViewTasks(gulp, viewsRootDir, viewsDistDir);
    return eventStream.merge.apply(null, tasks)
        .pipe(notify({message: 'Views task complete', onLast: true}));
});


/**
 * Images.
 *
 * Task for copying over all image resources to their destination folders.
 */
const imagesRootDir = [DATA_ROOT + 'images/', STATIC_SOURCE_ROOT + 'images/'];
const imagesDistDir = STATIC_DIST_ROOT + 'images/';

const imagesFilePaths = imagesRootDir.map(img => img + '**/*.{png,jpg,svg}');

gulp.task('images', () => {
    return gulp.src(imagesFilePaths)
        .pipe(gulp.dest(imagesDistDir))
        .pipe(notify({message: 'Images task complete', onLast: true}));
});


/**
 * PDFs.
 *
 * Task for copying over all PDFs to their destination folder.
 */
const pdfsRootDir = STATIC_SOURCE_ROOT + 'pdfs/';
const pdfsDistDir = STATIC_DIST_ROOT + 'pdfs/';

const pdfsFilePaths = pdfsRootDir + '**/*.pdf';

gulp.task('pdfs', () => {
    return gulp.src(pdfsFilePaths)
        .pipe(gulp.dest(pdfsDistDir))
        .pipe(notify({message: 'PDFs task complete', onLast: true}));
});

/**
 * TRACES.
 *
 * Task for copying over all PDFs to their destination folder.
 */
const tracesRootDir = STATIC_SOURCE_ROOT + 'traces/';
const tracesDistDir = STATIC_DIST_ROOT + 'traces/';

const tracesFilePaths = tracesRootDir + '*.zip';

gulp.task('traces', () => {
    return gulp.src(tracesFilePaths, { buffer: false })
        .pipe(gulp.dest(tracesDistDir))
        .pipe(notify({message: 'Traces task complete', onLast: true}));
});


/**
 * Favicon.
 *
 * Task for copying over the favicon over to the output directory.
 */
const faviconRootDir = STATIC_SOURCE_ROOT;
const faviconDistDir = STATIC_DIST_ROOT;

gulp.task('favicon', () => {
    return gulp.src(faviconRootDir + 'favicon.ico')
        .pipe(gulp.dest(faviconDistDir))
        .pipe(notify({message: 'Favicon task complete', onLast: true}));
});

/**
 * YAML data validation task.
 *
 * Uses YAML schemas to validate all JSON files in the data directory.
 */
const schemaRootDir = './schemas/';

const yamlValidator = require('./app/yaml-validator');

gulp.task('validate', () => {
    const tasks = yamlValidator.generateValidationTasks(gulp, schemaRootDir, DATA_ROOT);

    return eventStream.merge.apply(null, tasks)
        .pipe(notify({message: 'YAML Validation task complete', onLast: true}));
});

/**
 * Clean.
 *
 * Deletes the built directory.
 */
gulp.task('clean', () => {
    return del([STATIC_DIST_ROOT]);
});


/**
 * Development web-server task.
 *
 * For development purposes only (do not use in production!).
 */
const SERVER_PORT = 3333;

gulp.task('serve', () => {
    gulp.src('public/dist')
        .pipe(notify({message: 'Server starting on http://localhost:' + SERVER_PORT}))
        .pipe(webServer({
            livereload: true,
            port: SERVER_PORT,
            open: true
        }));
});


/**
 * Default task.
 *
 * Run by executing `gulp`.
 */
gulp.task('default', done => {
    runSequence('clean', 'styles', 'eslint', 'scripts', 'views', 'favicon', 'pdfs', 'images', () => {
        gulpUtil.log('Build Complete.');
        done();
    });
});


/**
 * Watch task.
 *
 * Builds all resources and watches the source files for changes. Used during development to automatically recompile
 * files when you've changed them.
 */
gulp.task('watch', ['default'], () => {
    gulp.watch(stylesRootDir + '**/*.sass', ['styles']);
    gulp.watch(scriptsRootDir + '**/*.js', ['scripts']);
    gulp.watch(DATA_ROOT + '**/*.yml', ['views']);
    gulp.watch(viewsRootDir + '**/*.pug', ['views']);
    gulp.watch(imagesRootDir + '**/*.{png,jpg,svg}', ['images']);
    gulp.watch(pdfsRootDir + '**/*.pdf', ['pdfs']);
});
