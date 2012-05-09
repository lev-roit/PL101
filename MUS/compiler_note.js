
var endTime = function (time, expr) {
    if (expr.tag == 'note' || expr.tag == 'rest')
        return time + expr.dur;
    else if (expr.tag == 'seq')
        return endTime(endTime(time, expr.left), expr.right);
    else
        return Math.max(endTime(time, expr.left), endTime(time, expr.right));
};


var compile1 = function (time, expr) {
    var notes = [];

    if (expr.tag == 'note')
        notes = [{tag: 'note', pitch: expr.pitch, start: time, dur: expr.dur}];
    else if (expr.tag == 'rest')
        notes = [{tag: 'rest', start: time, dur: expr.dur}];
    else {
        var time1 = (expr.tag == 'seq') ? endTime(time, expr.left) : time;

        notes = compile1(time, expr.left).concat(compile1(time1, expr.right));
    }
    //
    //console.log("Notes:");
    //console.log(notes);

    return notes;
};


var compile = function (musexpr) {
    return compile1(0, musexpr);
};

//var melody_mus = 
//    { tag: 'seq',
//      left: 
//       { tag: 'seq',
//         left: { tag: 'note', pitch: 'a4', dur: 250 },
//         right: { tag: 'note', pitch: 'b4', dur: 250 } },
//      right:
//       { tag: 'seq',
//         left: { tag: 'note', pitch: 'c4', dur: 500 },
//         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

var melody_mus = {
    tag: 'seq',
    left: {
        tag: 'seq',
        left: { tag: 'rest',  dur: 700 },
        right: {
            tag: 'par',
            left: { tag: 'note', pitch: 'c3', dur: 250 },
            right: { tag: 'note', pitch: 'g4', dur: 500 }
        }
    },
    right: {
        tag: 'par',
        left: { tag: 'note', pitch: 'd3', dur: 500 },
        right: { tag: 'note', pitch: 'f4', dur: 250 }
    }
};

var melody_note = [
    { tag: 'rest',              start: 0,    dur: 700 },
    { tag: 'note', pitch: 'c3', start: 700,  dur: 250 },
    { tag: 'note', pitch: 'g4', start: 700,  dur: 500 },
    { tag: 'note', pitch: 'd3', start: 1200, dur: 500 },
    { tag: 'note', pitch: 'f4', start: 1200, dur: 250 } ];

console.log(melody_mus);
console.log(compile(melody_mus));
