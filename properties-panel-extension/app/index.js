'use strict';

var fs = require('fs');

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

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');
var availableTags = [
    "ActionScript",
    "AppleScript",
    "Asp",
    "BASIC",
    "C",
    "C++",
    "Clojure",
    "COBOL",
    "ColdFusion",
    "Erlang",
    "Fortran",
    "Groovy",
    "Haskell",
    "Java",
    "JavaScript",
    "Lisp",
    "Perl",
    "PHP",
    "Python",
    "Ruby",
    "Scala",
    "Scheme"
];
//initials autocomplete 
function initAutoComplete() {
    $("#camunda-assignee").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "http://test-cdn.abas.de/hska/bpmn/ping",
                dataType: "jsonp",
                data: {
                    q: request.term
                },
                success: function(data) {
                    response(data);
                }
            });
        },
        autoFocus: true
    });
    $("#camunda-candidateUsers").autocomplete({
        source: availableTags,
        autoFocus: true
    });
    $("#camunda-candidateGroup").autocomplete({
        source: availableTags,
        autoFocus: true
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
        //get the event bus
        var eventBus = bpmnModeler.get('eventBus');
        console.log(eventBus);
        // checks for properties panel changed event
        var events = [
            'propertiesPanel.changed',
        ];
        events.forEach(function(event) {
            eventBus.on(event, function(e) {
                // e.element = the model element
                // e.gfx = the graphical element
                console.log(event, 'on');
                //get endEventNode 
                if (event === 'propertiesPanel.changed') {
                    initAutoComplete();
                }

            });
        });
        // Option 2:
        // directly attach an event listener to an elements graphical representation

        // each model element a data-element-id attribute attached to it in HTML

        // select the end event


    });

}

function saveSVG(done) {
    bpmnModeler.saveSVG(done);
}

function saveDiagram(done) {

    bpmnModeler.saveXML({ format: true }, function(err, xml) {
        done(err, xml);
    });
}

function registerFileDrop(container, callback) {

    function handleFileSelect(e) {
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
