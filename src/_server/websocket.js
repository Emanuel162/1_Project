//import * as csv from "csv-parser"
import { parse } from 'csv-parse';
import * as fs from 'fs';
import {
  print_clientConnected,
  print_clientDisconnected,
} from './static/utils.js';
// const preprocessing = require("./preprocessing.js")
import {
  is_below_max_weight,
  parse_numbers,
  calc_bmi,
} from './preprocessing.js';
import { getExampleLDA } from './druidExample.js';
import { preprocessLDA, LDAPipeline } from '../_public/preprocessingLDA.js';

const file_path = 'data/';
const example_file_name = 'example_data.csv';
const file_name = 'boardgames_40.json';

/**
 * Does some console.logs when a client connected.
 * Also sets up the listener, if the client disconnects.
 * @param {*} socket
 */
export function setupConnection(socket) {
  print_clientConnected(socket.id);

  /**
   * Listener that is called, if client disconnects.
   */
  socket.on('disconnect', () => {
    print_clientDisconnected(socket.id);
  });

  /**
   * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
   *
   * !!!!! Here an below, you can/should edit the code  !!!!!
   * - you can modify the getData listener
   * - you can add other listeners for other functionalities
   *
   * # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
   */

  /**
   * Listener that is called, if a message was sent with the topic "getData"
   *
   * In this case, the following is done:
   * - Read in the data (.csv in this case) a a stream
   *      (Stream -> data is read in line by line)
   * - Do data preprocessing while reading in:
   *      - Convert values, that can be represented as numbers to numbers
   *      - Calculate the BMI for every data row (person)
   *      - Filtering: if the row has a value, that contradicts the filtering parameters, data row will be excluded
   *          (in this case: weight should not be larger than the max_weight filter-parameter)
   */
  socket.on('getData', (obj) => {
    console.log(`Data request with properties ${JSON.stringify(obj)}...`);

    getExampleLDA(); //Example how to use druidjs. Just prints to the console for now

    let parameters = obj.parameters;

    let jsonArray = [];

    // This is reading the .csv file line by line
    // So we can filter it line by line
    // This saves a lot of RAM and processing time
    fs.createReadStream(file_path + example_file_name)
      .pipe(parse({ delimiter: ',', columns: true }))
      .on('data', function (row) {
        row = parse_numbers(row);
        row = calc_bmi(row);
        // Filtering the data according the given parameter
        // If it fits the parameter, add it to the result-array
        let row_meets_criteria = is_below_max_weight(parameters, row);
        if (row_meets_criteria) {
          jsonArray.push(row);
        }
      })
      .on('end', () => {
        //when all data is ready and processed, send it to the frontend of the socket
        socket.emit('freshData', {
          timestamp: new Date().getTime(),
          data: jsonArray,
          parameters: parameters,
        });
      });

    // -------------------- GET BOARDGAMES INFO --------------------

    // Get Data from JSON
    const readStream = fs.createReadStream(file_path + file_name, {
      encoding: 'utf8',
    });
    let jsonData = '';

    // Collect data chunks
    readStream.on('data', (chunk) => {
      jsonData += chunk;
    });

    // When the stream ends, parse the JSON, preprocess the parsed data and send preprocessed data to frontend
    readStream.on('end', () => {
      try {
        const parsedData = JSON.parse(jsonData);
        console.log('First Parsed Data Item: ', parsedData.boardgames[0]);

        const preprocessedLDA = preprocessLDA(parsedData.boardgames);

        const lda = LDAPipeline(parsedData.boardgames, 2);
        console.log(lda);

        console.log(
          'Result of first ten entry of preprocessed LDA:',
          preprocessedLDA.slice(0, 10)
        );

        socket.emit('boardgamesData', {
          timestamp: new Date().getTime(),
          preprocessedData: preprocessedLDA,
          data: parsedData.boardgames,
        });
      } catch (err) {
        console.error('Error parsing JSON: ', err);
      }
    });

    // Handle stream errors
    readStream.on('error', (err) => {
      console.error('Error reading file:', err);
    });

    console.log(`freshData emitted`);
  });

  socket.on('getLDAData', (obj) => {
    console.log('LDA Data request');

    // Get Data from JSON
    const readStream = fs.createReadStream(file_path + file_name, {
      encoding: 'utf8',
    });
    let jsonData = '';

    // Collect data chunks
    readStream.on('data', (chunk) => {
      jsonData += chunk;
    });

    // When the stream ends, parse the JSON, preprocess the parsed data and send normal and preprocessed data to frontend
    readStream.on('end', () => {
      try {
        const parsedData = JSON.parse(jsonData);
        console.log('First Parsed Data Item: ', parsedData.boardgames[0]);

        const preprocessedLDA = preprocessLDA(parsedData.boardgames);

        console.log(
          'Result of first ten entry of preprocessed LDA:',
          preprocessedLDA.slice(0, 10)
        );

        socket.emit('boardgamesLDAData', {
          timestamp: new Date().getTime(),
          preprocessedData: preprocessedLDA,
          data: parsedData.boardgames,
        });
      } catch (err) {
        console.error('Error parsing JSON: ', err);
      }
    });

    // Handle stream errors
    readStream.on('error', (err) => {
      console.error('Error reading file:', err);
    });

    console.log(`freshData emitted`);
  });
}
