/**
 * Module for validating JSON data files.
 */

'use strict';

const yaml = require('gulp-yaml');
const readYaml = require('read-yaml');
const jsonSchema = require('gulp-json-schema');
const through = require('through2');
const gulpUtil = require('gulp-util');


const dataFileNames = require('./database-controller').dataFiles;

/**
 * Generates Gulp tasks for YAML data validation.
 *
 * @param gulp the Gulp instance to be used
 * @param schemaRootDir the root directory of the JSON schema files
 * @param dataRootDir the root directory of the YAML data files
 * @returns {Array} an array of Gulp tasks.
 */
module.exports.generateValidationTasks = (gulp, schemaRootDir, dataRootDir) => {
    return dataFileNames.map(fileName => {
        return gulp.src(dataRootDir + fileName + '.yml')
            .pipe(yaml())
            .pipe(jsonSchema({schema: readYaml.sync(schemaRootDir + fileName + '.schema.yml')}))
            .pipe(uniquenessValidator())
            .on('error', e => {
                gulpUtil.log(gulpUtil.colors.red('Error while validating JSON:\n'), e.message);
            });
    });
};


/**
 * Checks the piped JSON file for duplicates and throws an error if any such duplicate is encountered.
 *
 * @returns a Gulp pipe-able task.
 */
function uniquenessValidator() {
    return through.obj((file, enc, callback) => {
        const jsonContent = JSON.parse(file.contents);

        const pathTokens = file.path.split('\\');
        const fileName = pathTokens[pathTokens.length - 1];
        gulpUtil.log('Validating uniqueness of keys in', gulpUtil.colors.cyan(fileName));

        if (jsonContent instanceof Array) {
            const ids = jsonContent.map(element => element.id);

            ids.sort();

            for (let i = 0; i < ids.length; i++) {
                if (i < ids.length - 1 && ids[i] === ids[i + 1]) {
                    callback(new Error('Duplicate IDs found in ' + gulpUtil.colors.cyan(fileName)
                        + '. Object IDs must be unique in their JSON array. First duplicate found: ' + ids[i]));
                    return;
                }
            }
        }

        gulpUtil.log('Uniqueness validation successful');
        callback();
    });
}
