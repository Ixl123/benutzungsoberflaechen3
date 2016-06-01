'use strict';

var fs = require('fs');
var domQuery = require('min-dom/lib/query');
var $ = require('jquery'),

    BpmnModeler = require('bpmn-js/lib/Modeler');
require('jquery-ui/autocomplete');

var propertiesPanelModule = require('bpmn-js-properties-panel'),
    // propertiesProviderModule = require('./provider/magic'),
    //eliteProviderModule = require('./provider/1337'),
    //magicModdleDescriptor = require('./descriptors/magic');
    // eliteModdleDescriptor = require('./descriptors/elite');
    propertiesProviderModule = require('bpmn-js-properties-panel/lib/provider/camunda'),
    camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda');
var propertiesPanelModule = require('bpmn-js-properties-panel');
var container = $('#js-drop-zone');
var canvas = $('#js-canvas');
var priority = [
    "High",
    "Middle",
    "Low"
];

/**
 * Triggers a change event
 *
 * @param element on which the change should be triggered
 * @param eventType type of the event (e.g. click, change, ...)
 */
function triggerEvent(element, eventType) {

    var evt;

    eventType = eventType || 'change';

    if (!!document.createEvent) {
        try {
            // Chrome, Safari, Firefox
            evt = new MouseEvent((eventType), { view: window, bubbles: true, cancelable: true });
        } catch (e) {
            // IE 11, PhantomJS (wat!)
            evt = document.createEvent('MouseEvent');

            evt.initEvent((eventType), true, true);
        }
        return element.dispatchEvent(evt);
    } else {
        // Welcome IE
        evt = document.createEventObject();

        return element.fireEvent('on' + eventType, evt);
    }
};

function triggerValue(element, value, eventType) {
    console.log(value);
    console.log(eventType)
    element.value = value;



    triggerEvent(element, eventType);
};

function triggerInput(element, value) {
    element.value = value;

    triggerEvent(element, 'input');

    element.focus();
};

console.log(propertiesProviderModule);
console.log(propertiesPanelModule);

//initials autocomplete 
function initAutoComplete(propertiesPanel) {
    $("#camunda-assignee").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "http://test-cdn.abas.de/hska/bpmn/users",
                dataType: "json",
                data: {
                    q: request.term
                },
                success: function(data) {

                    response($.map(data.user_service.users, function(value, key) {


                        return {
                            number: value.number,
                            value: value.name
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            // inputEl = 'input[name=versionTag]';
            // inputElement = domQuery(inputEl, propertiesPanel._container);
            // eventBus.fire('propertiesPanel.changed', {});
            // triggerValue(inputElement, '', 'change');
            var assigneeInput = domQuery('input[name=assignee]', propertiesPanel._container);
            triggerValue(assigneeInput, ui.item.value);
            // if


            $("#camunda-assignee").val(ui.item.value);


            return false;
        },
        messages: {
            noResults: '',
            results: function() {}
        }

    });
    $("#camunda-candidateUsers").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "http://test-cdn.abas.de/hska/bpmn/users",
                dataType: "json",
                data: {
                    q: request.term
                },
                success: function(data) {
                    // console.log(data);
                    // console.log(data.user_service.users.name);
                    // console.log(data.user_service.users);
                    response($.map(data.user_service.users, function(value, key) {
                        // console.log(value);
                        // console.log(key);
                        // console.log(value.name);
                        // console.log(value.id);

                        return {
                            number: value.number,
                            value: value.name
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            // inputEl = 'input[name=versionTag]';
            // inputElement = domQuery(inputEl, propertiesPanel._container);
            // eventBus.fire('propertiesPanel.changed', {});
            // triggerValue(inputElement, '', 'change');
            var assigneeInput = domQuery('input[name=candidateUsers]', propertiesPanel._container);
            triggerValue(assigneeInput, ui.item.value);
            // if
            console.log(event);
            console.log(ui);
            console.log(ui.item.id);
            console.log(ui.item.value);
            console.log($("#candidateUsers").val(ui.item.value));
            triggerValue(assigneeInput, ui.item.value);
            $("#candidateUsers").val(ui.item.value);


            return false;
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    });
    $("#camunda-candidateGroups").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "http://test-cdn.abas.de/hska/bpmn/teams",
                dataType: "json",
                data: {
                    q: request.term
                },
                success: function(data) {
                    console.log(data);
                    // console.log(data);
                    // console.log(data.user_service.users.name);
                    // console.log(data.user_service.users);
                    response($.map(data.team_service.teams, function(value, key) {
                        // console.log(value);
                        // console.log(key);
                        // console.log(value.name);
                        // console.log(value.id);
                        console.log(value);
                        console.log(key);

                        return {
                            number: value.number,
                            value: value.name
                        }
                    }));
                }
            });
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    });
    $("#camunda-priority").autocomplete({
        source: priority,
        messages: {
            noResults: '',
            results: function() {}
        },
        select: function(event, ui) {
            // inputEl = 'input[name=versionTag]';
            // inputElement = domQuery(inputEl, propertiesPanel._container);
            // eventBus.fire('propertiesPanel.changed', {});
            // triggerValue(inputElement, '', 'change');
            var assigneeInput = domQuery('input[name=priority]', propertiesPanel._container);
            triggerValue(assigneeInput, ui.item.value);
            // if
            console.log(event);
            console.log(ui);
            console.log(ui.item.id);
            console.log(ui.item.value);
            console.log($("#camunda-priority").val(ui.item.value));
            triggerValue(assigneeInput, ui.item.value);
            $("#camunda-priority").val(ui.item.value);


            return false;
        }
    });
}
var bpmnModeler = new BpmnModeler({
    container: canvas,
    propertiesPanel: {
        parent: '#js-properties-panel'
    },
    additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule
        // eliteProviderModule
    ],
    moddleExtensions: {
        camunda: camundaModdleDescriptor
            //elite: eliteModdleDescriptor
    }
});

