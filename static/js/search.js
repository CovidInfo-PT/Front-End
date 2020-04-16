/**
 * Index of the company selected to see details.
 */
var selected_id = -1;

/**
 * Number of results loaded in the page.
 */
var loadedResults = 0;

/**
 * Max. number of results to be loaded each time.
 */
var n_results = 9;

/**
 * Url for the api requests.
 */
var api_url = "https://api.proxi-mo.pt/";

/**
 * Array that stores the companies colected from the search.
 */
var companies = [];

/**
 * Array that translates integer day of the week by its name.
 */
var days = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];

/**
 * Coordinates of the selected county.
 */
var select_county_coords = []

/**
 * Icons for the categories
 */
var categories_icon = { "Saúde" : "fa-medkit", "Farmácia" : "fa-plus-square", "Restaurante" : "fa-utensils",
        "Mercado" : "fa-shopping-basket", "Padaria" : "static/img/padaria.svg", "Talho" : "static/img/faca.svg",
        "Peixaria" : "fa-fish", "Bomba de Combustível" : "fa-gas-pump", "Gás" : "fa-burn", "Oficina" : "fa-car-crash",
        "Banco" : "fa-money-check-alt", "Serviço Administrativo" : "fa-users-cog",
        "Telecomunicações" : "fa-satellite-dish", "Veterinário" : "fa-paw" }

/**
 * Requests the api for all districts available and
 * populates the dropdown with the id "districts"
 * by inserting elements in the table with the id "districts_items".
 */
function getDistricts(){
    /* Api call*/
    $.ajax({
        "url": api_url+"all_districts", 
        "Access-Control-Allow-Origin" : "*",
        success : function(data){
            /* Get the table by its id */
            var select = document.getElementById('districts_items');

            /* For each district generate an li element and insert it
             int the table. */
            data["districts"].forEach(district => {
                var li = document.createElement("li");

                var option = document.createElement('a');
                option.classList.add("dropdown-item");
                option.innerText = district;
                /* Onclick event to load the counties of the district */
                option.onclick = function(){
                    getCounty(district);
                }
                li.appendChild(option);
                select.appendChild(li);
            });
            /* Allow the user to select districts */
            document.getElementById('districts').removeAttribute("disabled");
        }
    });
}

/**
 * Requests the api for the counties of a given district
 * and populates the dropdown with the id "counties" by
 * inserting elements in the table with the id "counties_items".
 * 
 * @param {Name of the district to collect the counties} selected_district 
 */
function getCounty(selected_district){
    /* Change the selected option in the "districts" dropdown to the current selected district. */
    document.getElementById("districts").innerText = selected_district;

    /* Get the counties table element. */
    var select = document.getElementById('counties_items');

    /* Disable the dropdown while loading the counties */
    document.getElementById('counties').disabled = true;

    /* Disable the search button */
    document.getElementById('search_button').disabled = true;

    /* API call */
    $.ajax({
        url: api_url+"counties_by_distric?district="+selected_district, 
        "Access-Control-Allow-Origin" : "*",
        success : function(data){
            /* Clear the available options in the dropdown */
            select.innerHTML = '';
            
            /* Change the currently selected option to the default */
            document.getElementById("counties").innerText = "Concelhos";

            /* For each county returned generate an li element and insert it
             in the table. */
            data["counties"].forEach(county => {
                var li = document.createElement("li");
                var option = document.createElement('a');
                option.classList.add("dropdown-item");
                option.innerText = county[0];
                /* Onclick event to enable search. */
                option.onclick = function(){
                    selectCounty(county);
                }
                li.appendChild(option);
                select.appendChild(li);
            });
            /* Enable the countie dropdown again.*/
            document.getElementById('counties').removeAttribute("disabled");
        }
    });
}

/**
 * Enable the search button and update the coordinates
 * of the selected county.
 * 
 * @param {Array of size 2 with th county name, county coordinates hash} county 
 */
