/**
 * proc.js
   
    AMD proc! plugin.
    Compatible with `curl.js` and `require.js`.
    
    This plugin loads resource file using specified plugin, applies some procedure/transformation to resource's content and returns result of transformation.
    If no procedure is applied the original resource's content will be returned.
    
    The procedure that should be applied can be specified at the end of resource name after exclamation sign `!` in the following form:
    `<resource name>!<procedure name>`
    For example:
    `path/to/some/template!compile`
    where `compile` is the name of registered/configured procedure.
    
    If procedure name is not specified in the resource name, the default procedure will be used.
    When procedure name is not specified in the resource name, the resource loader also should be omitted in the resource name.
    Otherwise plugin does not work correctly.
    So default procedure can be used only with default resource loader (see below).
    
    ## Configuration
    
    The following configuration settings are supported (name - type - description):
    
    * `defaultExt` - String - default file extension that is used if it is not specified inside resource name;
         the default value is `'html'`.
    * `default` - Function, Object, String - the procedure that should be used by default when procedure is not specified inside resource name;
         can be a function, an object that has method with name `execute`, or a name of one of registered/configured procedures.
    * `loader` - String - default loader/plugin (without trailing exclamation sign) that should be used when loader is not specified inside resource name;
         the default value is `'text'`.
    * `proc` - Object - map of registered procedures; keys are names of procedures, values are corresponding procedures;
         procedure can be a function or an object that has method with name `execute`;
         the resource's content will be passed into the function/method to get the result that plugin will return.
    
    ## Dependencies
    
    * `./util/base` module
    * plugins to load resources (for example, `text` plugin)
    
    ## Usage
    
    ```javascript
    // loads some/folder/view.html using default loader and applies the default procedure (supposed that 'html' is set as default extension)
    define(['proc!some/folder/view'], function(view) {...});
    
    // loads some/folder/view.tmpl using default loader and applies template procedure
    define(['proc!some/folder/view.tmpl!template'], function(view) {...});
    
    // loads some/folder/data.json using json! loader plugin and applies prepare procedure
    define(['proc!json!some/folder/data.json!prepare'], function(data) {...});
    ```
    
 * @version 0.1.1
 * @author Denis Sikuler
 * @license MIT License (c) 2013-2014 Copyright Denis Sikuler
 */



define(["./util/base", "module"], function(basicUtil, module) {
    "use strict";
    
    var 
        // Default procedure
        defaultProc = null,
        // Map of available procedures
        procMap = {},
        // Default resource file extension
        sDefaultExt = "html",
        // Default plugin that should be used to load resource
        sDefaultLoader = "text";
    
    // Export
    return {
    
        // Auxiliary API
        
        /**
         * Registers/adds the procedure to the list of available procedures.
         * 
         * @param {String} sProcName
         *      The name of procedure. The name is used to get access to the procedure.
         * @param {Function, Object} proc
         *      The procedure that is used to process a resource.
         *      Can be a function or an object that has method with name <code>execute</code>.
         *      The resource will be passed into the function/method to get the result that plugin will return.
         * @return {Object}
         *      <code>this</code> object.
         */
        "setProc": function(sProcName, proc) {
            procMap[sProcName] = proc;
            return this;
        },
        
        /**
         * Returns available/registered procedure with the specified name.
         * 
         * @param {String} sProcName
         *      The name of procedure that is required.
         * @return {Function, Object}
         *      The function/object that represents the procedure or <code>null</code> if procedure with the name is not registered.
         */
        "getProc": function(sProcName) {
            return sProcName in procMap
                    ? procMap[sProcName]
                    : null;
        },
        
        /**
         * Removes the procedure from the list of available/registered procedures.
         * 
         * @param {String} sProcName
         *      The name of procedure.
         * @return {Object}
         *      <code>this</code> object.
         */
        "removeProc": function(sProcName) {
            delete procMap[sProcName];
            return this;
        },
        
        /**
         * Sets the procedure that should be used by default when no procedure is specified inside resource name.
         * 
         * @param {Function, Object, String} proc
         *      The procedure that should be used by default.
         *      Can be a function, an object that has method with name <code>execute</code>, or a name of one of available procedures.
         * @return {Object}
         *      <code>this</code> object.
         */
        "setDefaultProc": function(proc) {
            defaultProc = proc;
            return this;
        },
        
        /**
         * Sets the default file extension that is used if it is not specified inside resource name.
         * 
         * @param {String} sExt
         *      The file extension without the leading dot (e.g. "html" or "txt").
         * @return {Object}
         *      <code>this</code> object.
         */
        "setDefaultExt": function(sExt) {
            sDefaultExt = sExt;
            return this;
        },
        
        /**
         * Sets the default loader/plugin that should be used when it is not specified inside resource name.
         * 
         * @param {String} sLoader
         *      Plugin name without the trailing exclamation sign (e.g. "text" or "view").
         * @return {Object}
         *      <code>this</code> object.
         */
        "setDefaultLoader": function(sLoader) {
            sDefaultLoader = sLoader;
            return this;
        },
        
        // Plugin API

        "load": function(sResourceName, require, callback, config) {
            var nI = sResourceName.lastIndexOf("!"),
                proc, sLoader;
            if (! config) {
                config = {};
            }
            // Adaptation for require.js
            else if (config.config && typeof config.config === "object" && config.config[module.id]) {
                config = module.config();
            }
            // Determine procedure that should be used
            if (nI > -1) {
                proc = sResourceName.substring(nI + 1);
                sResourceName = sResourceName.substring(0, nI);
            }
            if (! proc) {
                proc = config["default"] || defaultProc;
            }
            // Determine loader
            if (sResourceName.indexOf("!") > -1) {
                sLoader = "";
            }
            else {
                sLoader = (config.loader || sDefaultLoader) + "!";
            }
            // Load resource
            require([sLoader + require.toUrl( basicUtil.nameWithExt(sResourceName, config.defaultExt || sDefaultExt) )], 
                function(resource) {
                    // Process resource and return result
                    var result = resource;
                    if (proc) {
                        if (typeof proc === "string") {
                            if (config.proc && (proc in config.proc)) {
                                proc = config.proc[proc];
                            }
                            else {
                                proc = procMap[proc];
                            }
                        }
                        if (typeof proc === "function") {
                            result = proc(resource);
                        }
                        else if (proc && typeof proc === "object" && typeof proc.execute === "function") {
                            result = proc.execute(resource);
                        }
                    }
                    callback(result);
            });
        }
    
    };   // End of export
});   // End of define

