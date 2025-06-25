import { active } from "d3";

// Function to open a tab (and hide the others)
export function openTab(this_tab, sideTabName, tab_category, plot_history = 0) {

    var content_class = "tabcontent_" + tab_category;
    var links_class = "tablinks_" + tab_category;

    var i, tabcontent, tablinks;

    if(tab_category == "history") {
        printSavedData(sideTabName.match(/\d+/)[0], plot_history)
    }

    // Get all elements with class="tabcontent_//category//" and hide them
    tabcontent = document.getElementsByClassName(content_class);
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        if (tab_category == "history") {
            tabcontent[i].style.gridArea = "none";
        }
    }

    // Get all elements with class="tablinks_//category//" and remove the class "active"
    tablinks = document.getElementsByClassName(links_class);
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    var activeTab = document.getElementById(sideTabName);
    activeTab.style.display = "block";
    this_tab.className += " active";

    if(tab_category == "history")
    {
        activeTab.style.height = "100%";
        activeTab.style.width = "100%";
        activeTab.style.gridArea = "active_tab";
    }
}

export function printSavedData(number, plot_history) {
    console.log(number);
    console.log(plot_history)
    number = parseInt(number);
    if (plot_history[number] != 0) {
        let read_tab = document.getElementById('read_sidepanel');
        read_tab.innerHTML = `
        <h3><b>LDA parameters</b></h3><br>
        <b>Number of dimensions:</b> ${plot_history[number]["number_of_dims"]}<br>
        <b>Class option:</b> ${plot_history[number]["classes_option"]}<br>
        <b>Selected fields:</b> ${plot_history[number]["field_selection"]}<br>
        <b>Top X Selection:</b> ${plot_history[number]["classes_options_top_x"]}<br>
        <b>Number of clusters:</b> ${plot_history[number]["number_of_k"]}`;
    }
}