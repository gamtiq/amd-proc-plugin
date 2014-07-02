require.config({
    packages: [
        {
            name: "proc",
            location: "..",
            main: "proc"
        }
    ],
    paths: {
        "text": "lib/text"
    },
    config: {
        "proc/proc": {
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

require(["js/appendElem", "proc!data/text", "proc!data/text!separate~- -"], function(appendElem, revertResult, separateResult) {
    appendElem(revertResult);
    appendElem(separateResult);
});
