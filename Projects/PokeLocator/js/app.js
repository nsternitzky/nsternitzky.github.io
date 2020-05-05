// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------

/**
 * Fetches data and converts response to JSON
 * @param {string} url - URL to fetch data from
 * @return {Promise} Promise object representing fetched data 
 */
function fetchData(url) {
    return fetch(url)
             .then(checkStatus)  
             .then(res => res.json())
             .catch(error => console.log('Error:', error))
}

/**
 * Checks status of fetch call response
 * @param {Response} Response object for fetch call
 * @return {Promise} Promise object - resolved if response ok, rejected if not
 */
function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

// ------------------------------------------
//  VUE
// ------------------------------------------

new Vue({
    el: '#locator-app',
    data: {
        speciesList: [],
        versionList: [],
        species: {
            name: '',
            img: ''
        },
        locationList: []
    },
    methods: {
        /**
         * Gets called when user selects option from dropdown list
         */
        handleSelect: function() {
            Promise.all([
                fetchData(`http://pokeapi.co/api/v2/pokemon/${this.species.name}/encounters`), //fetch location info
                fetchData(`http://pokeapi.co/api/v2/pokemon/${this.species.name}/`) //fetch species info for img
            ])
            .then(data => {
                //construct locationList from fetched data
                this.buildLocationList(data[0]);

                //set img to chosen species
                this.species.img = data[1].sprites.front_default;
            })
        },
        /**
         * Build locationList from provided data
         * @param {Array[]} data - array containing location data
         */
        buildLocationList: function(data) {
            this.locationList = data.reduce(function(obj,location) {
                for (let versionDetails of location.version_details) {

                    //if game version does not yet exist in obj array, create it
                    if (!obj.find(element => element.version === versionDetails.version.name)) {
                        obj.push({
                            version: versionDetails.version.name,
                            locations: []
                        });
                    }

                    //push location to array associated with the corresponding game version
                    obj.find(element => element.version === versionDetails.version.name).locations.push(location.location_area.name);
                }
                return obj;
            }, []);

            //sort locationList by game version in order of release date using versionList
            this.locationList.sort((a,b) => this.versionList.findIndex(item => item.name === a.version) - this.versionList.findIndex(item => item.name === b.version));
        },
        /**
         * Format species name for display purposes
         * @param {string} name - species name in raw data form
         * @return {string} formatted - formatted species name
         */
        formatSpeciesName: function(name) {
            //capitalize name
            let formatted = this.capitalize(name);

            //find hyphen at end of actual species name - exclude exceptional cases
            const hyphenRegEx = /-(?!(o(h*$|-))|z$|jr|mime)/g;
            const hyphenIndex = formatted.search(hyphenRegEx);

            //change unnecessary hyphens to spaces and place parentheses around additional information
            if (hyphenIndex > -1) {
                formatted = formatted.replace(hyphenRegEx,' ');
                formatted = `${formatted.slice(0, hyphenIndex)} (${formatted.slice(hyphenIndex + 1)})`;
            }

            //special cases
            if (name === 'mr-mime') {
                formatted = 'Mr. Mime';
            }

            if (name === 'mime-jr') {
                formatted = 'Mime Jr.';
            }

            return formatted;
        },
        /**
         * Format location name for display purposes
         * @param {string} location - location name in raw data form
         * @return {string} formatted - formatted location name
         */
        formatLocation: function(location) {
            //capitalize location
            let formatted = this.capitalize(location);

            //replace all hyphens with spaces
            formatted = formatted.replace(/-/g, ' ');

            return formatted;
        },
        /**
         * Format version name for display purposes
         * @param {string} version - version name in raw data form
         * @return {string} formatted - formatted version name
         */
        formatVersion: function(version) {
            //capitalize version
            let formatted = this.capitalize(version);

            //replace hyphens with spaces and capitalize additional words in version title
            const hyphenIndex = formatted.search('-');
            if (hyphenIndex > -1) {
                formatted = `${formatted.slice(0, hyphenIndex)} ${formatted.charAt(hyphenIndex + 1).toUpperCase()}${formatted.slice(hyphenIndex + 2)}`;
                formatted = formatted.replace(/-/g, ' ');
            }

            //special cases
            if (version === 'firered') {
                formatted = 'FireRed';
            }

            if (version === 'leafgreen') {
                formatted = 'LeafGreen';
            }

            if (version === 'heartgold') {
                formatted = 'HeartGold';
            }

            if (version === 'soulsilver') {
                formatted = 'SoulSilver';
            }

            return formatted;
        },
        /**
         * Capitalize first letter of string
         * @param {string} text - string to be capitalized
         * @return {string} capitalized string
         */
        capitalize: function(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        }
    },
    /**
     * Upon mounting, fetch data for species list and version list
     */
    mounted() {
        fetchData('http://pokeapi.co/api/v2/pokemon/')
            .then(data => fetchData(`http://pokeapi.co/api/v2/pokemon/?limit=${data.count}`))
            .then(data => this.speciesList = data.results.sort((a,b) => a.name > b.name ? 1 : -1))
        fetchData('http://pokeapi.co/api/v2/version/')
            .then(data => fetchData(`http://pokeapi.co/api/v2/version/?limit=${data.count}`))
            .then(data => this.versionList = data.results)
    }
  });