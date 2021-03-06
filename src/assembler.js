import {logger} from '@reduct/logger';

const assemblerLogger = logger.getLogger('@reduct/assembler');

/**
 * The Assembler.
 *
 * An assembler instance acts as the central point of your
 * application. It is responsible for connecting DOM nodes with
 * actual component instances through exposed interfaces. Those
 * interfaces provides the functionality for registering component
 * classes and bootstrapping the whole application.
 *
 * Usage example:
 *
 *	 import assembler from 'assembler';
 *
 *	 // Importing your actual components
 *	 import MyComponent from 'my-component';
 *	 import AnotherComponent from 'another-component';
 *
 *	 const app = assembler();
 *
 *	 app.register(MyComponent);
 *	 app.register(AnotherComponent, 'NewsComponent');
 *
 *	 // Start the application (will parse the DOM and mount the
 *	 // component instances).
 *	 app.run();
 *
 */
class Assembler {

	/**
	 * Initializes the empty component class index
	 * and the actual component instance cache.
	 *
	 * @param {object} opts Overwritten default options
	 *
	 */
	constructor(opts = {marker: 'component'}) {
		this.marker = opts.marker;
		this.selector = `data-${this.marker}`;

		this.index = {};

		//
		// The actual instantiated components.
		//
		// Structure:
		//
		//	 {
		//		 'ComponentClassName': [object, object],
		//		 'YetAnotherComponentClassName': [object]
		//	 }
		//
		this.components = {};

		//
		// A cache of DOM elements.
		//
		// This is for checking if a component has already been instantiated.
		//
		// TODO: Refactoring: Find another way (with good performance) to combine this
		// array with the `components` object.
		//
		this.elements = [];
	}

   /**
	* @private
	*
	* Parses the function name out of `Function.prototype.toString()`.
	*
	* TODO: Move into Utilities when supported by `build-tools`.
	*
	* @param {Function} The function from which the name should be extracted.
	* @returns {string} The actual name (`anonymous` when the function does not provide a name).
	*
	*/
	getFunctionName(fn) {
		if (Reflect.apply(Object.prototype.toString, fn, fn) !== '[object Function]') {
			assemblerLogger.error(`${fn} is not a valid function.`);
		}

		const regexe = /^\s*function\s*([^\(]*)/im;

		return fn.name || regexe.exec(fn.toString())[1] || 'anonymous';
	}

	/**
	 * @private
	 *
	 * Checks if a component has already been instantiated.
	 *
	 * @param {DOMElement} element The element which should be connected to a component.
	 *
	 * @returns {boolean}
	 *
	 */
	isInstantiated(element) {
		return this.elements.indexOf(element) !== -1;
	}

	/**
	 * @private
	 *
	 * Instantiates a component by a given DOM node.
	 *
	 * Will extract the component's name out of the DOM nodes `data`
	 * attribute, instantiates the actual component object and pushes
	 * the instance to the internal `components` index.
	 *
	 * @param {HTMLElement} element The component's root DOM node.
	 *
	 */
	instantiate(element) {
		if (!this.isInstantiated(element)) {
			const name = element.getAttribute(this.selector);
			const instantiatedTargets = this.components[name] || [];

			const components = this.components[name] = Reflect.apply(Array.prototype.slice, instantiatedTargets, instantiatedTargets);
			const Component = this.index[name];

			this.elements.unshift(element);

			components.unshift(new Component(element));
		}
	}

	/**
	 * Registers a component class.
	 *
	 * Usage example
	 *
	 *	 app.register(MyComponent); // Name: 'MyComponent'
	 *
	 *	 app.register(MyComponent, 'FooComponent'); // Name: 'FooComponent'
	 *
	 * @param {Function} ComponentClass The component class which should be registered.
	 * @param {string} name An alternative name (optional)
	 *
	 */
	register(ComponentClass, name) {
		const type = typeof ComponentClass;

		if (type !== 'function') {
			throw new Error(`'${type}' is not a valid component class.`);
		}

		name = name || this.getFunctionName(ComponentClass);

		this.index[name] = ComponentClass;

		return this;
	}

	/**
	 * Takes a hashmap with multiple component classes
	 * and registers them at once.
	 *
	 * Usage example:
	 *
	 *	 app.registerAll({
	 *		 MyComponent: MyComponent,		// name: 'MyComponent'
	 *		 'AnotherComponent': FooComponent // name: 'AnotherComponent'
	 *	 });
	 *
	 *	 // With destructuring
	 *	 app.registerAll({MyComponent, FooComponent});
	 *
	 * @param {object} classMap A map with multiple component classes.
	 *
	 */
	registerAll(classMap) {
		Object.keys(classMap).forEach(name => this.register(classMap[name], name));

		return this;
	}

	/**
	 * "Parse" the DOM for component declarations and
	 * instantiate the actual, well, components.
	 *
	 */
	run() {
		const nodeList = document.querySelectorAll(`[${this.selector}]`);
		const elements = Reflect.apply(Array.prototype.slice, nodeList, [nodeList]);
		const names = Object.keys(this.index);

		//
		// Find all instantiable elements.
		// Note: `getAttribute` has to be used due to: https://github.com/tmpvar/jsdom/issues/961
		//
		elements
			.filter(element => names.indexOf(element.getAttribute(this.selector)) !== -1)
			.forEach(element => this.instantiate(element));
	}
}

//
// Create the `assembler` factory function.
// This factory will create a new instance of the `assembler` and exposes the API
//
const assembler = opts => {
	const assembler = new Assembler(opts);

	//
	// Shard the actual front-facing API (for not leaking private methods and properties).
	//
	const api = {
		register: (ComponentClass, name) => assembler.register(ComponentClass, name),
		registerAll: classMap => assembler.registerAll(classMap),
		run: () => assembler.run()
	};

	//
	// Expose additional attributes for the tests.
	//
	try {
		if (process.env.TEST) {
			api.index = assembler.index;
			api.components = assembler.components;
		}
	} catch (e) {}

	return api;
};

export default assembler;
