/* ComponentDomParser 0.1.0 | @license MIT */

(function(global, factory) {
    'use strict';

    // If the env is browserify, export the factory using the module object.
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global);

    // If the env is AMD, register the Module as 'ComponentDomParser'.
    } else if (global.define && typeof global.define === "function" && global.define.amd) {
        global.define("ComponentDomParser", [], function() {
            return factory(global);
        });

    // If the env is a browser(without CJS or AMD support), export the factory into the global window object.
    } else {
        global.ComponentDomParser = factory(global);
    }
}(window, function(global) {
    'use strict';

    const doc = global.document;

    /*
     * ComponentDomParser
     * @param options {Object} The options Object which initializes the parser.
     * @example
     * // Initialize a new instance of the ComponentDomParser.
     * var parser = new window.ComponentDomParser({
     *     dataSelector: 'app',
     *     componentIndex: {
     *         'myApplication': function(el) { el.innerHTML = 'myApplication initialized!' }
     *     },
     *     componentDidMountCallback: function(instance) {
     *         console.log(instance);
     *     }
     * });
     *
     * // Parse the document for all [data-app] nodes.
     * parser.parse();
     * @constructor
     */
    let ComponentDomParser = function(options) {
        this._checkForRequiredConstants(options);

        this.dataSelector = options.dataSelector;
        this.componentIndex = options.componentIndex;
        this.componentDidMountCallback = options.componentDidMountCallback;
        this.nonIndexedComponentPolicies = options.nonIndexedComponentPolicies || null;
        this._isLoggingEnabled = false || options.isLoggingEnabled;
        this._policyRules = options.nonIndexedComponentPolicies ? Object.keys(options.nonIndexedComponentPolicies) : null;
        this._policyRulesRegex = this._policyRules ? this._policyRules.map(function(policyRule) {
            return new RegExp('^' + policyRule.replace(/[^\w\s]/g, '\$&').replace(/\*/g, '\\w+') + '$');
        }) : null;
        this._mountedElementsCache = [];
    };

    ComponentDomParser.prototype._checkForRequiredConstants = function(options) {
        if(!options) {
            throw new Error('ComponentDomParser Error: No option object was specified.');
        }

        if(!options.dataSelector) {
            throw new Error('ComponentDomParser Error: No dataSelector was specified.');
        }

        if(!options.componentIndex) {
            throw new Error('ComponentDomParser Error: No componentIndex was specified.');
        }

        if(options.componentDidMountCallback && typeof(options.componentDidMountCallback) !== 'function') {
            throw new Error('ComponentDomParser Error: The componentDidMountCallback option must be a function.');
        }
    };

    ComponentDomParser.prototype.parse = function(contextElement) {
        contextElement = contextElement || doc.body;

        let elementNodeList = contextElement.querySelectorAll('[data-' + this.dataSelector + ']');
        let elementNodes = Array.prototype.slice.call(elementNodeList,0);
        let self = this;

        elementNodes.forEach(function(node) {
            let componentKey = node.dataset[self.dataSelector];
            let Component = self.componentIndex[componentKey] || self._getNonIndexComponentPolicy(node, componentKey);

            if(Component) {
                if(self._mountedElementsCache.indexOf(node) < 0) {
                    self._mountComponent(node, Component);
                }
            } else if(this._isLoggingEnabled) {
                console.info('ComponentDomParser Info: Component "' + componentKey + '" isn`t present in the passed componentIndex while mounting a node.', self.componentIndex, node);
            }
        });

        return this;
    };

    ComponentDomParser.prototype._mountComponent = function(node, Component) {
        let instance = new Component(node);

        this._mountedElementsCache.push(node);

        if(this.componentDidMountCallback) {
            this.componentDidMountCallback(instance);
        }

        return instance;
    };

    ComponentDomParser.prototype._getNonIndexComponentPolicy = function(node, componentKey) {
        let nonIndexedComponentPolicies = this.nonIndexedComponentPolicies;

        if (nonIndexedComponentPolicies) {
            let policyRule = null;
            let policyRuleRegex = null;

            for (let i = 0; (policyRule = this._policyRules[i]) && (policyRuleRegex = this._policyRulesRegex[i]); i++) {
                if (componentKey.match(policyRuleRegex)) {
                    let policyHandler = nonIndexedComponentPolicies[policyRule];
                    let policyConstructor = policyHandler(componentKey, node);

                    if (policyConstructor) {
                        return policyConstructor;
                    }
                }
            }
        }

        return false;
    };


    ComponentDomParser.prototype.addComponent = function(componentKey, Component) {
        this.componentIndex[componentKey] = Component;

        return this;
    };

    return ComponentDomParser;
}));
