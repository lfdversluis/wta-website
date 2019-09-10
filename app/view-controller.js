/**
 * Controller responsible for compiling the views into static HTML.
 */

'use strict';

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

const pug = require('gulp-pug');
const rename = require('gulp-rename');
const strip = require('gulp-strip-comments');

const databaseController = require('./database-controller');


/**
 * Generates Gulp tasks for template compilation.
 *
 * @param gulp the Gulp instance to be used
 * @param rootDir the root directory of the templates to be compiled
 * @param distDir the destination directory in which to place the compiled HTML output
 * @returns {Array} an array of Gulp tasks.
 */
module.exports.generateViewTasks = (gulp, rootDir, distDir) => {
    const templateContexts = createTemplateContextsFromDB();

    const tasks = [];
    for (let context in templateContexts) {
        if (!templateContexts.hasOwnProperty(context)) {
            continue;
        }

        // Allow for custom names of output files and directories
        const templateName = templateContexts[context].templateName === undefined ?
            context : templateContexts[context].templateName;
        const directoryName = templateContexts[context].directoryName === undefined ?
            '' : templateContexts[context].directoryName;

        (viewName => {
            tasks.push(
                gulp.src(rootDir + templateName + '.pug')
                    .pipe(rename(path => {
                        path.basename = viewName;
                        path.extname = '.pug';
                    }))
                    .pipe(pug({
                        data: templateContexts[context],
                        pretty: true
                    }))
                    .pipe(strip())
                    .pipe(rename(path => {
                        if (templateContexts[context].htmlName) {
                            path.basename = templateContexts[context].htmlName;
                        }
                    }))
                    .pipe(gulp.dest(distDir + directoryName))
            );
        })(context);
    }
    
    // Add all the traces
    for (let trace_index in databaseController.database.traces) {
        tasks.push(
            gulp.src(rootDir + 'trace-details.pug')
                .pipe(pug({
                    data: {trace: databaseController.database.traces[trace_index]},
                    pretty: true
                }))
                .pipe(strip())
                .pipe(rename(path => {
                    path.basename = databaseController.database.traces[trace_index]['generic-info']['text']['id'];
                }))
                .pipe(gulp.dest(distDir))
        );
    }
    
    return tasks;
};


/**
 * Loads the database data into a set of context variables for template generation.
 *
 * @returns {Object} a database of context variables per view template.
 */
function createTemplateContextsFromDB() {
    databaseController.load();

    const templateContexts = {
        index: {
            pageTitle: 'Home',
            pageId: 'index',
            hosts: databaseController.database.partners.filter(partner => partner.types.indexOf('host') > -1),
            sponsors: databaseController.database.partners.filter(partner => partner.types.indexOf('sponsor') > -1),
            partners: databaseController.database.partners.filter(partner => partner.types.indexOf('partner') > -1),
            people: sortOnLastName(databaseController.database.people),
        },
        about: {
            pageTitle: 'About Us',
            pageId: 'about'
        },
        traceformat: {
            pageTitle: 'Trace Format',
            pageId: 'trace-format',
            templateName: 'trace-format'
        },
        people: {
            pageTitle: 'People',
            pageId: 'people',
            people: sortOnLastName(databaseController.database.people),
        },
        upload: {
            pageTitle: 'Uploading to the WTA',
            pageId: 'upload'
        },
        publications: generatePublicationsContext(databaseController.database.publications),
        talks: generateTalksContext(databaseController.database.talks),
        traces: generateTracesContext(databaseController.database.traces),
    };

    generateSinglePageContexts(templateContexts);

    return templateContexts;
}

function generateTracesContext(tracesList) {
    return {
        pageTitle: 'Traces',
        pageId: 'traces',
        traces: tracesList
    };
}

function generatePublicationsContext(publicationList) {
    const yearToPublications = {};

    publicationList.map((publication) => {
        if (yearToPublications[publication.releaseYear] === undefined) {
            yearToPublications[publication.releaseYear] = [];
        }

        yearToPublications[publication.releaseYear].push(publication);
    });

    const publicationsPerYear = [];

    for (let year in yearToPublications) {
        publicationsPerYear.push({
            year,
            publications: yearToPublications[year]
        });
    }

    publicationsPerYear.sort((a, b) => {
        return b.year - a.year;
    });

    return {
        pageTitle: 'Publications',
        pageId: 'publications',
        publicationsPerYear
    };
}

function generateTalksContext(talkList) {
    const yearToTalks = {};

    talkList.map((talk) => {
        if (yearToTalks[talk.year] === undefined) {
            yearToTalks[talk.year] = [];
        }

        yearToTalks[talk.year].push(talk);
    });

    const talksPerYear = [];

    for (let year in yearToTalks) {
        talksPerYear.push({
            year,
            talks: yearToTalks[year]
        });
    }

    talksPerYear.sort((a, b) => {
        return b.year - a.year;
    });

    return {
        pageTitle: 'Talks',
        pageId: 'talks',
        talksPerYear
    };
}


function generateSinglePageContexts(templateContexts) {
    for (let i = 0; i < databaseController.database.people.length; i++) {
        const person = databaseController.database.people[i];
        templateContexts['~' + person.id] = {
            pageTitle: person.firstName + ' ' + person.lastName,
            pageId: 'people',
            directoryName: person.id,
            templateName: 'person/index',
            htmlName: 'index',
            person
        };
    }
}

function sortOnLastName(people) {
    return people.sort((a, b) => {
        return compareStrings(a.lastName, b.lastName);
    });
}

function compareStrings(a, b) {
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else {
        return 0;
    }
}
