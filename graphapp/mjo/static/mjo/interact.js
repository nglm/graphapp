/**
 * Add classSelected to the list of given elements
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
 * Find 'classSelected' elements and remove their classSelected class
 *
 * This assume that elements already have a default class, that remains when
 * they are not selected
 *
 * @param {*} svgElem svg element inside the figure that we want to update
 * @param {*} classSelected class of selected elements
 */
async function deselectElems(
    svgElem, classSelected
){
    let to_deselect = svgElem.getElementsByClassName(classSelected);
    let deselected = [...to_deselect].map(x => x.id)
    // For an unknown reason this "do..While" loop is necessary otherwise
    // only roughly half of the list is properly treated...
    do {
        for (var e of to_deselect) {
            e.classList.remove(classSelected);
        }
        to_deselect = svgElem.getElementsByClassName(classSelected);
    } while (to_deselect.length > 0)
    return deselected;
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
 */
async function updateSelection(
    svgElem, ids, classSelected,
    {deselect = true, select = true} = {},
){
    let deselected;
    // First deselect all already selected elements (w/ 'classSelected' class)
    // And then select only those which were given (add 'classSelected' class)
    if (select && deselect){
        deselected = await deselectElems( svgElem, classSelected );
        await selectElems( svgElem, ids, classSelected );
    } else {
        if (deselect) {
            deselected = await deselectElems( svgElem, classSelected );
        }
        if (select) {
            await selectElems( svgElem, ids, classSelected );
        }
    }
    return deselected
}

/**
 * Toggle visibility property of topbar elements
 */
export function toggleTopbar(){
    $("#time-window-container").toggle();
    $("#time_representation-container").toggle();
    $("#data_representation-container").toggle();
    $("#scores-container").toggle();
    $("#methods-container").toggle();
}

/**
 * Switch one class for another
 */
export async function switchClasses(
    switchId="members-switch-thick",
){
    let classes = [
        "line", "lineClustered", "lineClicked", "lineIntersection",
        "lineHovered", "lineClusterHovered"
    ];
    // Check if switch is on
    let isOn = document.getElementById(switchId).checked;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");

    for (let c of classes) {

        let classToSelect = c;
        let classToDeselect = c + "-thick";
        if (isOn) {
            classToSelect = c + "-thick";;
            classToDeselect = c;
        }

        for (let i = 0; i < figs.length; i++) {
            // Within the outter svg element of each fig, all ids are unique
            let svgElem = document.getElementById(figs[i].id + "_svg");
            let data_type = figs[i].getAttribute('data_type');
            if (data_type === "members") {
                let deselected = await deselectElems(svgElem, classToDeselect);
                await selectElems(svgElem, deselected, classToSelect);
            }
        }
    }
}

/**
 * Toggle time markers
 */
export async function switchMarkers(
    data_type = "members"
){
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    for (let i = 0; i < figs.length; i++) {
        // Within the outter svg element of each fig, all ids are unique
        if (figs[i].getAttribute('data_type') === data_type) {
            let selector = '#' + figs[i].id + " " + ".time-marker"
            $(selector).toggle();
        }
    }
}

/**
 * Find the different HTML element that stores the selected members and
 * clear them
 */
export function clearStoredSelection(){
    $("#accumulation").html("");
    $("#intersection").html("");
    $("#check-intersection").attr("m_ids", "-1");
    $("#check-accumulation").attr("m_ids", "-1");
    // Update the displayed number of member selected
    $("#member_selected").html("0");
    // Update the slider position
    // Remember that the "value" property is special, so use .value
    // instead of .attr("value")
    document.getElementById("members_range").value = "0";
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

    if (document.getElementById("members-switch-thick").checked) {
        classMemberDefault = classMemberDefault + "-thick";
        //classClusterDefault = classClusterDefault + "-thick";
    }
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    for (let i = 0; i < figs.length; i++) {
        // Within the outter svg element of each fig, all ids are unique
        let svgElem = document.getElementById(figs[i].id + "_svg");
        setDefaultClass( svgElem, classClusterDefault);
        setDefaultClass( svgElem, classMemberDefault);
    }
}

export async function selectOption(){
    // Get current value
    let f = document.getElementById("files").value;
    let m = document.getElementById("methods").value;
    let s = document.getElementById("scores").value;
    let drep = document.getElementById("data_representation").value;
    let trep = document.getElementById("time_representation").value;
    let w = document.getElementById("windows").value;
    await $.get(
        "",                  // URL
        {                              // Additional data
            filename : f,
            method : m,
            score : s,
            drepresentation : drep,
            trepresentation : trep,
            time_window : w,
        },
        function(data) {       // Callback on success
            // Django send an evaluation of the template (so with the right
            // context values) but without evaluating the javascript inline scripts (so what generate plots)
            // This jQuery method "html" evaluates the raw html sent by django
            // in order to run inline scripts and put this into the
            // "#all-plots" div
            // Note that we only process the "plots.html" part of the template
            // and re-evaluate only the content of the "#all-plots" div
            $("#all-plots").html(data);
            return data
        })
        .fail(function(data, status) {
            console.log('Calling main after selectOption failed', data, status);
            return data
        })
        .always(function(data) {
            return data
        })
}

export function updateSliderValue(rangeId, valueId){
    // Find value of the slider
    // Remember that the "value" property is special, so use .value
    // instead of .attr("value")
    let value = document.getElementById(rangeId).value;
    // Update the text
    $("#" + valueId).html(value);
}


/**
 * Function associated with the member slider
 */
export function sliderMember(classMemberSelected) {
    let figs = document.getElementsByClassName("container-fig");
    // Correspondence between the range value and the m id
    let m_id = "m" + document.getElementById('members_range').value;
    if (document.getElementById("members-switch-thick").checked) {
        classMemberSelected = classMemberSelected + "-thick";
    }

    for (let i = 0; i < figs.length; i++) {

        // Within the outer svg element of each fig, all ids are unique
        let svgElem = document.getElementById(figs[i].id + "_svg");

        // Consider current fig only if it is a relevant type
        let data_type = figs[i].getAttribute('data_type');

        // Deal with spaghetti plots and their members
        if (data_type === "members"){
            // ids of members in that cluster
            updateSelection(
                svgElem, [m_id], classMemberSelected,
                {select : true, deselect : true}
            );
        }
    }
}

/**
 * Helper function called to (de-)select members and clusters on cluster events
 * @param {*} e
 * @param {*} d
 * @param {*} clusterElem
 * @param {*} figElem DOM element of the "container-fig" that contains
 * the element that fired the event
 * @param {*} classClusterSelected class of selected cluster elements (e.g. clicked or hovered?)
 * @param {*} classMemberSelected class of selected member elements
 */
export async function onEventClusterAux(
    e, d, clusterElem, figElem,
    classClusterSelected, classMemberSelected,
    {
        select = true, deselect = true,
        intersection = false, accumulation = false,
        show_cluster_content = true,
        classMemberIntersection = "lineIntersection",
    } = {}
) {
    // Get interactive group of the fig that fired the event
    let interactiveGroup = document.getElementById(figElem.id + "_input").value;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    // Correspondence between that v-event id and the v id
    let v_id = "v" + clusterElem.id.slice(7);
    // ids of members in that cluster
    let m_ids = d.members.map((m) => ("m" + m));
    if (document.getElementById("members-switch-thick").checked) {
        classMemberSelected = classMemberSelected + "-thick";
        classMemberIntersection = classMemberIntersection + "-thick";
    }

    // Find current intersection of cluster
    let m_inter_ids = [];
    if (intersection) {

        // intersection ids are stored in the "intersection" element
        let interCheckElem = document.getElementById("check-intersection");
        m_inter_ids = interCheckElem.getAttribute("m_ids").split(",");

        // If there was no selection before, then the intersection is
        // the current selection
        if (m_inter_ids[0] == '-1') {
            m_inter_ids = [...m_ids];
        // Otherwise, its the intersection of the prev intersection and the
        // current selection
        } else {
            m_inter_ids = m_inter_ids.filter(m_id => m_ids.includes(m_id));
        }
        // Update attribute
        interCheckElem.setAttribute("m_ids", m_inter_ids);
    }

    // Find current union of members
    let m_acc_ids = [];
    if (accumulation) {

        // accumulation ids are stored in the "accumulation" element
        let unionCheckElem = document.getElementById("check-accumulation");
        // Create a new HTML element as an item

        m_acc_ids = unionCheckElem.getAttribute("m_ids").split(",");

        // If there was no selection before, then the union is
        // the current selection
        if (m_acc_ids[0] == '-1') {
            m_acc_ids = [...m_ids];
        // Otherwise, its the union of the prev union and the
        // current selection
        } else {
            m_acc_ids = m_acc_ids.concat(m_ids)
        }
        // Update attribute
        unionCheckElem.setAttribute("m_ids", m_acc_ids);
    }

    // Show what is inside the selected cluster before
    if (show_cluster_content){

        // ----- accumulation -----
        let accjQ = $("#accumulation");
        let itemElem = document.createElement( "li" );
        $(itemElem).text(m_ids.map((m) => m.slice(1)));
        // If we take clusters one by one, remove what was there first
        if (!(intersection || accumulation)) {
            accjQ.empty();
        }
        // Add an item with the members in that cluster
        accjQ.append(itemElem);

        // ----- intersection -----
        // Find all the children of accumulation
        let clusters = document.getElementById("accumulation").children;
        clusters = [...clusters]
        clusters = clusters.map(elem => (elem.textContent.split(",")));
        // Intersection of multiple array. Found on the internet
        let inter = clusters.reduce((a, b) => a.filter(c => b.includes(c)));
        $("#intersection").text(inter);
    }

    for (let i = 0; i < figs.length; i++) {

        // Within the outer svg element of each fig, all ids are unique
        let svgElem = document.getElementById(figs[i].id + "_svg");

        // Consider current fig only if it is a relevant type
        // And in the same interactive group
        let groupId = document.getElementById(figs[i].id + "_input").value;
        let data_type = figs[i].getAttribute('data_type');

        // Deal with graph plots and their vertices
        if (
            (groupId == interactiveGroup)
            && (data_type === "entire_graph" || data_type === "relevant_graph")
        ){
            await updateSelection(
                svgElem, [v_id], classClusterSelected,
                {select : select, deselect : !(intersection || accumulation)}
            );
        }

        // Deal with spaghetti plots and their members
        if ((groupId == interactiveGroup) && (data_type === "members")){

            // Add the selected class to the right members
            await updateSelection(
                svgElem, m_ids, classMemberSelected,
                {select : select, deselect : !accumulation}
            );

            // Add the intersection class to the right members
            if (intersection){
                await updateSelection(
                    svgElem, m_inter_ids, classMemberIntersection,
                    {select : select, deselect : true}
                );
            }
        }
    }
}

export function onEventMemberAux(
    e, d, memberElem, figElem,
    classMemberSelected,
    {
        select = true, deselect = true,
        accumulation = false,
    } = {}
) {
    // Get interactive group of the fig that fired the event
    let interactiveGroup = document.getElementById(figElem.id + "_input").value;
    // Find all figures in the document
    let figs = document.getElementsByClassName("container-fig");
    // Correspondence between that m-event id and the m id
    let m_id = "m" + memberElem.id.slice(7);
    if (document.getElementById("members-switch-thick").checked) {
        classMemberSelected = classMemberSelected + "-thick";
    }

    // // Find current union of members
    // let m_acc_ids = [];
    // if (accumulation) {

    //     // accumulation ids are stored in the "accumulation" element
    //     let unionElem = document.getElementById("accumulation");
    //     m_acc_ids = unionElem.getAttribute("m_ids").split(",");

    //     // If there was no selection before, then the union is
    //     // the current selection
    //     if (m_acc_ids[0] == '') {
    //         m_acc_ids = [m_id];
    //     // Otherwise, its the union of the prev union and the
    //     // current selection
    //     } else {
    //         m_acc_ids = m_acc_ids.concat([m_id])
    //     }
    //     // Update attribute
    //     unionElem.setAttribute("m_ids", m_acc_ids);
    // }

    for (let i = 0; i < figs.length; i++) {

        // Within the outer svg element of each fig, all ids are unique
        let svgElem = document.getElementById(figs[i].id + "_svg");

        // Consider current fig only if it is a relevant type
        // And in the same interactive group
        let groupId = document.getElementById(figs[i].id + "_input").value;
        let data_type = figs[i].getAttribute('data_type');

        // Deal with spaghetti plots and their members
        if ((groupId == interactiveGroup) && (data_type === "members")){
            // ids of members in that cluster
            // if deselect == False then we never deselect, regardless of acc
            // if deselect == true but "acc" then we don't deselect
            // if deselect == true and "!acc" then we deselect
            // => we deselect only if deselect and "!acc"
            updateSelection(
                svgElem, [m_id], classMemberSelected,
                {select : select, deselect : (deselect && !accumulation)}
            );
        }
    }
}