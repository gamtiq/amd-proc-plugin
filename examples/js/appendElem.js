define([], function() {
    return function(text) {
        var doc = document,
            elem = doc.createElement("div");
        elem.innerHTML = text;
        doc.body.appendChild(elem);
    };
});
