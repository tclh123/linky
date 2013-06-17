var $ = function(id) { return document.getElementById(id); };

// main entry
document.addEventListener('DOMContentLoaded', function() {
    // till sandbox can support template rending
    $('sandbox').onload = function() {
        init();
    }
});

// on result from sandboxed frame:
window.addEventListener('message', function(event) {
    var html = event.data.result || "invalid result";

    console.log(html);

    $("container").innerHTML = html;
});

function init() {
    $("btn").addEventListener("click", function(){
        foo();
    }, false);

    var context = {
        sets: [
            { name:"name1" }
        ]
    };

    var message = {
        command: 'render',
        templateName: 'tpl_list',
        context: context
    };
    $('sandbox').contentWindow.postMessage(message, '*');

}

function foo() {
//    $("container").innerHTML = "<p>test</p>";

    var context = {
        sets: [
            { name:"name1" }
        ]
    };

    var message = {
        command: 'render',
        templateName: 'tpl_list',
        context: context
    };
    $('sandbox').contentWindow.postMessage(message, '*');
}