function selectCounty(county){
    /* Change the selected value of the dropdown */
    document.getElementById('counties').innerText = county[0];

    /* Update the selected coordinate hash */
    selected_county = county[0];

    /* Enable the search button */
    document.getElementById("search_button").removeAttribute("disabled");
}

/**
 * Function that generates the general card view.
 * 
 * @param {JSON element with information about the company} company 
 * @param {Index of the card on the childList of the results div} id 
 */
function generate_card(company, id){
    /* Obtain the current day to show the corresponding schedule. */
    var temp_date = new Date();
    var week_day = days[ temp_date.getDay() ];
    var hour = temp_date.getHours();
    var minutes = temp_date.getMinutes();

    /* Div that contains the card. */
    var card_div = document.createElement('div');
    card_div.classList.add('col-xl-4');
    card_div.classList.add('col-lg-6');
    card_div.classList.add('col-sm-12');
    card_div.id = id;

    /* Logo image of the company (if empty use the default image). */
    var img = document.createElement('img');
    img.classList.add('card-img-top');
    if(company["images"]["logo"] != ''){
        img.src = company["images"]["logo"];
    }
    else{
        img.src = "static/img/default_logo.jpg"
    }
    img.alt = "Logo of the Company";
    
    /* Interior of the div. */
    var info_div = document.createElement('div');
    info_div.classList.add("card");
    /* Onclick event to load the detail version of the company. */
    info_div.onclick = function(){loadDetails(id)};

    /* Div that contains the text. */
    var inside_div = document.createElement('div');
    inside_div.classList.add("card-body");
    
    /* Company Name (h4 element). */
    var title = document.createElement('h4');
    title.classList.add('card-title');
    title.innerText = company["name"];

    /* Schedule of the company (p element). */
    var text = document.createElement('p');
    text.classList.add("card-text");
    /* Default schedule */
    text.innerText = "Encerrado";
    
    var i = 0;
    /* Search in the schedules of the day if the company is opened */
    for(; i < company["schedules"][week_day].length; i++){
        if(company["schedules"][week_day] == "Encerrado"){
            break;
        }
        var work_times = company["schedules"][week_day][i].split("-")
        var start_time = work_times[0].split(":");
        var end_time = work_times[1].split(":");
        if((start_time[0] < hour) || (start_time[0] == hour && start_time[1] <= minutes)){
            if((end_time[0] > hour) ||  (end_time[0] == hour && end_time[1] > minutes)){
                text.innerText = company["schedules"][week_day][i];
                break;
            }   
        }       
    }
    /* Append the company name and the schedule to the div with the text */
    inside_div.appendChild(title);
    inside_div.appendChild(text);

    /* Append the div with the text to the general one */
    info_div.appendChild(inside_div);

    /* Append the image and the content div to the card_div */
    card_div.appendChild(img);
    card_div.appendChild(info_div);

    return card_div;
}

/**
 * Function that generates the detaild card view.
 * 
 * @param {Index of the corresponding card on the childList of the results div} id 
 */
