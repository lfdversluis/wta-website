/**
 * Database Controller, responsible for loading and populating user-defined data from YAML files.
 */

'use strict';

const readYaml = require('read-yaml');

const dataFiles = ['people', 'traces', 'publications', 'talks', 'partners'];
module.exports.dataFiles = dataFiles;

module.exports.load = () => {
    const database = {};
    dataFiles.forEach(fileName => {
        database[fileName] = readYaml.sync('./wta-data/' + fileName + '.yml', err => {
            console.log(err);
        });
    });

    module.exports.database = database;
};
