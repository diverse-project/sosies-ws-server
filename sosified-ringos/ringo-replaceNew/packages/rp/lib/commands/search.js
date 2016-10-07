var term = require("ringo/term");
var registry = require("../utils/registry");
var dates = require("ringo/utils/dates");
var {Parser} = require("ringo/args");
var descriptors = require("../utils/descriptors");

//argument parser
var parser = new Parser();
parser.addOption("v", "verbose", null, "Display extensive information");

exports.description = "Search for packages in registry";

exports.help = function help() {
    term.writeln("\n" + exports.description, "\n");
    term.writeln("Usage:");
    term.writeln("  rp search [keyword ...]\n");
    term.writeln("Options:");
    term.writeln(parser.help());
    return;
};

exports.search = function search(args) {
    var opts = {};
    try {
        parser.parse(args, opts);
    } catch (e) {
        term.writeln(term.RED, e.message, term.RESET);
        term.writeln("Available options:");
        term.writeln(parser.help());
        return;
    }
    searchPackages(args, opts.verbose === true);
    return;
};

function searchPackages(args, verbose) {
    var result = registry.search(args.join(" "));
    if (result.total > 0) {
        term.writeln();
        for each (var descriptor in result.hits) {
            var modified = dates.parse(descriptor.modified);
            term.writeln(" ", term.BOLD, descriptor.name, term.RESET,
                     "-", descriptor.description || "(no description available)");
            if (verbose === true) {
                term.writeln("    Version:", descriptor.latest);
                term.writeln("    Author:", descriptor.author.name);
                term.writeln("    Last update:", dates.format(modified, "EEEE dd.MM.yyyy, HH:mm"));
                if (descriptors.hasEngineDependency(descriptor)) {
                    term.writeln("    Engines:");
                    Object.keys(descriptor.engines).sort().forEach(function(engineName) {
                        term.writeln("     ", engineName, descriptor.engines[engineName]);
                    });
                }
                if (descriptor.hasOwnProperty("dependencies")) {
                    term.write("    Dependencies:");
                    var deps = Object.keys(descriptor.dependencies);
                    if (deps.length > 0) {
                        term.writeln();
                        deps.sort().forEach(function(depName) {
                            term.writeln("     ", depName, descriptor.dependencies[depName]);
                        });
                    } else {
                        term.writeln(" none");
                    }
                }
                if (descriptor.hasOwnProperty("licenses") && descriptor.licenses.length > 0) {
                    term.writeln("    Licenses:");
                    descriptor.licenses.forEach(function(license) {
                        term.writeln("     ", license.type);
                    });
                }
                term.writeln();
            }
        };
        if (!verbose) {
            term.writeln();
        }
    } else {
        term.writeln("\nNo packages found\n");
    }
    return;
}
