process.env.DISABLE_NOTIFIER = true;
/**
 * Main build script for the @Large Research Group site.
 */

'use strict';

const { src, dest, parallel, series, watch} = require('gulp');
const gulp = require('gulp');
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

function styles(done) {
    src(styleFilePaths)
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(dest(stylesDistDir))
        .pipe(notify({message: 'Styles task complete', onLast: true}));
    done();
}


/**
 * ESLint task.
 *
 * Performs static code analysis for all JS scripts.
 */
function eslinting() {
    return src([scriptsRootDir + '**/*.js', './app/**/*.js', './gulpfile.js'])
        .pipe(eslint())
        .pipe(eslint.format());
}


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

function scripts(done) {
    src(scriptsFilePaths, { allowEmpty: true })
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(dest(scriptsDistDir))
        .pipe(notify({message: 'Scripts task complete', onLast: true}));
    done();
}

/**
 * YAML data validation task.
 *
 * Uses YAML schemas to validate all JSON files in the data directory.
 */
const schemaRootDir = './schemas/';

const yamlValidator = require('./app/yaml-validator');

function validate() {
    const tasks = yamlValidator.generateValidationTasks(gulp, schemaRootDir, DATA_ROOT);

    eventStream.merge.apply(null, tasks)
        .pipe(notify({message: 'YAML Validation task complete', onLast: true}));
}


/**
 * View templates task.
 *
 * These are the templates for the HTML files that are produced. They are written in the Pug language (formerly known as
 * Jade).
 */
const viewsRootDir = './views/';
const viewsDistDir = STATIC_DIST_ROOT;

const viewController = require('./app/view-controller');

function views(done) { 
	validate();
    
	const tasks = viewController.generateViewTasks(gulp, viewsRootDir, viewsDistDir);
	eventStream.merge.apply(null, tasks)
		.pipe(notify({message: 'Views task complete', onLast: true}));

    done();
}


/**
 * Images.
 *
 * Task for copying over all image resources to their destination folders.
 */
const imagesRootDir = [DATA_ROOT + 'images/', STATIC_SOURCE_ROOT + 'images/'];
const imagesDistDir = STATIC_DIST_ROOT + 'images/';

const imagesFilePaths = imagesRootDir.map(img => img + '**/*.{png,jpg,svg}');

function images(done) {
    src(imagesFilePaths)
        .pipe(dest(imagesDistDir))
        .pipe(notify({message: 'Images task complete', onLast: true}));
    done();
}


/**
 * PDFs.
 *
 * Task for copying over all PDFs to their destination folder.
 */
const pdfsRootDir = STATIC_SOURCE_ROOT + 'pdfs/';
const pdfsDistDir = STATIC_DIST_ROOT + 'pdfs/';

const pdfsFilePaths = pdfsRootDir + '**/*.pdf';

function pdfs(done) {
    src(pdfsFilePaths)
        .pipe(dest(pdfsDistDir))
        .pipe(notify({message: 'PDFs task complete', onLast: true}));
    done();
}

/**
 * TRACES.
 *
 * Task for copying over all PDFs to their destination folder.
 */
const tracesRootDir = STATIC_SOURCE_ROOT + 'traces/';
const tracesDistDir = STATIC_DIST_ROOT + 'traces/';

const tracesFilePaths = tracesRootDir + '*.zip';

function traces(done) {
    src(tracesFilePaths, { buffer: false })
        .pipe(dest(tracesDistDir))
        .pipe(notify({message: 'Traces task complete', onLast: true}));
    done();
}


/**
 * Favicon.
 *
 * Task for copying over the favicon over to the output directory.
 */
const faviconRootDir = STATIC_SOURCE_ROOT;
const faviconDistDir = STATIC_DIST_ROOT;

function favicon(done) {
    src(faviconRootDir + 'favicon.ico')
        .pipe(dest(faviconDistDir))
        .pipe(notify({message: 'Favicon task complete', onLast: true}));
    done();
}

/**
 * Clean.
 *
 * Deletes the built directory.
 */
function clean() {
    return del([STATIC_DIST_ROOT]);
}


/**
 * Development web-server task.
 *
 * For development purposes only (do not use in production!).
 */
const SERVER_PORT = 3333;

function webserver(done) {
    src('public/dist')
        .pipe(notify({message: 'Server starting on http://localhost:' + SERVER_PORT}))
        .pipe(webServer({
            livereload: true,
            port: SERVER_PORT,
            open: true
        }));
    done();
}


/**
 * Default task.
 *
 * Run by executing `gulp`.
 */
exports.default = series(
    clean, 
    parallel(styles, eslinting), 
    parallel(scripts, views, favicon, pdfs, traces, images)
);


/**
 * Watch task.
 *
 * Builds all resources and watches the source files for changes. Used during development to automatically recompile
 * files when you've changed them.
 */
function watching() {
    watch(stylesRootDir + '**/*.sass').on('change', styles());
    watch(scriptsRootDir + '**/*.js').on('change', scripts());
    watch(DATA_ROOT + '**/*.yml').on('change', views());
    watch(viewsRootDir + '**/*.pug').on('change', views());
    watch(imagesRootDir + '**/*.{png,jpg,svg}').on('change', images());
    watch(pdfsRootDir + '**/*.pdf').on('change', pdfs());    
}
exports.watch = watching;
exports.serve = webserver;