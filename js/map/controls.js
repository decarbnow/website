import base from "./base.js";
require('leaflet.control.layers.tree');
import { layerSets, layers } from './layers/sets.js';

let controls = {
  layersControls: null,
  addControls: function(){
    let width = $(window).width()

    let baseTree = [{
        label: 'Base Layers',
        children: [
            { label: 'Google Satellite', layer: layerSets.baseTiles.layers.satellite },
            { label: 'Esri Satellite', layer: layerSets.baseTiles.layers.esri },
            { label: 'OpenStreetMap', layer: layerSets.baseTiles.layers.streets },
            { label: 'Light', layer: layerSets.baseTiles.layers.light },
            { label: 'Terrain', layer: layerSets.baseTiles.layers.terrain },
            { label: 'Dark', layer: layerSets.baseTiles.layers.dark },
            { label: 'World Population', layer: layerSets.baseTiles.layers.worldpop },
            { label: 'Night lights', layer: layerSets.baseTiles.layers.nightlight },
            { label: 'Sentinel 2 (2020, EOX)', layer: layerSets.baseTiles.layers.s2maps20 },
            { label: 'Sentinel 2 (2019, EOX)', layer: layerSets.baseTiles.layers.s2maps19 },
            { label: 'Sentinel 2 (2018, EOX)', layer: layerSets.baseTiles.layers.s2maps18 },
            { label: 'Sentinel 2 (2017, EOX)', layer: layerSets.baseTiles.layers.s2maps17 },
            { label: 'Sentinel 2 (2016, EOX)', layer: layerSets.baseTiles.layers.s2maps16 },
            //{ label: 'Disabled', layer: layerSets.baseTiles.layers.empty },
            /* ... */
        ]
      }]

      let overlaysTree = [
          {
              label: 'Tweets',
              layer: layerSets.tweets.layers.tweets,
          },
          {
              label: 'Polygons',
              layer: layerSets.points.layers.polygons,
          },
          {
          label: 'NO₂',
          children: [
            {
                label: 'Disable',
                collapsed: false,
                layer: layerSets.overlays.layers.empty, radioGroup: 'NO2'
            },
            {
                label: 'Yearly',
                collapsed: true,
                children: [
                  { label: 'NO₂ 2007', layer: layerSets.overlays.layers.no2_2007, radioGroup: 'NO2'},
                  { label: 'NO₂ 2011', layer: layerSets.overlays.layers.no2_2011, radioGroup: 'NO2' },
                  { label: 'NO₂ 2015', layer: layerSets.overlays.layers.no2_2015, radioGroup: 'NO2' },
                  { label: 'NO₂ 2018', layer: layerSets.overlays.layers.no2_2019, radioGroup: 'NO2' },
                  { label: 'NO₂ 2020', layer: layerSets.overlays.layers.no2_2020, radioGroup: 'NO2' },
                  { label: 'NO₂ 2021', layer: layerSets.overlays.layers.no2_2021, radioGroup: 'NO2' },
                  /* ... */
                ]
            },
            {
                label: 'Monthly',
                collapsed: true,
                children: [
                  { label: 'NO₂ 2019/12', layer: layerSets.overlays.layers.no2_2019_12, radioGroup: 'NO2'},
                  { label: 'NO₂ 2020/01', layer: layerSets.overlays.layers.no2_2020_01, radioGroup: 'NO2'},
                  { label: 'NO₂ 2020/02', layer: layerSets.overlays.layers.no2_2020_02, radioGroup: 'NO2'},
                  { label: 'NO₂ 2020/03', layer: layerSets.overlays.layers.no2_2020_03, radioGroup: 'NO2'},
                  { label: 'NO₂ 2020/04', layer: layerSets.overlays.layers.no2_2020_04, radioGroup: 'NO2'},
                  { label: 'NO₂ 2020/05', layer: layerSets.overlays.layers.no2_2020_05, radioGroup: 'NO2'},
                  { label: 'NO₂ 2020/06', layer: layerSets.overlays.layers.no2_2020_06, radioGroup: 'NO2'},
                  { label: 'NO₂ 2020/07', layer: layerSets.overlays.layers.no2_2020_07, radioGroup: 'NO2'},
                  /* ... */
                ]
            }
          ]
        }, {
            label: 'Points of Interest',
            children: [
              { label: 'Sector Data',
                children: [
                  { label: layerSets.points.layers.energy.options.name, layer: layerSets.points.layers.energy},
                  { label: layerSets.points.layers.manufacturing.options.name, layer: layerSets.points.layers.manufacturing},
                  { label: layerSets.points.layers["fossil-fuel-operations"].options.name, layer: layerSets.points.layers["fossil-fuel-operations"]}
                ]},
              { label: 'Other Datasets',
                collapsed: true,
                children: [
                  { label: layerSets.points.layers["e-prtr"].options.name, layer: layerSets.points.layers["e-prtr"]},
                  { label: layerSets.points.layers["power-plants"].options.name, layer: layerSets.points.layers["power-plants"]}
                ]},
            ]
        }
      ]


    controls.layersControls = L.control.layers.tree(baseTree, overlaysTree,  {
            namedToggle: false,
            selectorBack: false,
            closedSymbol: '&#8862; &#128193;',//'&#8862; &#x1f5c0;',
            openedSymbol: '&#8863; &#128194;',//'&#8863; &#x1f5c1;',
            collapsed: width < 1800
        });

    controls.layersControls.collapseTree(true).addTo( base.map ).setPosition('topleft');

    //let width = $(window).width()
    //
    //
    // L.control.layers(layerSets.baseTiles.getNameObject(), layerSets.tweets.getNameObject(), {
    //     position: 'topleft',
    //     collapsed: width < 1800
    // }).addTo(base.map);


    // L.control.layers(layerSets.overlays.getNameObject(), layerSets.points.getNameObject(), {
    //     position: 'topleft',
    //     collapsed: width < 1800
    // }).addTo(base.map);


  }
}


export default controls;
