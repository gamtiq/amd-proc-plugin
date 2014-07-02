curl.config({
    packages: {
        proc: {
            location: "..",
            main: "proc"
        }
    },
    pluginPath: "lib",
    plugins: {
        proc: {
            proc: {
                revert: function(sText) {
                    return sText.split(/\s+/).reverse().join(" ");
                },
                separate: function(sText, sSep) {
                    return sText.split(/\s+/).join(sSep || " ");
                }
            },
            "default": "revert",
            defaultExt: "txt",
            paramSeparator: "~"
        }
    }
});

curl(["js/appendElem", "proc!data/text", "proc!data/text!separate~- -"], function(appendElem, revertResult, separateResult) {
    appendElem(revertResult);
    appendElem(separateResult);
});
