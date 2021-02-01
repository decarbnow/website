import 'leaflet';

let iconsInfo = {
    pollution:  {
        fonticon: "nf nf-mdi-periodic_table_co2",
        cssname: "pollution",
        title: "Pollution",
        question: "Who pollutes our planet?",
        desc: "Register and pinpoint polluters."
    },
    climateaction: {
        //fonticon: "fa fa-bullhorn",
        fonticon: "nf nf-fa-twitter",
        cssname: "action",
        title: "Climate Action",
        question: "Who took action?",
        desc: "Locate climate action to accelerate change."
    },
    transition: {
        fonticon: "nf nf-mdi-lightbulb_on",
        cssname: "transition",
        title: "Transition",
        question: "Who takes the first step?",
        desc: "Making climate transition initiatives visible."
    }
};

let icons = {};
Object.keys(iconsInfo).forEach((k) => {
    let i = iconsInfo[k];
    icons[k] = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class='marker-pin ${i.cssname}'></div><i class='${i.fonticon} ${i.cssname}'>`,
        iconSize: [20, 34],
        //iconAnchor: [12, 34]
        iconAnchor: [10, 10]
    });
});

export {
    iconsInfo,
    icons
};
