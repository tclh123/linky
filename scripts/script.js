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

    // 绑定事件
    /// TODO: 不允许 inline javascript 很烦啊，有什么优美的解决方法没？
    /// bind click events
    /// load data from localStorage
    var context = {
        sets: []
    };
    for(var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var set = JSON.parse(localStorage[key]);
        context.sets.push(set);
    }
    for (var i =0; i<context.sets.length; i++) {
        $(_formatActionId('set', 'put', context.sets[i].id)).addEventListener('click', function(e) {
            doSetPut(e.target.getAttribute('data-setId'));
        }, false);

        for(var j=0; j<context.sets[i].tabs.length; j++) {
            console.log(_formatActionId('tab', 'del', context.sets[i].id, j));
            $(_formatActionId('tab', 'del', context.sets[i].id, j)).addEventListener('click', function(e) {
                doTabDel(e.target.getAttribute('data-setId'), e.target.getAttribute('data-tabId'));
            }, false);
        }
    }
});


// TODO: a lot

function init() {

    // Test Data TODO:
//    var context = {
//        sets: [
//            {
//                id: "1",
//                name: "一个set",
//                tabs: [
//                    {
//                        url: "http://www.tclh123.com"
//                    },
//                    {
//                        url: "http://www.baidu.com"
//                    }
//                ]
//            },
//            {
//                id: "2",
//                name: "又一个set",
//                tabs: [
//                    {
//                        url: "http://www.tclh123.com"
//                    },
//                    {
//                        url: "http://www.baidu.com"
//                    }
//                ]
//            }
//        ]
//    };

    if(!localStorage["set$1"]) {
        localStorage["set$1"] = JSON.stringify({
            id: "1",
            name: "一个set",
            tabs: [
                {
                    url: "http://www.tclh123.com"
                },
                {
                    url: "http://www.baidu.com"
                }
            ]
        });
    }
    updateView();
}
function updateView() {
    /// load data from localStorage
    var context = {
        sets: []
    };
    for(var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var set = JSON.parse(localStorage[key]);
        context.sets.push(set);
    }

    var message = {
        command: 'render',
        templateName: 'tpl_list',
        context: context
    };
    $('sandbox').contentWindow.postMessage(message, '*');
}


////////// util

function _formatKey(type, id) {
    return type+'$'+id;
}

function _formatActionId(type, action, setId, tabId) {
    return type+'-'+action+'-'+setId+ (tabId!=undefined? ('-'+tabId):'');
}

////////// Controllers

////////// Page Actions

function doSetPut(setId) {
    var key = _formatKey('set', setId);
    if(localStorage[key]) {
        var set = JSON.parse(localStorage[key]);
        chrome.tabs.getSelected(null, function(tab) {
            set.tabs.push({
                url: tab.url
            });
            localStorage[key] = JSON.stringify(set);
            updateView();
        });
    }
}

function doTabDel(setId, tabIndex) {
    var key = _formatKey('set', setId);
    if(localStorage[key]) {
        var set = JSON.parse(localStorage[key]);
        set.tabs.splice(tabIndex, 1);
        localStorage[key] = JSON.stringify(set);
        updateView();
    }
}