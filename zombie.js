var Zombie = function(document){
    var zombie = this;

    this.globalStyleArr = [];
    this.tagsArr = [];
    this.sheetsArr = [];
    this.zombieSelectors = [];

    this.MAX_REFRESHES = 15;
    this.current_refreshes = 0;

    // Remove UI in case it's run more than once
    if(document.getElementById('zombie-wrapAll') !== null){
        document.getElementById('zombie-bg').remove();
        document.getElementById('zombie-wrapAll').remove();
        document.getElementById('zombie-button').remove();
    }
    
    // Re-Add the UI
    document.body.innerHTML = document.body.innerHTML + '<div id="zombie-bg"></div><div id="zombie-wrapAll"></div><div id="zombie-button">Z</div>';

    this._debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    this._unusedSelectors = function(styles){
        var scope = this;

        this.csv = 0;
        this.styleTags = 0;
        this.mediaQueries = 0;
        this.selectorArr = [];
        this.uniqueSelectors = [];
        this.duplicateSelectors = 0;

        this.loopCSSRules = function(rules){
            for(var i = 0; i < rules.length; i++){
                var selectors = rules[i].selectorText;
                if(selectors){
                    scope.loopSelectors(selectors);

                }
                else{
                    // Handle Media Queries
                    var mediaRules = rules[i].cssRules;
                    scope.loopCSSRules(mediaRules);
                    scope.mediaQueries++;
                }
            }
        }

        this.loopSelectors = function(selectors){

            if(selectors.indexOf(',') == -1){
                var select = document.querySelectorAll(selectors);
                if(select.length <= 0) scope.selectorArr.push(selectors);
            }
            else{
                scope.csv++;
                selectors = selectors.split(',');
                for(var s = 0; s < selectors.length; s++){
                    var select = document.querySelectorAll(selectors[s]);
                    if(select.length <= 0) scope.selectorArr.push(selectors[s]);
                }
            }
        }

        this.removeDuplicates = function(selectors){
            Array.prototype.forEach.call(selectors, function(el, i){
                if(scope.uniqueSelectors.indexOf(el) === -1){
                    scope.uniqueSelectors.push(el);
                } 
                else{
                    scope.duplicateSelectors++;
                }
            });
            scope.report();
        }

        this.report = function(){
            console.log('BRAAAAAAAAAINS!');
            console.log('Style Tags/Sheets: ' + scope.styleTags);
            console.log('Media Queries: ' + scope.mediaQueries);
            console.log('Comma-Separated Selectors: ' + scope.csv);
            console.log('Duplicate Selectors: ' + scope.duplicateSelectors);
            console.log('Zombie Selectors: ' + scope.uniqueSelectors.length);
        }

        this.run = (function(){
            scope.styleTags = styles.length;

            for(var o = 0; o < scope.styleTags; o++){
                try{
                    var rules = styles[o].sheet.cssRules;
                    scope.loopCSSRules(rules);
                }
                catch(e){
                    var rules = [];
                    scope.loopCSSRules(rules);
                }
            }
            scope.removeDuplicates(scope.selectorArr);
        }());

        return scope.uniqueSelectors;
    }

    this._constructArr = function(childArr, parentArr, name){
        for(var i = 0; i < childArr.length; i++){
            var textContent = childArr[i].innerText;
            var linesArr = textContent.split(/\r|\n/g);
            var totalLines = linesArr.length;
            parentArr[0][name].push(linesArr);
        }
    }

    // Main Program
    this.runZombieCSS = function(){

        // Limit the number of times this can be run per page load
        if(zombie.current_refreshes >= zombie.MAX_REFRESHES){
            // zombie.kill();
            zombie.runZombieCSS = function(){};
            Zombie.run = function(){};
            console.warn('ZombieCSS has reached it\'s limit of refreshes.\nListeners have been killed, but style data is still available.');
            return false;
        }

        document.getElementById('zombie-wrapAll').innerHTML = '';

        zombie.globalStyleArr = [{tags: []}, {sheets: []}];
        zombie.tagsArr = zombie.globalStyleArr[0]['tags'];
        zombie.sheetsArr = zombie.globalStyleArr[1]['sheets'];

        // Style Tags (will have to loop through but use 1 for example)
        var styles = document.querySelectorAll("style:not(#zombieStyles)");
        if(styles.length > 0) zombie._constructArr(styles, zombie.globalStyleArr, 'tags');

        // For external stylesheets
        var sheets = [];
        // Avoid grabbing Google Fonts
        var links = document.querySelectorAll('link:not([href*="fonts.googleapis"])');
        if(links.length > 0){
            for(var i = 0; i < links.length; i++){
                var attr = links[i].attributes;
                // Ignore font stylesheets, require attr.type
                if(attr.type && (attr.type.nodeValue == 'text/css' || attr.rel.nodeValue =='stylesheet')){
                    sheets.push(links[i]);
                } 
            }
            for(var o = 0; o < sheets.length; o++){
                var sheet = sheets[o];
                try{
                    var rules = (sheets[o].sheet) ? sheets[o].sheet.cssRules: [];
                }
                catch(e){
                    rules = [];
                }
                zombie.sheetsArr[links[o].href] = [];

                for(var i = 0; i < rules.length; i++){
                    var arr = zombie.sheetsArr[links[o].href];
                    arr.push(rules[i].cssText);
                }
            }
        }

        // concat() doesn't work for these so manually join arrays
        var uncleanedSelectors = sheets;
        for(var i = 0; i < styles.length; i++) uncleanedSelectors.push(styles[i]);

        // Grab all the unused selectors
        zombie.zombieSelectors = zombie._unusedSelectors(sheets);

        // Show the button if there's unused selectors
        if(zombie.zombieSelectors.length > 0){
            document.getElementById('zombie-button').classList.add('shown');
        }

        // Spit out the stylesheets
        function buildInterface(arr, type){
            var container = document.getElementById('zombie-wrapAll');

            var iterator = (type == 'tag') ? arr.length : Object.keys(arr).length;

            for(var o = 0; o < iterator; o++){
                var title = (type == 'tag') ? 'Style ' + (o + 1) : Object.keys(arr)[o];

                var template = '<div class="zombie-wrapper ' + type + '"><div class="zombie-title">' + title + '</div><div class="zombie-console"></div></div>';
                container.innerHTML = container.innerHTML + template;

                var editor = document.querySelector('.zombie-wrapper:last-of-type').querySelector('.zombie-console');
                var obj = (type == 'tag') ? arr[o] : arr[Object.keys(arr)[o]];

                for(var i = 0; i < obj.length; i++){
                    var line = '<div class="zombie-line"><div class="zombie-lineNumber">' + (i + 1) + '</div><div class="zombie-content">' + obj[i].replace(/ /g, '&nbsp;') + '</div></div>';
                    editor.innerHTML = editor.innerHTML + line;
                }
            }
        }
        buildInterface(zombie.tagsArr, 'tag');
        buildInterface(zombie.sheetsArr, 'sheet');

        // Highlight lines with unused selectors
        var zContent = document.querySelectorAll('.zombie-content');
        for(var i = 0; i < zContent.length; i++){
            var line = document.querySelectorAll('.zombie-content')[i];
            var selectors = line.innerHTML.replace(/&nbsp;/g,' ').trim().split(',');

            for(var s = 0; s < selectors.length; s++){
                var selector = selectors[s].split('{')[0].trim();

                if(zombie.zombieSelectors.indexOf(selector) > -1){
                    var zLine = document.querySelectorAll('.zombie-line')[i];
                    if(zLine.classList) zLine.classList.add('highlight');
                    else zLine.className += ' highlight';
                    break;
                }
            }
        }

        zombie.live();
        // zombie.stalk();

        zombie.current_refreshes++;
    }

    this.observer;

    this.stalk = function(){
        // Listen to the DOM for changes
        // Mutation observers are supported pretty widely, except IE which is 11+
        if(window.MutationObserver){
            var zombieTarget = document.querySelectorAll('body')[0];

            // May need to disconnect observer and reset it to throttle
            var wait = zombie._debounce(function(){ 
                zombie.runZombieCSS(); 
                setTimeout(function(){
                    // Re-create the obeserver
                    zombie.observer.observe(zombieTarget, zombieConfig);
                }, 1000);
            }, 1000, false);

            function zombieHandleMutations(mutations){
                mutations.forEach(function(mutation) {
                    // If it was a mutation to the target's children, rerun the program
                    if(mutation.type == 'childList' && mutation.addedNodes.length >= 1){
                        wait();
                        // Prevent too many mutations at once (via the console)
                        zombie.observer.disconnect();
                    }
                });

            }

            // Create an observer instance
            zombie.observer = new MutationObserver(zombieHandleMutations);

            // Configuration of the observer (only listen for new elements):
            var zombieConfig = { attributes: false, childList: true, subtree: true, characterData: false };

            // Pass in the target node, as well as the observer options
            zombie.observer.observe(zombieTarget, zombieConfig);
        }

    }

    this.kill = function(){
        zombie.observer.disconnect();
    }

    this.live = function(){
        // Open/Close Stylesheets 
        var elems = document.querySelectorAll('.zombie-wrapper .zombie-title');
        Array.prototype.forEach.call(elems, function(el, i){
            elems[i].addEventListener('click', function(e){
                elems[i].nextElementSibling.classList.toggle('shown');
            });
        });
    }

    var zBtn = document.getElementById('zombie-button');
    zBtn.addEventListener('click', function(e){
        document.getElementById('zombie-bg').classList.toggle('shown');
        document.getElementById('zombie-wrapAll').classList.toggle('shown');
        if(document.getElementById('zombie-bg').classList.contains('shown')){
            scrollToTop();
        }
    });

    return {
        zombie: this,
        //kill: zombie.kill,
        //stalk: zombie.stalk,
        run: zombie.runZombieCSS,
        live: zombie.live
    };
}

// Run the program
var zombie = new Zombie(window.parent.document);
zombie.run();

function scrollToTop(){
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}