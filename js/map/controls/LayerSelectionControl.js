import { Control, DomUtil, DomEvent, Browser } from 'leaflet';
import Choices from 'choices.js'


L.Control.LayerSelectionControl = L.Control.Layers.extend({
    initialize: function (layers, options) {
        L.Control.Layers.prototype.initialize.call(this, null, null, options);
        // Util.setOptions(this, options);
        //
        // this._layerControlInputs = [];
        this._layers = layers;
        // this._lastZIndex = 0;
        this._handling = false;
        //
        // for (var i in baseLayers) {
        //     this._addLayer(baseLayers[i], i);
        // }
        //
        // for (i in overlays) {
        //     this._addLayer(overlays[i], i, true);
        // }
    },

    // initialize: function (options) {
    //     L.Control.prototype.initialize.call(this, options);
    // },

    onAdd: function (map) {
        this._map = map;

		this._initLayout();
		//this._update();


        Object.values(this._layers).forEach((layer) => {
            layer.on('add remove', this._onLayerChange, this);
        });

		return this._container;
	},

    _onLayerChange: function(e) {
        console.log(e)
        let selected = this._choices.getValue(true);
        console.log('BEFORE')
        console.log(selected)
        if (e.type == 'add') {
            selected.push(e.target.id)
            this._choices.setChoiceByValue(selected);
        }
        if (e.type == 'remove') {
            // selected = selected.filter(item => item !== e.target.id)
            this._choices.removeActiveItemsByValue(e.target.id)
        }
        // console.log('AFTER')
        // console.log(selected)
        // this._choices.clearChoices();(selected);

    },

    _initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = DomUtil.create('div', className),
		    collapsed = this.options.collapsed;

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		DomEvent.disableClickPropagation(container);
		DomEvent.disableScrollPropagation(container);

		var section = this._section = DomUtil.create('section', className + '-list');

		if (collapsed) {
			this._map.on('click', this.collapse, this);

			if (!Browser.android) {
				DomEvent.on(container, {
					mouseenter: this.expand,
					mouseleave: this.collapse
				}, this);
			}
		}

		if (!collapsed) {
			this.expand();
		}

        var link = this._layersLink = DomUtil.create('a', className + '-toggle', container);
        link.href = '#';
        link.title = 'Layers';

        if (Browser.touch) {
            DomEvent.on(link, 'click', DomEvent.stop);
            DomEvent.on(link, 'click', this.expand, this);
        } else {
            DomEvent.on(link, 'focus', this.expand, this);
        }

        let choicesElement = DomUtil.create('select', className + '-choices');
        choicesElement.setAttribute('multiple', true)

        let choices = [];
        Object.keys(this._layers).forEach((layerId) => {
            let layer = this._layers[layerId];
            choices.push({
                value: layerId,
                label: layer.options.name,
                selected: this._map.hasLayer(layer)
            })
        });

        section.style = 'min-width: 500px'

        section.appendChild(choicesElement)
        this._choices = new Choices(choicesElement, {
            choices: choices
        })

        window.choices = this._choices;

        let self = this;

        choicesElement.addEventListener(
            'addItem',
            function(event) {
                //console.log(event.detail.value);
                self._layers[event.detail.value].addTo(self._map)
            },
            false,
        );

        choicesElement.addEventListener(
            'removeItem',
            function(event) {
                //console.log(event.detail.value);
                self._layers[event.detail.value].removeFrom(self._map)
            },
            false,
        );

		container.appendChild(section);
	},

    _checkDisabledLayers: function() {},
});


L.control.layerSelectionControl = function(layers, opts) {
    return new L.Control.LayerSelectionControl(layers, opts);
}
