## AMD proc! plugin.

Compatible with [curl.js](https://github.com/cujojs/curl) and [require.js](http://requirejs.org/).

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

* `defaultExt` - `String` - default file extension that is used if it is not specified inside resource name;
     the default value is `'html'`.
* `default` - `Function`, `Object`, `String` - the procedure that should be used by default when procedure is not specified inside resource name;
     can be a function, an object that has method with name `execute`, or a name of one of registered/configured procedures.
* `loader` - `String` - default loader/plugin (without trailing exclamation sign) that should be used when loader is not specified inside resource name;
     the default value is `'text'`.
* `proc` - `Object` - map of registered procedures; keys are names of procedures, values are corresponding procedures;
     procedure can be a function or an object that has method with name `execute`;
     the resource's content will be passed into the function/method to get the result that plugin will return.

Configuration example for `curl.js`:
```js
// Before curl.js loading
var curl = {
    pluginPath: "path/to/plugins",
    plugins: {
        proc: {
            proc: {
                template: function(text) {
                    ...
                },
                
                reverse: function(text) {
                    return text.split("").reverse().join("");
                }
            },
            "default": "reverse"
        }
    }
};
```

Configuration example for `require.js`:
```js
require.config({
    config: {
        proc: {
            proc: {
                template: function(text) {
                    ...
                },
                
                reverse: function(text) {
                    return text.split("").reverse().join("");
                }
            },
            "default": "reverse"
        }
    }
});
```

Configuration settings have priority over settings that are set by module API functions (see below).

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

## Module API

The following functions can be used to configure plugin's work.
All functions except `getProc` are chainable i.e. they return `this`.

Usage example:
```javascript
curl(["path/to/plugin/proc"], function(proc) {
    proc.setProc("p1", function() {...})
        .setProc("p2", {data: ..., execute: function() {...}})
        .setDefaultProc("p1");
});
```

Settings made by the following functions can be used along with configuration settings but the latter have priority.

### setProc(sProcName: String, proc: Function|Object)

Registers/adds the procedure to the list of available procedures.
The value of `sProcName` parameter is used to get access to the procedure.
The `proc` parameter specifies procedure that is used to process a resource.
The value of the `proc` parameter can be a function or an object that has method with name `execute`.
The resource will be passed into the function/method to get the result that plugin will return.

### getProc(sProcName: String): Function|Object

Returns available/registered procedure with the specified name.
Returns `null` if procedure with the name is not registered.

### removeProc(sProcName: String)

Removes the procedure from the list of available/registered procedures.

### setDefaultProc(proc: Function|Object|String)

Sets the procedure that should be used by default when no procedure is specified inside resource name.
The value of `proc` parameter can be a function, an object that has method with name `execute`, or a name of one of available procedures.

### setDefaultExt(sExt: String)

Sets the default file extension that is used if it is not specified inside resource name.

### setDefaultLoader(sExt: sLoader)

Sets the default loader/plugin that should be used when it is not specified inside resource name.
The value of the parameter should represent plugin name without the trailing exclamation sign (e.g. `'text'` or '[view](https://github.com/gamtiq/amd-view-plugin)').

## Licence

MIT
