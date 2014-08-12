// Dependencies ---------------------------------------------------------------
// ----------------------------------------------------------------------------
var fs = require('fs'),
    Compiler = require('./lib/Compiler');


// Command Line Interface------------------------------------------------------
// ----------------------------------------------------------------------------
var args = process.argv.slice(2),
    options = {
        outfile: 'game.gb',
        optimize: false,
        mapfile: null,
        symfile: null,
        jsonfile: null,
        silent: false,
        version: false,
        verbose: false,
        help: false,
        files: []
    };

for(var i = 0, l = args.length; i < l; i++) {
    var arg = args[i];
    switch(arg) {
        case '-o':
        case '--outfile':
            options.outfile = getString(arg, args, ++i);
            break;

        case '-O':
        case '--optimize':
            options.optimize = true;
            break;

        case '-m':
        case '--mapfile':
            options.mapfile = getString(arg, args, ++i);
            break;

        case '-s':
        case '--symfile':
            options.symfile = getString(arg, args, ++i);
            break;

        case '-S':
        case '--silent':
            options.silent = true;
            break;

        case '-j':
        case '--jsonfile':
            options.jsonfile = getString(arg, args, ++i);
            break;

        case '--version':
            options.version = true;
            break;

        case '-v':
        case '--verbose':
            options.verbose = true;
            break;

        case '--help':
            options.help = true;
            break;

        default:
            if (arg.substring(0, 1) === '-') {
                error('Unknown option: ' + arg);

            } else {
                options.files.push(arg);
            }
            break;

    }
}

// Version Information
if (options.version) {
    process.stdout.write('v0.0.5\n');

} else if (options.help) {
    usage();

// Compile Files
} else if (options.files.length) {

    // Compile
    var c = new Compiler(options.silent, options.verbose);
    c.compile(options.files);

    // Optimize
    if (options.optimize) {
        c.optimize();
    }

    // Generate ROM image
    var rom = c.generate();
    if (options.outfile === 'stdout') {
        process.stdout.write(rom);

    } else {
        fs.writeFileSync(options.outfile, rom);
    }

    // Generate symbol file
    if (options.symfile) {
        if (options.symfile === 'stdout') {
            process.stdout.write(c.symbols(true));

        } else {
            fs.writeFileSync(options.symfile, c.symbols(false));
        }
    }

    // Generate mapping file
    if (options.mapfile) {
        if (options.mapfile === 'stdout') {
            process.stdout.write(c.mapping(true));

        } else {
            fs.writeFileSync(options.mapfile, c.mapping(false));
        }
    }

    // Generate json dump file
    if (options.jsonfile) {
        if (options.jsonfile === 'stdout') {
            process.stdout.write(c.json());

        } else {
            fs.writeFileSync(options.jsonfile, c.json());
        }
    }

// Usage
} else {
    usage();
}


// Helpers --------------------------------------------------------------------
function getString(name, args, index) {

    var s = args[index];
    if (s === undefined || s.substring(0, 1) === '-') {
        error('Expected string argument for ' + name);

    } else {
        return s;
    }

}

function usage() {
    process.stdout.write([
        'Usage: gbasm [options] [sources]',
        '',
        '   --outfile, -o <s>: The name of the output rom file (default: game.gb)',
        '      --optimize, -O: Enable instruction optimizations',
        '   --mapfile, -m <s>: Generates a ASCII overview of the mapped ROM space',
        '   --symfile, -s <s>: Generates a symbol map compatible with debuggers',
        '  --jsonfile, -j <s>: Generates a JSON data dump of all sections with their data, labels, instructions etc.',
        '        --silent, -S: Surpresses all logging',
        '       --verbose, -v: Turn on verbose logging',
        '       --version, -V: Displays version information',
        '              --help: Displays this help text'
    ].join('\n') + '\n');
}

function error(message) {
    process.stdout.write('Error: ' + message + '\n');
    process.exit(1);
}

