'use strict';

var inherits = require('inherits');

var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');


// Require your custom property entries.

var eliteProps = require('./parts/1337Props');


// Create the custom magic tab
function createEliteTabGroups(element, elementRegistry) {

    // Create a group called "elite Group".
    var eliteGroup = {
        id: 'elite-group',
        label: 'Elite',
        entries: []
    };

    // Add the spell props to the black magic group.
    
    
    eliteProps(eliteGroup, element);
    return [
        eliteGroup
    ];
}

function ElitePropertiesProvider(eventBus, bpmnFactory, elementRegistry) {

    PropertiesActivator.call(this, eventBus);

    this.getTabs = function(element) {

        // The "magic" tab
        var eliteTab = {
            id: 'elite',
            label: 'Elite',
            groups: createEliteTabGroups(element, elementRegistry)
        };

        // Show eliteTab
        return [
           
            eliteTab
        ];
    };
}

inherits(ElitePropertiesProvider, PropertiesActivator);

module.exports = ElitePropertiesProvider;