function generate_details(id){

    /* Div that contains the card. */
    var outside_card = document.createElement("div");
    
    outside_card.classList.add("col-xl-12");
    outside_card.classList.add("col-lg-12");
    outside_card.id = "details";
    var card_div = document.createElement("div");
    card_div.classList.add("details-card");

    /* Div that indicates that there are multiple collumns being used inside. */
    var row = document.createElement("div");
    row.classList.add("row");

    /* Div containing the first collum information. */
    var info1_div = document.createElement("div");
    info1_div.classList.add("col-xl-6");
    info1_div.classList.add("col-lg-12");
    info1_div.classList.add("details-card-section");

    /* Span element containing the address. */
    var address = document.createElement("span");
    var text_address = document.createElement("p");
    var splited_address = companies[id]["address"].split(",");

    /*If the address is spitable by a "," than split it breaking by that point. */
    text_address.innerHTML = splited_address.length > 1 ? splited_address[0] + ",<br/>" + splited_address[1] : companies[id]["address"];
    address.appendChild(text_address);

    /* Add address. */
    info1_div.appendChild(address);  
    
    /* Span element containing the contact info. */
    var contact = document.createElement("span");
    var text = document.createElement("p");
    text.innerHTML = "";
    /* For each cellphone insert it's contenct and a break line. */
    var counter = 0;
    companies[id]["contacts"]["cellphone"].forEach(contact => {
        if(contact != ""){
            if(counter != 0){
                text.innerHTML += "<br/>";
            }
            text.innerHTML += contact.slice(0,3) + " " + contact.slice(3,6) + " " + contact.slice(6,9);
            counter ++;
        }
    });
    /* For each telephone insert it's contenct and a break line. */
    companies[id]["contacts"]["telephone"].forEach(contact => {
        if(contact != ""){
            if(counter != 0){
                text.innerHTML += "<br/>";
            }
            text.innerHTML += contact.slice(0,3) + " " + contact.slice(3,6) + " " + contact.slice(6,9);
        }
    });
    contact.appendChild(text);
    
    /* Add the contact info. */
    info1_div.appendChild(contact);

    /* Span containing home delevery info. */
    var delevery = document.createElement("span");
    delevery.classList.add("col-xl-12");
    delevery.classList.add("col-lg-12");
    delevery.classList.add("detail-title");

    delevery.innerHTML = "<p><b> Entregas ao Domicílio: </b></p>";
    /* If home_delevery is true than append yes otherwise append No. */
    delevery.innerHTML += companies["home_delivery"] ? "<p>Sim</p>" : "<p>Não</p>";

    /* Add home delevery info. */
    info1_div.appendChild(delevery);

    /* Span containing the social pages information. */
    var categories = document.createElement("span");
    categories_text = document.createElement("p");
    categories_text.innerHTML = "<b>Categorias:</b>";
    categories.appendChild(categories_text);
    /* Div to indicate the use of collumns inside. */
    var categories_div = document.createElement("div");
    categories_div.classList.add("row");
    /* Use the hole row as one collumn. */
    var categories_col = document.createElement("div");
    categories_col.classList.add("col-12")

    for(l = 0; l < companies[id]["categories"].length; l++){
        if(companies[id]["categories"][l] == "Padaria" || companies[id]["categories"][l] == "Talho"){
            var category = document.createElement("img");
            category.src = categories_icon[companies[id]["categories"][l]];
            category.classList.add("card-category-img");
            categories_col.appendChild(category);
        }
        else{
            var category = document.createElement("i");
            category.classList.add("fas");
            category.classList.add(categories_icon[companies[id]["categories"][l]]);
            if(companies[id]["categories"][l] != "Banco" && companies[id]["categories"][l]  != "Serviço Administrativo"){
                category.classList.add("fa-lg");
            }
            category.classList.add("button");
            categories_col.appendChild(category);
        }
    }

    /* Append the collumn div to the row div. */
    categories_div.appendChild(categories_col);

    /* Append the row div to the span div. */
    categories.appendChild(categories_div);

    /* Add the categories info. */
    info1_div.appendChild(categories);

    /* Span containing the social pages information. */
    var social = document.createElement("span");
    social_text = document.createElement("p");
    social_text.innerHTML = "<b>Redes Sociais:</b>";
    social.appendChild(social_text);

    /* Div to indicate the use of collumns inside. */
    var social_div = document.createElement("div");
    social_div.classList.add("row");

    /* Use the hole row as one collumn. */
    var div_col = document.createElement("div");
    div_col.classList.add("col-12")

    /* If it contains a facebook link, insert the facebook icon and the link. */
    if(companies[id]["social"]["facebook"] != ""){
        var a = document.createElement("a");
        var fb = document.createElement("i");
        fb.classList.add("fab");
        fb.classList.add("fa-facebook");
        fb.classList.add("fa-lg");
        fb.classList.add("button");
        a.href = companies[id]["social"]["facebook"];
        a.target = "_blank";
        a.appendChild(fb)
        div_col.appendChild(a);
    }
    /* If it contains a instagram link, insert the instagram icon and the link. */
    if(companies[id]["social"]["instagram"] != ""){
        var a = document.createElement("a");
        var ig = document.createElement("i");
        ig.classList.add("fab");
        ig.classList.add("fa-instagram");
        ig.classList.add("fa-lg");
        ig.classList.add("button");
        a.href = companies[id]["social"]["instagram"];
        a.target = "_blank";
        a.appendChild(fb)
        div_col.appendChild(a);
    }
    /* If it contains a twitter link, insert the twitter icon and the link. */
    if(companies[id]["social"]["twitter"] != ""){
        var a = document.createElement("a");
        var tt = document.createElement("i");
        tt.classList.add("fab");
        tt.classList.add("fa-twitter");
        tt.classList.add("fa-lg");
        tt.classList.add("button");
        a.href = companies[id]["social"]["twitter"];
        a.target = "_blank";
        a.appendChild(tt)
        div_col.appendChild(a);
    }
    /* If it contains a maps link, insert the map icon and the link. */
    if(companies[id]["gmaps_url"] != ""){
        var a = document.createElement("a");
        var gm = document.createElement("i");
        gm.classList.add("fas");
        gm.classList.add("fa-map-marker-alt");
        gm.classList.add("fa-lg");
        gm.classList.add("button");
        a.href = companies[id]["gmaps_url"];
        a.target = "_blank";
        a.appendChild(gm)
        div_col.appendChild(a);
    }
    /* Append the collumn div to the row div. */
    social_div.appendChild(div_col);

    /* Append the row div to the span div. */
    social.appendChild(social_div);

    /* Add the social info. */
    info1_div.appendChild(social);

    /* Div containing the second collum information. */
    var info2_div = document.createElement("div");
    info2_div.classList.add("col-xl-6");
    info2_div.classList.add("col-lg-12");
    info2_div.classList.add("details-card-section");

    /* Generate the shedule representation. */
    generate_schedule(id, info2_div);

    /* If there are notes insert them */
    if(companies[id]["notes"] != ""){
        /* Span containing the notes. */
        var span = document.createElement("span");
        /* Insert the notes and the title of the section. */
        span.innerHTML = "<p><b>Observações</b><br/>"+companies[id]["notes"]+ "</p>";
        /* Add notes information. */
        info2_div.appendChild(span);
    }

    /* Add first collumn to the row div. */
    row.appendChild(info1_div);
    /* Add second collumn to the row div. */
    row.appendChild(info2_div);
    /* Add the row div to the card. */
    card_div.appendChild(row);
    outside_card.appendChild(card_div);
    return outside_card;
}

