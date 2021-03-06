# ZombieCSS
Find any unused CSS in your code for quicker, cleaner development.

ZombieCSS parses any attached stylesheets and inline style tags and detects selectors that are not present in the document.
A "Z" button will appear in the bottom right corner of your screen if any unused selectors are detected, and clicking this button
will bring up each style, with the corresponding line highlighted. 

### Mutation Observers
If Mutation Observers are supported by your browser, ZombieCSS will listen for changes to the body and re-run.
These listeners are helpful for detecting dynamically added classes or elements that may have falsely returned 
as unused the first time it was run.

Calls to the main function are limited to 15 calls per page load (refreshing the page will start over again). 
This limit is set in place to prevent a decrease in performance for pages that are dynamically updated very frequently.
Each call to the main function is "debounced" and set on a 1000ms timeout to prevent too many calls happening at once.

### Exposed Methods
Although in most instances they will not be necesary, the Zombie object returns a handful of methods that may be called.
```javascript
Zombie.zombie // Reference to the instance of the Zombie object

Zombie.run(); // Manually runs the main function

Zombie.live(); // Creates the event listners for each "tab" containing styles

Zombie.stalk(); // Creates the Mutation Observer that listens to changes to the body

Zombie.kill(); // Destroys the Mutation Observer and stops listening for changes
```

### Qwirks and Limitations
- ZombieCSS has been observed to break certain pages that are built on Angular and React (my assumption is that this is a result of
  basically everything in the document being built dynamically).

### Misc
- ZombieCSS is written in pure vanilla Javascript as to avoid any dependencies.
- ZombieCSS automatically appends it's own stylesheet (which gets ignored by the program) and mobile-responsive meta tag to the head
of your page.
- Due to CORS policies, ZombieCSS can only effectively parse stylesheets of the same origin. Cross-domain stylesheets will be counted, but not parsed.
- At the time of writing, ZombieCSS has been tested in Chrome, FireFox, and Edge.

***

# Updates:
- On 3/26/2019 this repository was updated to the Chrome Extension version of ZombieCSS. 
  - Mutation Observers are no longer supported but may be re-added in the future.
  - `Zombie.stalk()` and `Zombie.kill()` have been removed as a result of this change.
