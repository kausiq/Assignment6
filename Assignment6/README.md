**1) What is the difference between var, let, and const?**

•	**var**

o	Function-scoped.

o	Can be re-declared and re-assigned.

o	Hoisted to the top of the scope and initialized with undefined.

o	Problematic in large codebases due to accidental re-declaration.

•	**let**

o	Block-scoped.

o	Can be re-assigned but not re-declared in the same scope.

o	Hoisted but not initialized → causes a Temporal Dead Zone (TDZ) until the declaration is executed.

•	**const**
o	Block-scoped like let.

o	Cannot be re-assigned after initialization.

o	For objects/arrays, the reference is constant, but their contents can still be mutated.



**2) What is the difference between map(), forEach(), and filter()?**
   
•	**forEach(**)

o	Executes a callback for each item in the array.

o	Does not return anything.

o	Used for side effects.

•	**map()**

o	Transforms each item in the array using the callback.

o	Returns a new array of the same length.

o	Great for creating transformed data.

•	**filter()**

o	Returns a new array with only the elements where the callback returns true.

o	Array length may shrink depending on conditions.



**3) What are arrow functions in ES6?**

Arrow functions are a more concise way to write functions introduced in ES6.

Key characteristics:

•	They provide shorter syntax compared to traditional function expressions.

•	They do not have their own this; instead, they inherit this from the surrounding scope.

•	They also lack their own arguments object.

•	They cannot be used as constructors.

•	They support implicit return when the function body is a single expression.



**4) How does destructuring assignment work in ES6?**

Destructuring allows developers to unpack values from arrays or properties from objects directly into separate variables.

Important aspects:

•	It makes code cleaner and reduces repetition when accessing multiple values.

•	It can assign default values in case the property or element is missing.

•	It supports renaming variables while extracting.

•	It can be nested, meaning you can destructure objects or arrays inside other structures.



**5) Explain template literals in ES6. How are they different from string concatenation?**
   
Template literals are string literals that allow embedded expressions and multiline strings.

Differences from concatenation:

•	Instead of using the + operator, template literals let you directly embed variables and expressions inside the string.

•	They allow writing strings across multiple lines without special escape characters.

•	They can be used with tag functions for advanced string processing.