/**
 * Does an API call to get the companies near the county and present them.
 */
function loadSearch(){
    /* Obtain the results div, clear his content and hide it until display. */
    results = document.getElementById('results');
    results.style.display = 'none';
    results.innerHTML = '';
    selected_id = -1;
    document.getElementById('loadMore').style.display = "none";

    /* API call */
    $.ajax({
        url: api_url+"companies_by_location?county="+selected_county,
        "Access-Control-Allow-Origin" : "*",
        success : function(data){
            if(data["state"] != "error"){
                if(Object.keys(data["companies"]).length > 0){
                    companies = [];
                    /* Get the companies keys and generate a list containing only the companies details. */
                    companies_keys = Object.keys(data["companies"]);

                    companies_keys.forEach(key => {
                    companies.push(data["companies"][key]);
                    });

                    /* If there are more companies to show than the number of allowed companies to show. */
                    if(companies.length > n_results){
                        /* Load only the allowed number. */
                        for(loadedResults = 0; loadedResults < n_results; loadedResults ++){
                            results.appendChild(generate_card(companies[loadedResults], loadedResults));
                        }
                        /* Display the button to allow the load of more companies. */
                        document.getElementById('loadMore').style.display = '';
                    }
                    else{
                        /* Load all the companies returned. */
                        for(loadedResults = 0; loadedResults < companies.length; loadedResults ++){
                            results.appendChild(generate_card(companies[loadedResults], loadedResults));
                        }
                    }
                    /* Enable the visualization of the results shown. */
                    results.style.display = '';
                }
                else{
                    var text_div = document.createElement("div");
                    text_div.classList.add("col-12");
                    text_div.classList.add("search-results");
                    var img = document.createElement("img");
                    img.classList.add("search-results-img");
                    img.src = "static/img/404.png"
                    var text = document.createElement("h3");
                    text.classList.add("search-results-text");
                    text.innerText = "Não Existem Estabelecimentos";
                    text_div.appendChild(img);
                    text_div.appendChild(text);
                    results.appendChild(text_div);
                    results.style.display = '';
                }
        
            }
            else{
                var text_div = document.createElement("div");
                    text_div.classList.add("col-12");
                    text_div.classList.add("search-results");
                    var img = document.createElement("img");
                    img.classList.add("search-results-img");
                    img.src = "static/img/404.png"
                    var text = document.createElement("h3");
                    text.classList.add("search-results-text");
                    text.innerText = "Não Existem Estabelecimentos";
                    text_div.appendChild(img);
                    text_div.appendChild(text);
                    results.appendChild(text_div);
                    results.style.display = '';
            }
        }
    });

    /* Clean the filters lists (mobile and desktop). */
    /* Desktop buttons. */ 
    filter_list = document.getElementById("filters").childNodes;
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].classList != null){
            filter_list[f].classList.remove("list-group-item-clicked");
        }

    }
    /* Mobile Dropdown. */
    filter_list = document.getElementById("filter_dropdown").childNodes;
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].childNodes.length > 0){
            if(filter_list[f].childNodes.length == 1){
                filter_list[f].childNodes[0].classList.remove("dropdown-item-clicked");
            }
            else{
                filter_list[f].childNodes[1].classList.remove("dropdown-item-clicked");
            }
        }
    }
    /* Clear the applied filter list. */
    filters = [];
    
}

