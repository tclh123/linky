var $ = function(id) { return document.getElementById(id); };

// main entry
document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    $("btn").addEventListener("click", function(){
        foo();
    }, false);
}

function foo() {
    $("container").innerHTML = "<p>test</p>";
}

