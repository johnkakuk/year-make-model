// Imports your SCSS stylesheet
import './styles/index.scss';

// Import cars
import cars from './car-dataset.json';

// Elements
const yearDropdown  = document.querySelector('.vehicles-year select');
const makeDropdown  = document.querySelector('.vehicles-make select');
const modelDropdown = document.querySelector('.vehicles-model select');
const vehicleList = document.querySelector('.vehicle-display');

// Pagination variables
let returnedCars;
let activePage = 0;
let totalPages = 0;

// Shorthand for inserting HTML
function print(output, tag, html, ...classes) {
    const content = document.createElement(tag);
    if(classes.length) content.classList.add(...classes);
    content.innerHTML = html;
    output.appendChild(content);
}

// Handle pagination
function handlePagination(e) {
    if(e.target.classList.contains("page") && !e.target.classList.contains("disabled")) {
        console.log(`Turn to page ${e.target.innerHTML}`);
    }
    if(e.target.classList.contains("next") && !e.target.classList.contains("disabled")) {
        console.log("Clicked next");
    }
    if(e.target.classList.contains("prev") && !e.target.classList.contains("disabled")) {
        console.log("Clicked prev");
    }
}

// Handle select change event
function handleSelect(e) {
    if(e.target == yearDropdown) {
        // Reset other columns' innerHTML in case of future selection
        makeDropdown.disabled = true;
        makeDropdown.innerHTML = "<option disabled>Vehicle Make</option>\n<option disabled>---</option>";
        makeDropdown.selectedIndex = 0;
        makeDropdown.parentElement.classList.add("disabled");
        modelDropdown.disabled = true;
        modelDropdown.innerHTML = "<option disabled>Vehicle Model</option>\n<option disabled>---</option>";
        modelDropdown.selectedIndex = 0;
        modelDropdown.parentElement.classList.add("dropdown-disabled");
        vehicleList.innerHTML = "<h2>Available Vehicles</h2>\n<p>Nothing to show yet.</p>"

        // Get makes of the chosen year:
        // cars.filter: Filter cars for cars that match the selected year
        // .map: get Manufacturers from returned cars
        // new Set(): array to Set (filters out dupes)
        // Set back to array
        // .sort(): localeCompare sorts alphabetically
        const makes = [...new Set(cars.filter((car) => car.year == yearDropdown.value).map(car => car.Manufacturer))].sort((a, b) => a.localeCompare(b));

        // Checks for positive results, kind of redundant since it'll only populate results with matches anyway
        if(makes.length > 0) {
            // Populate next form
            makes.forEach(make => {
                print(makeDropdown, "option", make);
            });

            // Enable next form
            makeDropdown.disabled = false;
            makeDropdown.parentElement.classList.remove("dropdown-disabled");
            makeDropdown.selectedIndex = 0;
        }
    }
    if(e.target == makeDropdown) {
        // Clear innerHTML in case of future selection
        modelDropdown.disabled = true;
        modelDropdown.innerHTML = "<option disabled>Vehicle Model</option>\n<option disabled>---</option>";
        modelDropdown.selectedIndex = 0;
        vehicleList.innerHTML = "<h2>Available Vehicles</h2>\n<p>Nothing to show yet.</p>"

        // Get models of chosen year and make:
        // cars.filter: Filter cars for cars that match the selected year AND make
        // .map: get Models from returned cars
        // new Set(): to filter out dupes (but why are there even dupes to begin with? Maybe this is an inventory list, not a lookup tool)
        // .sort(): localeCompare sorts alphabetically
        const models = [...new Set(cars.filter((car) => (car.year == yearDropdown.value && car.Manufacturer == makeDropdown.value)).map(car => car.model))].sort((a, b) => a.localeCompare(b));

        // Check for positive results
        if(models.length > 0) {
            // Populate next form
            models.forEach(model => {
                print(modelDropdown, "option", model);
            });

            // Enable next form
            modelDropdown.disabled = false;
            modelDropdown.parentElement.classList.remove("dropdown-disabled");
        }
        
    }
    if(e.target == modelDropdown) {
        // Nothing happens for now. Would theoretically connect to search function on an actual app
        // You know what? Let's get a little crazy

        // Get cars 
        // cars.filter: Filter cars for chosen year, make, and model
        // No map since we want all values (Ah! It IS an inventory list)
        // No Set since we WANT dupes this time
        // No sort for now. Maybe add sorting for price H-L and L-H later?
        returnedCars = cars.filter((car) => (car.year == yearDropdown.value && car.Manufacturer == makeDropdown.value && car.model == modelDropdown.value));
        
        if(!returnedCars.length > 0) return;

        if (returnedCars.length <= 8){
            // Just print if 8 or fewer cars
            // Reprint w/o nothing here indicator
            vehicleList.innerHTML = "<h2>Available Vehicles</h2>"

            returnedCars.forEach(car => {
                const html = `
                <div class="vehicle-image"></div>
                <div class="vehicle-loop-details">
                    <h3>${car.year} ${car.Manufacturer} ${car.model} – <span class="price">$${car.price.toLocaleString()}</span></h3>
                    <p>${car.transmission} Transmission | ${car.mileage.toLocaleString()} miles | ${car.mpg} MPG</p>
                </div>`;
                print(vehicleList, "div", html, "vehicle-loop");
            });
        }

        if (returnedCars.length > 8) {
            // Do pagination if 8 or more cars
            totalPages = Math.ceil(returnedCars.length / 8);

            console.warn(`${returnedCars.length} cars found`);
            console.warn(`${totalPages} pages`);

            // Reprint w/o nothing here indicator
            vehicleList.innerHTML = "<h2>Available Vehicles</h2>"

            // Print first 8 cars
            returnedCars.slice(0, 8).forEach(car => {
                const html = `
                <div class="vehicle-image"></div>
                <div class="vehicle-loop-details">
                    <h3>${car.year} ${car.Manufacturer} ${car.model} – <span class="price">$${car.price.toLocaleString()}</span></h3>
                    <p>${car.transmission} Transmission | ${car.mileage.toLocaleString()} miles | ${car.mpg} MPG</p>
                </div>`;
                print(vehicleList, "div", html, "vehicle-loop");
            });

            // Print empty pagination element
            print(vehicleList, "ul", null, "pagination");

            // INITIAL PAGINATION PRINT
            // Print prev button
            print(document.querySelector('.vehicle-display .pagination'), "li", "<", "prev", "disabled");

            // Print all numbers if 8 or fewer pages
            if (totalPages <= 8) {
                for(let i = 0; i < 8; i++) {
                    print(document.querySelector('.vehicle-display .pagination'), "li", i);
                }
            }

            if (totalPages > 8) {
                
                // Print pages 1-6
                for(let i = 0; i < 6; i++) {
                    print(document.querySelector('.vehicle-display .pagination'), "li", i + 1, "page");
                }
                // Print ellipsis
                print(document.querySelector('.vehicle-display .pagination'), "li", "…", "disabled");
                
                // Print last page
                print(document.querySelector('.vehicle-display .pagination'), "li", totalPages, "page");
            }

            // Print next button
            print(document.querySelector('.vehicle-display .pagination'), "li", ">", "next");

            // Add event listeners to numbers
            document.querySelectorAll('.vehicle-display .pagination li').forEach(button => {
                button.addEventListener('click', handlePagination);
            });
        }
    }
}

// BOOT
(() => {
    // Add event listeners
    [yearDropdown, makeDropdown, modelDropdown].forEach(el =>
        el.addEventListener('change', handleSelect)
    );

    // Step 1: Populate Year selector
    // cars.map: get array of year property from cars with map
    // new Set(): turn our array into a set to filter out dupes
    // years = []: lift Set up to an array
    // .sort(): sort it reverse chronologically
    const years = [...new Set(cars.map(car => car.year))].sort((a, b) => b - a);

    // Print each unique year to the dropdown with print()
    years.forEach(year => {
        print(yearDropdown, "option", year);
    });

})();