/**
 * Generates more cards of results to be shown to the user.
 */
function loadMore(){

    /* Get the results element */
    var results = document.getElementById('results');
    var childnodes = results.childNodes;

    /* If there is a detail card loaded, remove it. */
    if(selected_id != -1){
        var details = document.getElementById('details')
        details.parentNode.removeChild(details);
        childnodes[selected_id].childNodes[1].classList.remove("card-clicked");
    }

    /* If there are no filters applied. */
    if(filters.length == 0){
        /* If there are more companies thant the allowed number. */
        if(loadedResults + n_results < companies.length){
            var temp = loadedResults + n_results;
            /* Load only the allowed number. */
            for(; loadedResults < temp; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
        }
        else{
            /* Load all the companies left. */
            for(; loadedResults < companies.length; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
            /* Hide the load more button. */
            document.getElementById('loadMore').style.display = 'none';
        }
    }
    else{
        /* Hide the load more button. */
        document.getElementById('loadMore').style.display = 'none';
        var temp = loadedResults + n_results;
        /* Load the results that match the applied filters. */
        for(c=loadedResults; c < companies.length; c++){
            for(l = 0; l < companies[c]["categories"].length; l++){
                if(filters.indexOf(companies[c]["categories"][l]) >= 0){
                    results.appendChild(generate_card(companies[c], c));
                    loadedResults++;
                    break;
                }
                
            }
            if(loadedResults >= temp){
                break;
            } 
        }
        /* If the max. results was reached without searching all companies. */
        if(loadedResults >= temp && c < companies.length -1){
            /* Show the load more button. */
            document.getElementById('loadMore').style.display = '';
        }
    }
    /* Reload the details card in the correct position. */
    var temp = selected_id
    selected_id = -1;
    loadDetails(temp);
}

/**
 * Append the detail card in the correct position
 * and activate the general card.
 * @param {Index of the general card in the childNodes of the results div} id 
 */
function loadDetails(id){
    
    /* Get the results div. */
    var results = document.getElementById('results');
    var childnodes = results.childNodes;
   
    /* If the there is a previou selected div. */
    if(selected_id != -1){
        /* Remove the details from the results div. */
        var details = document.getElementById('details');
        details.parentNode.removeChild(details);
        /* Remove the active class from the corresponding node. */
        for(k = 0; k < childnodes.length; k ++){
            if(childnodes[k].id == selected_id){
                childnodes[k].childNodes[1].classList.remove("card-clicked");
            }
        }
        

    }

    /* If the new id is different from the previous id (clicked on a new card). */
    if(selected_id != id){
        /* Update the selected id. */
        selected_id = id;
        
        /* Add the active class to the corresponding general card. */
        for(k = 0; k < childnodes.length; k ++){
            if(childnodes[k].id == selected_id){
                childnodes[k].childNodes[1].classList.add("card-clicked");
            }
        }

        /* Deppending on the screen size the position of the detail card differs. */
        /* < 992 -> one result per row -> detail card is placed after the card. */
        if(document.getElementsByTagName('body')[0].clientWidth < 992){
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    results.insertBefore(generate_details(id),  childnodes[i+1]);
                    break;
                }
            }
        }
        /* < 1200 -> two results per row -> detail card is placed after the last card of that row. */
        else if(document.getElementsByTagName('body')[0].clientWidth < 1200){
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    while(i%2 != 1){
                        i++;
                    }
                    results.insertBefore(generate_details(id),  childnodes[i+1]);
                    break;
                }
            }
        }
        /* > 1200 -> three results per row -> detail card is placed after the last card of that row. */
        else{
            for(i = 0; i < childnodes.length; i++){
                if(id == childnodes[i].id){
                    while(i%3 != 2){
                        i++;
                    }
                    results.insertBefore(generate_details(id),  childnodes[i+1]);
                    break;
                }
            }
        }
    }
    /* The card was only deselected (no active detail card). */
    else{

        selected_id = -1;
    }
}

