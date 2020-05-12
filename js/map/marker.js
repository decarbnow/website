import 'leaflet';
import base from "./base.js";


let icons = {
    pollution:  {
        fonticon: "nf nf-mdi-periodic_table_co2",
        cssname: "pollution",
        title: "Pollution",
        question: "Who pollutes our planet?",
        desc: "Register and pinpoint polluters."
    },
    climateaction: {
        fonticon: "fa fa-bullhorn",
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


L.Control.Markers = L.Control.extend({
    onAdd: function(map) {
        let markerControls = L.DomUtil.create('div');
        markerControls.style.width = '400px';
        markerControls.style.height = '24px';
        markerControls.style.backgroundColor = '#fff';
        markerControls.style.display = 'flex';
        markerControls.style.flexDirection = 'row';
        markerControls.style.justifyContent = 'space-evenly';
        markerControls.style.alignItems = 'center';
        markerControls.style.paddingBottom = "0px";
        //markerControls.classList.add("leaflet-bar");


        Object.keys(icons).forEach(markerKey => {
            let marker = icons[markerKey];
            let markerContainer = L.DomUtil.create('div');
            markerContainer.innerHTML = '<div class="bubble ' + marker.cssname +'"><i class="' + marker.fonticon + '"></i></div> ' + marker.title;
            markerContainer.title = marker.question + " " + marker.desc;
            markerControls.append(markerContainer);
            //console.log(markerContainer);
        });

        return markerControls;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.markers = function(opts) {
    return new L.Control.Markers(opts);
};


export default function getIcon(type) {
    let i = icons[type];
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class='marker-pin ${i.cssname}'></div><i class='${i.fonticon} ${i.cssname}'>`,
        iconSize: [24, 34],
        iconAnchor: [12, 34]
    });
}
