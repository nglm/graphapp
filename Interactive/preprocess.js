export function d3fy_meteogram(data) {

    var data_xy = []; // start empty, add each element one at a time
    var xy = [];

    for (var j = 0; j < data.members.length; j++ ) {
        xy = [];
        for(var i = 0; i < data.time.length; i++ ) {
            xy.push({m: data.members[j][0][i], t: data.time[i]});
        }
        data_xy.push(xy)
    }
    return data_xy
}

export function d3fy_mjo(data) {

    var data_xy = []; // start empty, add each element one at a time
    var xy = [];

    for (var j = 0; j < data.members.length; j++ ) {
        xy = [];
        for(var i = 0; i < data.time.length; i++ ) {
            xy.push({
                rmm1: data.members[j][0][i],
                rmm2: data.members[j][1][i],
                t: data.time[i],
            });
        }
        data_xy.push(xy)
    }
    return data_xy
}