/**
 * Apply or remove filters.
 * 
 * @param {filter to add/remove} filter 
 */
function filterResults(filter){
    console.log(filter)
    /* If the filter element has the active class. */
    if( document.getElementById(filter).classList.length >= 2){
        /* Remove the class. */
        document.getElementById(filter).classList.remove("list-group-item-clicked");
        /* Remove the filter from the filters list. */
        var index = filters.indexOf(filter);
        if (index > -1) {
            filters.splice(index, 1);
        }
    }
    /* Filter not applied. */
    else{
        /* Add the active class. */
        document.getElementById(filter).classList.add("list-group-item-clicked");
        /*Add the filter to tghe filters list. */
        filters.push(filter);
    }
    /* Add/Remove the filter from the mobile dropdown.*/
    filter_list = document.getElementById("filter_dropdown").childNodes;
    for(f = 0; f < filter_list.length; f++){
        
        if(filter_list[f].childNodes.length > 1 && filter_list[f].childNodes[1].innerText == filter){
            if(filter_list[f].childNodes[1].classList.length >= 2){
                filter_list[f].childNodes[1].classList.remove("dropdown-item-clicked");
            }
            else{
                filter_list[f].childNodes[1].classList.add("dropdown-item-clicked");
            }
        }
        else if(filter_list[f].childNodes.length > 0 && filter_list[f].childNodes[0].innerText == filter){
            if(filter_list[f].childNodes[0].classList.length >= 2){
                filter_list[f].childNodes[0].classList.remove("dropdown-item-clicked");
            }
            else{
                filter_list[f].childNodes[0].classList.add("dropdown-item-clicked");
            }
        }
    }

    /* Get the results div hide and clear its content. */
    results = document.getElementById('results');
    results.style.display = 'none';
    results.innerHTML = '';
    selected_id = -1;
    
    /* Hide the load more button. */
    document.getElementById('loadMore').style.display = 'none';

    /* If there are no filters applied. */
    if(filters.length == 0){
        /* Load results normaly*/
        if(companies.length > n_results){
            for(loadedResults = 0; loadedResults < n_results; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
            document.getElementById('loadMore').style.display = '';
        }
        else{
            for(loadedResults = 0; loadedResults < companies.length; loadedResults ++){
                results.appendChild(generate_card(companies[loadedResults], loadedResults));
            }
        }
    }
    /* Load the results that correspond to the applied filters. */
    else{
        loadedResults = 0;
        var c = 0;
        for(; c < companies.length; c++){
            for(l = 0; l < companies[c]["categories"].length; l++){
                if(filters.indexOf(companies[c]["categories"][l]) >= 0){
                    results.appendChild(generate_card(companies[c], c));
                    loadedResults++;
                    break;
                }
            } 
            if(loadedResults >= n_results){
                break;
            }
        }
        if(loadedResults >= n_results){
            document.getElementById('loadMore').style.display = '';
        }
        if(loadedResults == 0){
            var text_div = document.createElement("div");
            text_div.classList.add("col-12");
            text_div.classList.add("search-results");
            var img = document.createElement("img");
            img.src = "static/img/404.png"
            img.classList.add("search-results-img");
            var text = document.createElement("h3");
            text.classList.add("search-results-text");
            text.innerText = "Não Existem Estabelecimentos";
            text_div.appendChild(img);
            text_div.appendChild(text);
            results.appendChild(text_div);
            results.style.display = '';
        }
    }
    results.style.display = '';

}

function generateFilters(){
    /* Get the counties table element. */
    var select = document.getElementById('filter_dropdown');
    var filters = document.getElementById("filters");
    $.ajax({
        url: api_url+"categories",
        "Access-Control-Allow-Origin" : "*",
        success : function(data){

            /* For each county returned generate an li element and insert it
             in the table. */
            data["categories"].forEach(cat => {
                var li = document.createElement("li");
                var option = document.createElement('a');
                option.classList.add("dropdown-item");
                option.innerText = cat;
                /* Onclick event to enable search. */
                option.onclick = function(){
                    filterResults(cat);
                }
                li.appendChild(option);
                select.appendChild(li);

                let p = document.createElement("p");
                p.id = cat;
                p.classList.add("list-group-item");
                p.onclick = function(){
                    filterResults(cat);
                }
                p.innerHTML = "<b>"+ cat + "</b>";
                filters.appendChild(p);
            });
        }
    });

}

/**
 * Reset the values used in the page after a load (remove cached elements).
 */
function pageLoad(){
    /* Reset variables used. */
    companies = [];
    loadedResults = 0;
    selected_id = -1;
    filtres = [];
    /* Disable the search. */
    document.getElementById('districts').disabled = true;
    document.getElementById('counties').disabled = true;
    document.getElementById('search_button').disabled = true;
    
    /* Clear the applied filters. */
    filter_list = document.getElementById("filters").childNodes;
    
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].classList != null){
            filter_list[f].classList.remove("list-group-item-clicked");
        }

    }
    filter_list = document.getElementById("filter_dropdown").childNodes;
    for(f = 0; f < filter_list.length; f++){
        if(filter_list[f].childNodes.length > 0){
            filter_list[f].childNodes[1].classList.remove("dropdown-item-clicked");
        }
    }
    filters = [];

    /* Load the districts. */
    getDistricts();
    generateFilters();
}

