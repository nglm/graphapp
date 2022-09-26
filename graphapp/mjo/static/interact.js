export function onMouseMemberAux(e, d, memberElem, figElem, classname) {
    // Get interactive group of the fig that fired the event
    let interactiveGroup = document.getElementById(figElem.id + "_input").value;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    for (let i = 0; i < figs.length; i++) {
        // Check if the current fig belongs to the same interactive group
        let groupId = document.getElementById(figs[i].id + "_input").value
        if (groupId == interactiveGroup) {
            // Within the outter svg element of each fig, all ids are unique
            let svgElem = document.getElementById(figs[i].id + "_svg");
            // Change class of the member that has the same id
            try {
                let id = "m" + memberElem.id.slice(7);
                svgElem.getElementById(id)
                    .setAttribute("class", classname);
            }
            // (err is caught if this figure was actually cluster plot)
            catch(err) {}
        }
    }
}

export function onMouseClusterAux(e, d, clusterElem, figElem, classname1, classname2) {
    // Get interactive group of the fig that fired the event
    let interactiveGroup = document.getElementById(figElem.id + "_input").value;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    for (let i = 0; i < figs.length; i++) {
        // Check if the current fig belongs to the same interactive group
        let groupId = document.getElementById(figs[i].id + "_input").value
        if (groupId == interactiveGroup) {
            // Within the outter svg element of each fig, all ids are unique
            let svgElem = document.getElementById(figs[i].id + "_svg");
            try {
                // Correspondance between that v-event is the v id
                let id = "v" + clusterElem.id.slice(7);
                // Change class of the cluster that has the associated id
                svgElem.getElementById(id)
                    .setAttribute("class", classname1);
            }
            // (err is caught if this figure was actually spaghetti plot)
            catch(err) {}
            // Change class of all members in that cluster
            for (var m of d.members) {
                try {
                    svgElem.getElementById("m" + m)
                        .setAttribute("class", classname2);
                }
                // (err is caught if this figure was actually cluster plot)
                catch(err) {}
            }
        }
    }
}


export function onClickAux(e, d, kElem, figElem, k) {
    // Get interactive group of the fig that fired the event
    let interactiveGroup = document.getElementById(figElem.id + "_input").value;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    for (let i = 0; i < figs.length; i++) {
        // Check if the current fig belongs to the same interactive group
        let groupId = document.getElementById(figs[i].id + "_input").value
        if (groupId == interactiveGroup) {
            // Within the outter svg element of each fig, all ids are unique
            let svgElem = document.getElementById(figs[i].id + "_svg");
            try {
                // find all k-opt elements
                let k_opts = svgElem.getElementsByClassName("k-optionO");

                // Define their class according to the selected k
                for (var k_opt of k_opts) {
                    try {
                        let k_curr = parseInt(k_opt.getAttribute('k'));
                        let t_curr = parseInt(k_opt.getAttribute('time_step'));
                        if (k_curr === k[t_curr]) {
                            k_opt.setAttribute("class", "k-optionOSelected");
                        } else {
                            k_opt.setAttribute("class", "k-optionO");
                        }
                    // (err is caught if this figure was not a relevant plot)
                    } catch(err) {}
                }
            }
            // (err is caught if this figure  was not a relevant plot)
            catch(err) {}
        }
    }
}