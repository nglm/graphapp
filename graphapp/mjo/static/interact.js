/**
 * Update the class of elements that should be selected
 *
 * @param {*} svgElem svg element inside the figure that we want to update
 * @param {*} ids ids of elements that should now be selected
 * @param {*} classSelected class of selected elements
 */
async function selectElems(svgElem, ids, classSelected){
    try {
        for (var id of ids) {
            svgElem.getElementById(id)
                .classList.add(classSelected);
        }
    } catch {}
}

/**
 * Update the class of elements that should be deselected
 *
 * @param {*} svgElem svg element inside the figure that we want to update
 * @param {*} classSelected class of selected elements
 * @param {*} classDefault class of non-selected elements
 */
async function deselectElems(
    svgElem, classSelected, classDefault=undefined,
){
    let to_deselect = svgElem.getElementsByClassName(classSelected);
    // For an unknown reason this "do..While" loop is necessary otherwise
    // only roughly half of the list is properly treated...
    do {
        for (var e of to_deselect) {
            e.classList.remove(classSelected);
        }
        to_deselect = svgElem.getElementsByClassName(classSelected);
    } while (to_deselect.length > 0)
}

/**
 * Remove all classes except the default one
 *
 * Note that this assume that the default one is already one of the class
 * of the elements we want to update
 *
 * @param {*} svgElem svg element inside the figure that we want to update
 * @param {*} classDefault class to which all elements should go back
 */
function setDefaultClass(svgElem, classDefault ) {
    // This will select everything as everything has the default class in
    // addition to more specific ones
    let to_deselect = svgElem.getElementsByClassName(classDefault);
    for (var e of to_deselect) {
        e.setAttribute("class", classDefault);
    }
}

/**
 * Update the class of elements that should be (de-)selected
 *
 * @param {*} svgElem svg element inside the figure that we want to update
 * @param {*} ids ids of elements that should now be selected
 * @param {*} classSelected class of selected elements
 * @param {*} classDefault class of non-selected elements
 */
async function updateSelection(
    svgElem, ids, classSelected, classDefault=undefined,
    {deselect = true, select = true} = {},
){
    if (select && deselect){
        await deselectElems( svgElem, classSelected, classDefault);
        await selectElems( svgElem, ids, classSelected);
    } else {
        if (deselect) {
            await deselectElems( svgElem, classSelected, classDefault);
        }
        if (select) {
            await selectElems( svgElem, ids, classSelected);
        }
    }
}

/**
 * Clear current selection of members/clusters by keeping only default class
 *
 * This function assumes that all members and clusters already have the
 * default class (but that they may have additional ones)
 *
 * @param {*} classClusterDefault Default class for clusters
 * @param {*} classMemberDefault Default class for members
 */
export function clearSelection(
    classClusterDefault="vertex", classMemberDefault="line",
){
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    for (let i = 0; i < figs.length; i++) {
        // Within the outter svg element of each fig, all ids are unique
        let svgElem = document.getElementById(figs[i].id + "_svg");
        setDefaultClass( svgElem, classClusterDefault);
        setDefaultClass( svgElem, classMemberDefault);
    }
}

export async function selectFile(){
    // Get current value
    var parser = new DOMParser();
    let f = document.getElementById("files").value;
    await $.get(
        "",                  // URL
        {                              // Additional data
            filename : f,
        },
        function(data) {       // Callback on success
            // "data" is the value returned by the python function
            $("#all-plots").html(data);
            return data
        })
        .fail(function(data, status) {
            console.log('Calling main failed', data, status);
            return data
        })
        .always(function(data) {
            return data
        })
}

/**
 * Helper function called to (de-)select members and clusters on cluster events
 * @param {*} e
 * @param {*} d
 * @param {*} clusterElem
 * @param {*} figElem DOM element of the "container-fig" that contains
 * the element that fired the event
 * @param {*} classClusterSelected
 * @param {*} classMemberSelected
 */
export function onEventClusterAux(
    e, d, clusterElem, figElem,
    classClusterSelected, classMemberSelected,
    {
        select = true, deselect = true,
        classClusterDefault=undefined, classMemberDefault=undefined,
    } = {}
) {
    // Get interactive group of the fig that fired the event
    let interactiveGroup = document.getElementById(figElem.id + "_input").value;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    // Correspondance between that v-event id and the v id
    let v_id = "v" + clusterElem.id.slice(7);

    for (let i = 0; i < figs.length; i++) {

        // Within the outter svg element of each fig, all ids are unique
        let svgElem = document.getElementById(figs[i].id + "_svg");

        // Consider current fig only if it is a relevant type
        // And in the same interactive group
        let groupId = document.getElementById(figs[i].id + "_input").value;
        let data_type = figs[i].getAttribute('data_type');

        // Deal with graph plots and their vertices
        if ((groupId == interactiveGroup) && (data_type === "entire_graph")){
            updateSelection(
                svgElem, [v_id], classClusterSelected, classClusterDefault,
                {select : select, deselect : deselect}
            );
        }

        if ((groupId == interactiveGroup) && (data_type === "relevant_graph")){

            updateSelection(
                svgElem, [v_id], classClusterSelected, classClusterDefault,
                {select : select, deselect : deselect}
            );
        }

        // Deal with spaghetti plots and their members
        if ((groupId == interactiveGroup) && (data_type === "members")){
            // ids of members in that cluster
            let m_ids = d.members.map((m) => ("m" + m));
            updateSelection(
                svgElem, m_ids, classMemberSelected, classMemberDefault,
                {select : select, deselect : deselect}
            );
        }
    }
}

export function onEventMemberAux(
    e, d, memberElem, figElem,
    classMemberSelected,
    {select = true, deselect = true, classMemberDefault = undefined} = {}
) {
    // Get interactive group of the fig that fired the event
    let interactiveGroup = document.getElementById(figElem.id + "_input").value;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    // Correspondance between that m-event id and the m id
    let m_id = "m" + memberElem.id.slice(7);

    for (let i = 0; i < figs.length; i++) {

        // Within the outter svg element of each fig, all ids are unique
        let svgElem = document.getElementById(figs[i].id + "_svg");

        // Consider current fig only if it is a relevant type
        // And in the same interactive group
        let groupId = document.getElementById(figs[i].id + "_input").value;
        let data_type = figs[i].getAttribute('data_type');

        // Deal with spaghetti plots and their members
        if ((groupId == interactiveGroup) && (data_type === "members")){
            // ids of members in that cluster
            updateSelection(
                svgElem, [m_id], classMemberSelected, classMemberDefault,
                {select : select, deselect : deselect}
            );
        }
    }
}