/**
 * Auxilary function that generates the schedule of a given company
 * @param {Index of the company in the companies array} id 
 * @param {Div where the schedule should be appended as child.} info2_div 
 */
function generate_schedule(id, info2_div){
    /*Equal days corresponds to an array of integers that represent the start and end of similar days. */
    /*Index 0 corresponds to the first day, index 1 corresponds to the last day. */
    equal_days = [1, 1];

    /* day = 2 because monday is the second day of the week and equal_days already has monday. */
    for(day = 2; day < days.length; day++){

        /* Compare the schedule of the actual day and the day before. */
        if(compareArrays(companies[id]["schedules"][days[day]], companies[id]["schedules"][days[day-1]])){
            
            /* Update the last day as being the present one and continues to the next day. */
            equal_days[1] = day;
        }

        /* The arrays are diferent (the streak breaks). */
        else{
            var span = document.createElement("span");
            
            /* If the streak is more than one day. */
            if(equal_days[0] != equal_days[1]){ 
                var text = "<p><b>" +days[equal_days[0]] + " - " + days[equal_days[1]] + "</b></p><p>| ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | "
                });
                text += "</p>";
                span.innerHTML = text;
            }
            /* If the streak is only of one day. */
            else{
                var text = "<p><b>" + days[equal_days[0]] + "</b></p><p>| ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | ";
                });
                text += "</p>";
                span.innerHTML = text;
            }
            info2_div.appendChild(span);
            equal_days = [day, day];
        }
    }

    /* Results in the for are only compared until saturdar (sunday = 0) */
    /* Do the sunday case now (same logic). */
    if(compareArrays(companies[id]["schedules"][days[equal_days[1]]], companies[id]["schedules"][days[0]])){
        equal_days[1] = 0;
    }else{
        var span = document.createElement("span");
        if(equal_days[0] != equal_days[1]){
            var text = "<p><b>" +days[equal_days[0]] + " - " + days[equal_days[1]] + "</b></p><p>| ";
            companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                text += schedule + " | "
            });
            text += "</p>";
            span.innerHTML = text;
        }
        else{
            var text = "<p><b>" + days[equal_days[0]] + "</b></p><p>| ";
            companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                text += schedule + " | ";
            });
            text += "</p>";
            span.innerHTML = text;
        }
        info2_div.appendChild(span);
        equal_days = [0, 0];

    }

    /* Add the sunday case. */
    var span = document.createElement("span");
    if(equal_days[0] != equal_days[1]){
        var text = "<p><b>" +days[equal_days[0]] + " - " + days[equal_days[1]] + "</b></p><p>| ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | "
                });
                text += "</p>";
                span.innerHTML = text;
    }
    else{
        var text = "<p><b>" + days[equal_days[0]] + "</b></p><p>| ";
                companies[id]["schedules"][days[equal_days[0]]].forEach( schedule => {
                    text += schedule + " | ";
                });
                text += "</p>";
                span.innerHTML = text;
    }
    info2_div.appendChild(span);
}

