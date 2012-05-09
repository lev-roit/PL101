
var endTime = function (expr, time) {
    if (expr.tag == 'note' || expr.tag == 'rest')
        return time + expr.dur;
    else if (expr.tag == 'repeat')
        return time + expr.count * endTime(expr.section, 0);
    else if (expr.tag == 'seq')
        return endTime(expr.right, endTime(expr.left, time));
    else
        return Math.max(endTime(expr.left, time), endTime(expr.right, time));
};


var letterPitch = {'a': 9, 'b': 11, 'c': 0, 'd': 2, 'e': 3, 'f': 5, 'g': 7};


var convertPitch = function (pitch) {
    return 12 * (Number(pitch[1]) + 1) + letterPitch[pitch[0].toLowerCase()];
}


var compile = function (expr, time) {
    var notes = [];

    time = time || 0;
    
    if (expr.tag == 'note')
        notes = [{tag: 'note', pitch: convertPitch(expr.pitch), start: time, dur: expr.dur}];
    else if (expr.tag == 'rest')
        notes = [{tag: 'rest', start: time, dur: expr.dur}];
    else if (expr.tag == 'repeat') {
        var time_interval = endTime(expr.section, 0);

        for (var i = 0; i < expr.count; i++, time += time_interval)
            notes = notes.concat(compile(expr.section, time));
    }
    else {
        var time1 = (expr.tag == 'seq') ? endTime(expr.left, time) : time;

        notes = compile(expr.left, time).concat(compile(expr.right, time1));
    }
    //
    //console.log("Notes:");
    //console.log(notes);

    return notes;
};


var melody_mus = {
    tag: 'seq',
    left: {
        tag: 'seq',
        left: {
            tag: 'repeat',
            section: {tag: 'rest',  dur: 700 },
            count: 2
        },
        right: {
            tag: 'par',
            left: { tag: 'note', pitch: 'c3', dur: 250 },
            right: { tag: 'note', pitch: 'g4', dur: 500 }
        }
    },
    right: {
        tag: 'repeat',
        section: {
            tag: 'par',
            left: { tag: 'note', pitch: 'd3', dur: 500 },
            right: { tag: 'note', pitch: 'f4', dur: 250 }
        },
        count: 5
    }
};

console.log(melody_mus);
console.log(compile(melody_mus));
