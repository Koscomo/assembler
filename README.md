# @reduct/assembler
[![Build Status](https://travis-ci.org/reduct/assembler.svg)](https://travis-ci.org/reduct/assembler) [![Dependency Status](https://david-dm.org/reduct/assembler.svg)](https://david-dm.org/reduct/assembler) [![devDependency Status](https://david-dm.org/reduct/assembler/dev-status.svg)](https://david-dm.org/reduct/assembler#info=devDependencies) [![Code Climate](https://codeclimate.com/github/reduct/assembler/badges/gpa.svg)](https://codeclimate.com/github/reduct/assembler) [![Test Coverage](https://codeclimate.com/github/reduct/assembler/badges/coverage.svg)](https://codeclimate.com/github/reduct/assembler/coverage)

> Parses a DOM Node for tags and executes the matching Constructor on each element. This module embraces the practice of a 'Single Point of Entry'-Application(SPE).

## Why?
Using a single point of entry reduces code and promotes maintainability. Instead of writing the following accross all of your sites/apps components:
```js
// An example using jQuery/Zepto.
$('.myAwesomeApp').each(function(index, node) {
	new AwesomeApp(node);
});
```

... you will just create an assembler, which does all the initializing logic for you. It also reduces the number of operations in the DOM, which is great for performance since DOM operations are generally slow. Last but not least, your apps/components are free of selectors, you don't need to adjust your component if another project forbids the use of classes or a certain `data-*` attribute as a JS selector.

TL;DR: Use an assembler, to reduce duplicate code, enhance performance and reduce the dependence of selectors in your JS.


## Install
With npm, use the familiar syntax e.g.:
```shell
npm install @reduct/assembler --save
```

once the Assembler package is installed, just require it in the main application file.
```js
var assembler = require('@reduct/assembler');
```

This package also supports AMD/RequireJS, it is defined as `reductAssembler`. Aren't using AMD/CommonJS? Just grab a [release](https://github.com/reduct/assembler/releases), include the `Dist/Assembler.min.js` and access the loader via the following global:
```js
var Assembler = window.reductAssembler;
```

### Configuration
In the main application file, create a new instance of the Constructor e.g.:
```js
// Initialize a new instance of the Assembler.
import MyComponent from 'MyComponent';
import YetAnotherComponent from 'YetAnotherComponent';

let app = assembler();

app.register(MyComponent);
app.register(YetAnotherComponent)

app.boot();
```

### Options

**To be ported**

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.


## License
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
