# WTA Site

Static site generator for the website of the workflow trace archive.


## Getting everything up and running
* Clone this repo
* Download and install the [Node.js environment](https://nodejs.org/en/download/)
* Download and install the [Yarn Package Manager](https://yarnpkg.com)
* Run `yarn` in a terminal of your choice to fetch and install all dependencies
* Run `yarn global add gulp` to be able to execute the build process for this site in the terminal
* Run `gulp` to build the site. On Linux (as root), you can find `gulp` in `/usr/local/share/.config/yarn/global`. On Linux (non-root) and on OSX, you can find `gulp` in `~/.config/yarn/global`. On Windows, run `%LOCALAPPDATA%/Yarn/bin/gulp.cmd` (in `PowerShell` or `cmd`) or `%LOCALAPPDATA%/Yarn/bin/gulp` to boot up `cygwin` in a window; `%LOCALAPPDATA%` translates to `C:\Users\{username}\AppData\Local\`. 

All generated assets (HTML, CSS, JS, PNG, ...) will be located in the `public/dist` folder. This is the folder that should be served by any standard static file server. 

For development purposes, a static server is already included (not to be used in production, however). See the corresponding section below for details.


## Setting up data resources
The website build system generates static content at compile-time, based on a database of YAML files and images. These are separated from the main source code, because they represent one instance of deployment of this website system.

All these files are included in the `wta-data` folder. This folder includes all YAML files in its root, as well as an `images` sub-folder.

### Updating the data resources
To make a change to the information contained in the `wta-data` folder, please propose the change in the git repository.

### YAML data
Textual content is stored in a structured, machine-readable way through the YAML format. To standardize the way in which this data is stored, we specified YAML schemas. These adhere to the official [JSON Schema standard](http://json-schema.org/) (click on the link to find out more about this specification format). 

You can find these specifications in the `schemas` folder. Our site compiler expects one corresponding YAML file in the data directory for each schema, without the `.schema` extension (e.g. for the `publications.schema.yml` file, create a `publications.yml` file in the data directory).

In case you're getting an error during the build process, it may be due to the fact that we're actually checking the YAML files for the right structure. The build system will validate these YAML files against the schemas, just to make sure that, if something goes wrong in parsing it later on, it's our mistake ;).


### Generating YAML schemas

To generate yaml schemas you can run the `generate_datasets_pages.py` script in the [`wta-tools` repository](https://github.com/atlarge-research/wta-tools).

### Image data
Any picture file that does not belong to the core set of unchanging image assets should be placed in an `images` folder. We categorize them into sub-folders, according to their type:

#### People
Place portraits of team members into a `people` folder. For each member, place two PNG files in the folder - both versions of the *same* picture, just in different sizes:

* One called `[member-id]_small.png` (dimensions: `128x128`)
* One called `[member-id]_large.png` (dimensions: `256x256`)

The `[member-id]` placeholder should be replaced with the identifier of a team member, as listed in the `people.yml` file.


## Development Server
A static server is included for development purposes only (*not suited for use in production*). It features 'hot reloading', meaning that any changes made in the file system are directly reloaded in the browser.

To run it, issue the following command on a standard command prompt / terminal: `gulp serve`. All compiled content will now be available at <http://localhost:3333> in the browser of your choice. To use this during development, run the watch task first, and then run the server command in a separate terminal window. That way, any changes you make to the templates / YAML files will immediately be reloaded in the browser.

If you do not want to have to manually recompile the entire codebase when you make a change, run `gulp watch` in parallel to `gulp serve`. Any changes you make to source files will then trigger a recompile, automatically.


## Contributing
See `CONTRIBUTING.md` for information on how to contribute to this repo.