var newDiagramXML = fs.readFileSync(__dirname + '/../resources/newDiagram.bpmn', 'utf-8');

function createNewDiagram() {
    openDiagram(newDiagramXML);
}

function openDiagram(xml) {

    bpmnModeler.importXML(xml, function(err) {

        if (err) {
            container
                .removeClass('with-diagram')
                .addClass('with-error');

            container.find('.error pre').text(err.message);

            console.error(err);
        } else {
            container
                .removeClass('with-error')
                .addClass('with-diagram');

        }
        //remap properties


        //get the event bus
        var eventBus = bpmnModeler.get('eventBus');
        var propertiesPanel = bpmnModeler.get('propertiesPanel');
        console.log(eventBus);

        // checks for properties panel changed event
        var events = [
            'propertiesPanel.changed',
            'propertiesPanel.isEntryVisible',
            'propertiesPanel.isPropertyEditable',
            'propertiesPanel.resized',
            'elements.changed'

        ];
        events.forEach(function(event) {

            eventBus.on(event, function(e) {
                // e.element = the model element
                // e.gfx = the graphical element
                console.log(event, 'on');
                //get endEventNode 
                if (event === 'propertiesPanel.changed') {
                    initAutoComplete(propertiesPanel);
                }

            });
        });

    });

}

function saveSVG(done) {
    bpmnModeler.saveSVG(done);
}

function mapProperties() {
    $.getJSON('http://test-cdn.abas.de/hska/bpmn/teams', function(data) {
        console.log(data);
    });
}

function unMapProperties() {
    //get input fields and set them with name value
}

function saveDiagram(done) {

    bpmnModeler.saveXML({ format: true }, function(err, xml) {
        done(err, xml);
    });
}

function registerFileDrop(container, callback) {

    function handleFileSelect(e) {

        console.log('handle DRAG');
        e.stopPropagation();
        e.preventDefault();

        var files = e.dataTransfer.files;

        var file = files[0];

        var reader = new FileReader();

        reader.onload = function(e) {

            var xml = e.target.result;

            callback(xml);
        };

        reader.readAsText(file);
    }

    function handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();

        e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    container.get(0).addEventListener('dragover', handleDragOver, false);
    container.get(0).addEventListener('drop', handleFileSelect, false);
}
// catch download event
$("#js-download-diagram").click(function() {
    mapProperties();
});
////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
    window.alert(
        'Looks like you use an older browser that does not support drag and drop. ' +
        'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
    registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(document).on('ready', function() {

    $('#js-create-diagram').click(function(e) {
        e.stopPropagation();
        e.preventDefault();

        createNewDiagram();
    });

    var downloadLink = $('#js-download-diagram');
    var downloadSvgLink = $('#js-download-svg');

    $('.buttons a').click(function(e) {
        if (!$(this).is('.active')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    function setEncoded(link, name, data) {
        var encodedData = encodeURIComponent(data);

        if (data) {
            link.addClass('active').attr({
                'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
                'download': name
            });
        } else {
            link.removeClass('active');
        }
    }

    var debounce = require('lodash/function/debounce');

    var exportArtifacts = debounce(function() {

        saveSVG(function(err, svg) {
            setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
        });

        saveDiagram(function(err, xml) {
            setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    }, 500);

    bpmnModeler.on('commandStack.changed', exportArtifacts);

});
