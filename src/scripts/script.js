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

        $(_formatActionId('set', 'push', context.sets[i].id)).addEventListener('click', function(e) {
            doSetPush(e.target.getAttribute('data-setId'));
        }, false);

        $(_formatActionId('set', 'all', context.sets[i].id)).addEventListener('click', function(e) {
            doSetAll(e.target.getAttribute('data-setId'));
        }, false);

        $(_formatActionId('set', 'del', context.sets[i].id)).addEventListener('click', function(e) {
            doSetDel(e.target.getAttribute('data-setId'));
        }, false);

        for(var j=0; j<context.sets[i].tabs.length; j++) {
//            console.log(_formatActionId('tab', 'del', context.sets[i].id, j));
            $(_formatActionId('tab', 'del', context.sets[i].id, j)).addEventListener('click', function(e) {
                doTabDel(e.target.getAttribute('data-setId'), e.target.getAttribute('data-tabId'));
            }, false);

            $(_formatActionId('tab', 'pop', context.sets[i].id, j)).addEventListener('click', function(e) {
                doTabPop(e.target.getAttribute('data-setId'), e.target.getAttribute('data-tabId'));
            }, false);
        }
    }
    $('set-add').addEventListener('click', function(e) {
        if($('set-add-name') && $('set-add-name').value.trim() != '') {
            doSetAdd($('set-add-name').value.trim());
        }
    }, false);
});


// TODO: a lot

function init() {

    // Test Data TODO: 支持 set的增删，重命名等
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

function doSetAdd(name) {
    // set 可以重名
    for(var i=1; localStorage[_formatKey('set', i)]; i++);
    if(!localStorage[_formatKey('set', i)]) {
        localStorage[_formatKey('set', i)] = JSON.stringify({
            id: i,
            name: name,
            tabs: [
                {
                    url: "http://www.tclh123.com"
                }
            ]
        });
        updateView();
    }
}

function doSetDel(setId) {
    var key = _formatKey('set', setId);
    if(localStorage[key]) {

        // alert??

        localStorage.removeItem(key);
        updateView();
    }
}

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

function doSetPush(setId) {
    var key = _formatKey('set', setId);
    if(localStorage[key]) {
        var set = JSON.parse(localStorage[key]);
        chrome.tabs.getSelected(null, function(tab) {
            set.tabs.push({
                url: tab.url
            });
            localStorage[key] = JSON.stringify(set);
            chrome.tabs.remove(tab.id, function() {
                updateView();
            });
        });
    }
}

function doSetAll(setId) {
    var key = _formatKey('set', setId);
    if(localStorage[key]) {
        var set = JSON.parse(localStorage[key]);

        // 预留一个新标签页，使得关闭所有标签后不会太突兀...
        chrome.tabs.create({});

        chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT, {populate: true}, function(window) {
            // for each tab
            for (i in window.tabs) {
                if (window.tabs[i].url == "chrome://newtab/") {
                    continue;
                }

                set.tabs.push({
                    url: window.tabs[i].url
                });
                localStorage[key] = JSON.stringify(set);
                chrome.tabs.remove(window.tabs[i].id, function() {
                });
            }

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

function doTabPop(setId, tabIndex) {
    var key = _formatKey('set', setId);
    if(localStorage[key]) {
        var set = JSON.parse(localStorage[key]);

        chrome.tabs.create({ url: set.tabs[tabIndex].url });

        set.tabs.splice(tabIndex, 1);
        localStorage[key] = JSON.stringify(set);
        updateView();
    }
}