/**
 * Event used to adapt the position of the details card
 * after the resizing of the window. 
 */
window.addEventListener('resize', function(event){
    var details = document.getElementById('details');

    if(details != null){
        details.parentNode.removeChild(details);
        
        var results = document.getElementById('results');
        var childnodes = results.childNodes;

        if(document.getElementsByTagName('body')[0].clientWidth < 992){
            for(i = 0; i < childnodes.length; i++){
                if(selected_id == childnodes[i].id){
                    results.insertBefore(details,  childnodes[i+1]);
                    break;
                }
            }
        }
        else if(document.getElementsByTagName('body')[0].clientWidth < 1200){
            for(i = 0; i < childnodes.length; i++){
                if(selected_id == childnodes[i].id){
                    while(i%2 != 1){
                        i++;
                    }
                    results.insertBefore(details,  childnodes[i+1]);
                    break;
                }
            }
        }else{
            for(i = 0; i < childnodes.length; i++){
                if(selected_id == childnodes[i].id){
                    while(i%3 != 2){
                        i++;
                    }
                    results.insertBefore(details,  childnodes[i+1]);
                    break;
                }
            }
        }
    }
});

/* Every time the page is loaded execute the pageLoad. */
window.onload = pageLoad;

/**
 * Auxiliary function to compare 2 arrays of strings.
 * @param {Array 1} ar1 
 * @param {Array 2} ar2 
 */
function compareArrays(ar1, ar2){
    if(ar1.length == ar2.length){
        var index;
        for(index = 0; index < ar1.length; index++){
            if(ar1[index] != ar2[index])
                return false;
        }
        return true;
    }
    return false;
}