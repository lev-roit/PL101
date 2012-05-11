var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var parser_data = fs.readFileSync('scheem.peg', 'utf-8');

// Show the PEG grammar file
console.log(parser_data);

// Create my parser
var parse = PEG.buildParser(parser_data).parse;

// Do a test
var data = fs.readFileSync('test.sch', 'utf-8');

console.log(data);

// Show the parsed data
var parse_tree = parse(data);
console.log(parse_tree);

//assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );
