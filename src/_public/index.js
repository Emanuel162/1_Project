import io from 'socket.io-client';
import './app.css';
import { openTab, printSavedData } from './tabFunction.js'
import { configs } from '../_server/static/configs.js';
import { draw_barchart } from './barchart.js';
import { draw_scatterplot } from './scatterplot.js';
import { draw_lollipop } from './lollipop.js';
import * as d3 from 'd3';
import { LDAPipeline } from './preprocessingLDA.js';
import { kMeansPipeline } from "./normalizeddata.js";
import { draw_scatterplot_kmeans } from "./scatterplotKmeans.js";

let hostname = window.location.hostname;
let protocol = window.location.protocol;
const socketUrl = protocol + '//' + hostname + ':' + configs.port;

export const socket = io(socketUrl);
socket.on('connect', () => {
    console.log('Connected to ' + socketUrl + '.');
});
socket.on('disconnect', () => {
    console.log('Disconnected from ' + socketUrl + '.');
});

/**
 * Callback, when the button is pressed to request the data from the server.
 * @param socketName name of the socket to emit
 * @param {*} parameters
 */
let requestData = (socketName, parameters) => {
    console.log(`requesting data from webserver (every 2sec)`);

    socket.emit(socketName, {
        parameters,
    });
};

/**
 * Assigning the callback to request the data on click.
 */
document.getElementById('load_data_button').onclick = () => {
    let max_weight = document.getElementById('max_weight').value;
    if (!isNaN(max_weight)) {
        max_weight = parseFloat(max_weight);
    } else {
        max_weight = Infinity;
    }
    requestData('getData', { max_weight });
};

var plot_history = [0, 0, 0, 0, 0];
var history_count = -1;

document.getElementById("action_button").onclick = () => {

    let if_lollipop = document.getElementById('check_lollipop').checked;
    let if_scatterplot = document.getElementById('check_scatterplot').checked;
    let if_kmeans = document.getElementById('check_kmeans').checked;

    console.log(if_kmeans, if_lollipop, if_scatterplot);

    history_count = history_count + 1;

    openTab(document.getElementById(`history_${history_count%5}_button`),`history_${history_count%5}`,"history", plot_history);

    if(if_lollipop) {
        let max_weight = document.getElementById('max_weight').value;
        if (!isNaN(max_weight)) {
            max_weight = parseFloat(max_weight);
        } else {
            max_weight = Infinity;
        }
        requestData('getData', { max_weight });
    }
    if (if_scatterplot) {
        requestData('getLDAData');
    }
    if (if_kmeans) {
        requestData('getRealisticData');
    }

    let active_tab = history_count % 5;

    plot_history[active_tab] = {
        "number_of_dims": document.getElementById('number_of_dims').value,
        "classes_option": document.getElementById('classes_options').value,
        "field_selection": Array.from(document.querySelectorAll('input[class=class_checkbox]:checked')).map((checkbox) => checkbox.getAttribute("value")).join(', '),
        "number_of_k": document.getElementById('number_of_k').value
    };

    printSavedData(active_tab, plot_history);
}

//Button for Task 1
document.getElementById('load_LDA_button').onclick = () => {
    requestData('getLDAData');
};

//Button for Task 2
document.getElementById('load_realistic_data_button').onclick = () => {
    requestData('getRealisticData');
};

document.getElementById('classes_options').onchange = () => {
    let option = document.getElementById('classes_options').value;

    if (option === 'ratings') {
        document.getElementById('check_ratings').hidden = true;
        document.getElementById('label_ratings').hidden = true;

        document.getElementById('check_year').hidden = false;
        document.getElementById('label_year').hidden = false;
    } else if (option === 'year') {
        document.getElementById('check_year').hidden = true;
        document.getElementById('label_year').hidden = true;

        document.getElementById('check_ratings').hidden = false;
        document.getElementById('label_ratings').hidden = false;
    }
}

/**
 * Object, that will store the loaded data.
 */
let data = {
    barchart: undefined,
    scatterplot: undefined,
    lollipop: undefined,
};

/**
 * Callback that is called, when the requested data was sent from the server and is received in the frontend (here).
 * @param {*} payload
 */
let handleData = (payload) => {
    //don't show the given scatterplot and barchart
    return;
    console.log(`Fresh data from Webserver:`);
    console.log(payload);
    // Parse the data into the needed format for the d3 visualizations (if necessary)
    // Here, the barchart shows two bars
    // So the data is preprocessed accordingly

    let count_too_much_weight = 0;
    let count_good_weight = 0;

    for (let person of payload.data) {
        if (person.bmi >= 25) {
            count_too_much_weight++;
        } else {
            count_good_weight++;
        }
    }

    data.barchart = [count_too_much_weight, count_good_weight];
    data.scatterplot = payload.data;
    draw_barchart(data.barchart);
    draw_scatterplot(data.scatterplot);
};

const handleBoardgamesData = (payload) => {
    console.log(`Fresh boardgame data from Webserver:`);
    console.log(payload);

    let active_tab = history_count % 5;

    data.lollipop = mapData(payload.preprocessedData);
    draw_lollipop(data.lollipop, active_tab);
};

const handleBoardgamesLDAData = (payload) => {

    //Start of LDA
    let number_of_dims = document.getElementById('number_of_dims').value;
    let classes_option = document.getElementById('classes_options').value;

    let field_selection = Array.from(document.querySelectorAll('input[class=class_checkbox]:checked'));
    field_selection = field_selection.map((checkbox) => checkbox.getAttribute("value"));
    console.log(field_selection);

    let active_tab = history_count % 5;

    let plot_data = LDAPipeline(payload.data, parseInt(number_of_dims), classes_option, field_selection);
    draw_scatterplot(plot_data, active_tab);
};

const handleRealisticData = (payload) => {

    let kMeans;
    let clusterCentersAreCorrect = true
    const k = parseInt(document.getElementById('number_of_k').value)
    let numberOfRetrys = 0;

    // It can happen that a cluster can't be computed due to division by zero (i guess)
    // Then we just compute kMeans again, because we use the randomness from kMeans to get different clusters
    // If there are too many retrys we also cancel the computation
    do {
        kMeans = kMeansPipeline(payload.data.gameItems, k)
        clusterCentersAreCorrect = true;
        kMeans.clusterCenters.forEach(cluster => {
            if (isNaN(cluster.x) || isNaN(cluster.y)) {
                clusterCentersAreCorrect = false;
            }
        })
        numberOfRetrys += 1;

    } while (!clusterCentersAreCorrect && numberOfRetrys < 10);

    let active_tab = history_count % 5;

    const div = document.getElementsByClassName('kmeans_div')[active_tab]
    console.log(div)
    if (numberOfRetrys >= 10) {
        const p = document.createElement('p');
        p.id = "too_many_retrys"
        p.innerText = "There are too many retrys for the cluster computation for k = " + k + ". Computation is stopped. Please choose a smaller k.";
        div.appendChild(p);

        return;
    }
    if (div.children.namedItem('too_many_retrys')) {
        div.removeChild(div.children.namedItem('too_many_retrys'));
    }

    draw_scatterplot_kmeans(kMeans, active_tab)

}

socket.on('freshData', handleData);

socket.on('boardgamesData', handleBoardgamesData);
socket.on('boardgamesLDAData', handleBoardgamesLDAData);

socket.on('realisticData', handleRealisticData);

let width = 0;
let height = 0;

/**
 * This is an example for visualizations, that are not automatically scalled with the viewBox attribute.
 *
 * IMPORTANT:
 * The called function to draw the data must not do any data preprocessing!
 * To much computational load will result in stuttering and reduced responsiveness!
 */
let checkSize = setInterval(() => {
    let container = d3.select('.visualizations_project_1');
    let newWidth = parseInt(container.style('width'));
    let newHeight = parseInt(container.style('height'));
    if (newWidth !== width || newHeight !== height) {
        width = newWidth;
        height = newHeight;
        if (data.scatterplot) draw_scatterplot(data.scatterplot);
    }
}, 100);

//Make the array of arrays to an array of objects
const mapData = (data) => {
    return data.map((boardgameArray) => {
        return {
            minage: boardgameArray[0],
            id: boardgameArray[1],
            title: boardgameArray[2],
            rating: boardgameArray[3],
        };
    });
};

document.getElementById('sidepanel_button').onclick = () => {

    let root = document.getElementById('root');
    let sidepanel = document.getElementById('sidepanel');
    let button = document.getElementById('sidepanel_button');

    if (root.classList.contains("hidden")) {
        button.innerText = "Hide";
        sidepanel.style.display = "inline";
        root.classList.add("shown");
        root.classList.remove("hidden");
        console.log("show");
    }
    else {
        button.innerText = "Show";
        sidepanel.style.display = "none";
        root.classList.remove("shown");
        root.classList.add("hidden");
        console.log("hide");
    }
}

document.getElementById("read_sidepanel_button").onclick = () => {
    openTab(document.getElementById("read_sidepanel_button"), 'read_sidepanel', 'sidepanel');
};

document.getElementById("write_sidepanel_button").onclick = () => {
    openTab(document.getElementById("write_sidepanel_button"), 'write_sidepanel', 'sidepanel');
};

document.getElementById("history_0_button").onclick = () => {
    console.log("open tab 0")
    openTab(document.getElementById("history_0_button"), 'history_0', 'history', plot_history)
};

document.getElementById("history_1_button").onclick = () => {
    openTab(document.getElementById("history_1_button"), 'history_1', 'history', plot_history)
};

document.getElementById("history_2_button").onclick = () => {
    openTab(document.getElementById("history_2_button"), 'history_2', 'history', plot_history)
};

document.getElementById("history_3_button").onclick = () => {
    openTab(document.getElementById("history_3_button"), 'history_3', 'history', plot_history)
};

document.getElementById("history_4_button").onclick = () => {
    openTab(document.getElementById("history_4_button"), 'history_4', 'history', plot_history)
};

var svg_divs = document.getElementsByClassName("svg_root");
for (var i = 0; i < svg_divs.length; i++) {
    var div = svg_divs[i];
    div.onclick = () => {
        alert(div.parentElement.id);
    };
}