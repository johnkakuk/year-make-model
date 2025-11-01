// Imports your SCSS stylesheet
import './styles/index.scss';

// Import cars
import cars from './car-dataset.json';

// Elements
const yearDropdown  = document.querySelector('.vehicles-year select');
const makeDropdown  = document.querySelector('.vehicles-make select');
const modelDropdown = document.querySelector('.vehicles-model select');
const vehicleList = document.querySelector('.vehicle-display');
let pagination;

// Pagination variables
let returnedCars;
let activePage;
let totalPages;

// Shorthand for inserting HTML
function print(output, tag, html, ...classes) {
    const content = document.createElement(tag);
    if(classes.length) content.classList.add(...classes);
    content.innerHTML = html;
    output.appendChild(content);
}

// Handle pagination calculation
function handlePagination(e) {
    if (e.target.classList.contains("page") && !e.target.classList.contains("disabled")) {
        activePage = Number(e.target.innerHTML) - 1; // convert 1-based label to 0-based index
    } else if (e.target.classList.contains("next") && !e.target.classList.contains("disabled")) {
        activePage++;
    } else if (e.target.classList.contains("prev") && !e.target.classList.contains("disabled")) {
        activePage--;
    } else {
        return;
    }

    reprintCars();
}

// Print pagination
function reprintCars() {
    // Get the X set of cars
    let carsPrinted = 0;

    // Reprint w/o nothing here indicator
    vehicleList.innerHTML = "<h2>Available Vehicles</h2>"

    // Print first 8 cars
    returnedCars.slice(activePage * 8, activePage * 8 + 8).forEach(car => {
        const html = `
        <div class="vehicle-image"></div>
        <div class="vehicle-loop-details">
            <h3>${car.year} ${car.Manufacturer} ${car.model} – <span class="price">$${car.price.toLocaleString()}</span></h3>
            <p>${car.transmission} Transmission | ${car.mileage.toLocaleString()} miles | ${car.mpg} MPG</p>
        </div>`;
        print(vehicleList, "div", html, "vehicle-loop");
        carsPrinted++;
    });

    // Print additional blank divs to minimize CLS
    while(carsPrinted < 8) {
        const html = `
        <div class="vehicle-image"></div>
        <div class="vehicle-loop-details">
            <h3>Hidden Div</h3>
            <p>Hidden Div<br>Hidden Div</p>
        </div>`;
        print(vehicleList, "div", html, "vehicle-loop-ghost");
        carsPrinted++;
    }

    // REPRINT PAGINATION 
    // Print empty pagination element
    print(vehicleList, "ul", null, "pagination");

    // Define pagination variable
    pagination = document.querySelector('.vehicle-display .pagination');

    // START AI
    // Prev button
    if (activePage === 0) {
        print(pagination, "li", "&lt;", "prev", "disabled");
    } else {
        print(pagination, "li", "&lt;", "prev");
    }

    const visibleCount = 9; // always show 9 items in the number strip

    if (totalPages <= visibleCount) {
        // Simple case: show all pages
        for (let i = 1; i <= totalPages; i++) {
            if (i - 1 === activePage) {
                print(pagination, "li", i, "page", "disabled");
            } else {
                print(pagination, "li", i, "page");
            }
        }
    } else {
        const windowSize = 5;
        const firstLabel = 1;
        const lastLabel = totalPages;

        // Always print page 1
        if (activePage === 0) {
            print(pagination, "li", firstLabel, "page", "disabled");
        } else {
            print(pagination, "li", firstLabel, "page");
        }

        // Determine centered window around active page (labels are 1-based)
        let start = (activePage + 1) - Math.floor(windowSize / 2);
        let end = (activePage + 1) + Math.floor(windowSize / 2);

        // Clamp to [2, lastLabel - 1]
        if (start < 2) {
            start = 2;
            end = start + windowSize - 1; // fill to window size
        }
        if (end > lastLabel - 1) {
            end = lastLabel - 1;
            start = end - windowSize + 1;
        }

        // Left ellipsis if we cut off pages after 1
        if (start > 2) {
            print(pagination, "li", "…", "disabled");
        }

        // Middle window
        for (let i = start; i <= end; i++) {
            if (i - 1 === activePage) {
                print(pagination, "li", i, "page", "disabled");
            } else {
                print(pagination, "li", i, "page");
            }
        }

        // Right ellipsis if we cut off pages before last
        if (end < lastLabel - 1) {
            print(pagination, "li", "…", "disabled");
        }

        // Always print last page
        if (lastLabel - 1 === activePage) {
            print(pagination, "li", lastLabel, "page", "disabled");
        } else {
            print(pagination, "li", lastLabel, "page");
        }
    }

    if (activePage === totalPages - 1) {
        print(pagination, "li", "&gt;", "next", "disabled");
    } else {
        print(pagination, "li", "&gt;", "next");
    }

    // END AI

    // Add event listeners to numbers
    document.querySelectorAll('.vehicle-display .pagination li').forEach(button => {
        button.addEventListener('click', handlePagination);
    });
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
            activePage = 0; // zero-based index for current page
            totalPages = Math.ceil(returnedCars.length / 8);
            reprintCars();
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