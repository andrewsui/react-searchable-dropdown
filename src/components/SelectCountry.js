import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

export default function SelectCountry() {
    // Select user (id=1: admin user, id=2: non-admin) based on query string parameters for simple test toggle purposes only
    const userId = parseInt(window.location.search.replace(`?user-id=`, ''))===1 ? parseInt(window.location.search.replace(`?user-id=`, '')) : 2;

    // Set max number of countries initially displayed in list
    const maxDisplay = 4;

    // useState variables and setters
    const [countries, setCountries] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [extraCountriesCount, setExtraCountriesCount] = useState(0);
    const [displayAllToggle, setDisplayAllToggle] = useState(false);
    const [countryExistsInDb, setCountryExistsInDb] = useState(true);

    // useRef variables
    const searchElementRef = useRef();
    const isUserAdminRef = useRef();

    // Function to compare alphabetical order of countries from returned results
    const compare = (a,b) => a.value > b.value ? 1 : -1;

    // Debounce function
    const debounce = (func, wait) => {
        let timeout;
    
        // Function to be executed many times. Spread (...args) to capture any number of parameters.
        return function executedFunction(...args) {
    
            // Callback function to be executed after debounce time has elapsed
            const later = () => {
                // null timeout to indicate the debounce ended
                timeout = null;
                
                // Execute the callback
                func(...args);
            };
            // Reset waiting every time function executed
            clearTimeout(timeout);
            
            // Restart the debounce waiting period
            timeout = setTimeout(later, wait);
        };
    };

    // Function to get matching countries using debounce
    let getCountries = debounce(() => {
        fetch('json/countries.json')
        .then(response => response.json())
        .then(data => {
            const filtered = data.filter(country => country.value.includes(searchInput.trim().toLowerCase())).sort(compare);
            displayAllToggle ? setCountries(filtered) : setCountries(filtered.slice(0, maxDisplay));
            setExtraCountriesCount(count => count = filtered.length - maxDisplay);
            filtered.length > 0 ? setCountryExistsInDb(bool => bool = true) : setCountryExistsInDb(bool => bool = false)
        });
    }, 300);

    // Get countries list from JSON to simulate database for test purposes only
    useEffect(getCountries, [searchInput, displayAllToggle]);

    // Check user's admin rights from JSON to simulate database for test purposes only
    useEffect(() => {
        fetch('json/users.json')
        .then(response => response.json())
        .then(data => {
            const filterUser = data.filter(user => user.id===userId);
            isUserAdminRef.current = filterUser[0].isAdmin;
            searchElementRef.current.focus(); // On page load, focus on search box
        });
    });

    return (
        <React.Fragment>
            {/* Search box */}
            <input
                ref={searchElementRef}
                type="text"
                id="search-input"
                name="searchInput"
                value={searchInput}
                placeholder="Search..."
                onChange={e => setSearchInput(e.target.value)}
            />

            {isUserAdminRef.current && !countryExistsInDb ? <button>Add</button> : null}

            {/* Filtered search options */}
            <div className="select-country-container">
                {countries.map(country => {
                    return (
                        <option
                            key={`country-${country.id}`}
                            onClick={e => {
                                // When country option is selected, populate search input text box with selected country
                                setSearchInput(e.target.value);
                                // Focus on search input text box
                                searchElementRef.current.focus();
                            }}
                            name="country"
                            data={country.id}
                            value={country.value}
                            className="select-country-option"
                        >
                            {country.display}
                        </option>
                    )
                })}
                {extraCountriesCount>0 ? <option className="more-countries" onClick={() => setDisplayAllToggle(!displayAllToggle)}>{displayAllToggle ? "Hide..." : `${extraCountriesCount} more...`}</option> : null}
            </div>
            
            {/* If country does not exist in database, show message */}
            {isUserAdminRef.current && !countryExistsInDb ? <p>Couldn't find a match, would you like to add this country?</p> : null}
            {!isUserAdminRef.current && !countryExistsInDb ? <p>Sorry, couldn't find any countries that match.</p> : null}
        </React.Fragment>
    );
}
