import * as druid from '@saehrimnir/druidjs';

export function preprocessLDA(boardgames) {
  // Old way (can be commented in)
  //const result = []
  //
  //  obj.boardgames.map(boardgame => {
  //      result.push([boardgame.minage, boardgame.id])
  //  })
  //
  //return result

  return boardgames.map((boardgame) => [
    boardgame.minage,
    boardgame.id,
    boardgame.title,
    preprocessedRating(boardgame.rating),
  ]);
}

function preprocessDataLDA(boardgames, option = 'ratings') {
    return boardgames.map((boardgame) => [
    parseInt(boardgame.year),
    parseInt(boardgame.minplayers),
    parseInt(boardgame.maxplayers),
    parseInt(boardgame.minplaytime),
    parseInt(boardgame.maxplaytime),
    parseInt(boardgame.minage),
    preprocessedRating(boardgame.rating),
    // A lot of fields for mechanics (try later)
    ]);

  if (option === 'ratings') {
    return boardgames.map((boardgame) => getArrayOfCategories(boardgame));
  }
}

// returns an array of n elements (where n = number of all categories)
function getArrayOfCategories(boardgame) {
  let array = [];
  // it can be done better (maybe)
  let all_categories = [
    1022, 1020, 1010, 1046, 1047, 1021, 1088, 2710, 1011, 1084, 2145, 1089,
    1015, 1026, 1001, 1016, 1113, 1019, 1086, 1102, 1064, 1093, 1082, 1002,
    1069, 1055, 1017, 1035, 1024, 1050, 1029, 1008, 1013, 1028, 1094, 1044,
    1097, 1115, 1116,
  ];

  let current_categories = boardgame.types.categories.map(
    (category) => category.id
  );

  for (let i = 0; i < all_categories.length; i++) {
    if (current_categories.includes(all_categories[i])) {
      array.push(1);
    } else {
      array.push(0);
    }
  }
  return array;
}
/*
// Function for the whole LDA process 
export function LDAPipeline(data, number_of_dims, classes_option = "ratings") {
  let classes = generateClasses(data, classes_option)

  data = preprocessDataLDA(data, option)
  const X = druid.Matrix.from(data)

  const reductionLDA = new druid.LDA(X, { labels: classes, d: number_of_dims }) //2 dimensions, can use more.
  const result = reductionLDA.transform()
  
  return result
}

// Generates array of classes based on the data and selected option
function generateClasses(data, classes_option) {
  let classes = []
  if (classes_option == "ratings") {
    let middle = (border_values["rating"][1] - border_values["rating"][0])/2 + border_values["rating"][0] // a + (b-a)/2
    for (let i = 0; i < data.boardgames.length; i++) {
      if (data.boardgames[i].rating.rating <= middle) {
        classes.push("low")
      }
      else {
        classes.push("high")
      }
    }
  }
  return classes
}
*/

export function LDAPipeline(data, number_of_dims, classes_option = 'ratings') {
  let classes = [];

  // Step 1: Assign classes based on the option
  if (classes_option === 'ratings') {
    //Compute normalized ratings for each game
    const normalizedRatings = data.map((game) =>
      preprocessedRating(game.rating)
    );

    //Compute mean
    const mean =
      normalizedRatings.reduce((a, b) => a + b, 0) / normalizedRatings.length;

    // Assign binary class based on mean
    classes = normalizedRatings.map((rating) =>
      rating >= mean ? "Above Mean" : "Below Mean"
    );
  } else {
    // For future options
  }

  // Step 2: Preprocess data into numerical feature matrix
  const processed = preprocessDataLDA(data, classes_option); 
  const X = druid.Matrix.from(processed);

  // Step 3: LDA
  const reductionLDA = new druid.LDA(X, { labels: classes, d: number_of_dims }); // <-- THE NaN (in the result) OCCURS HERE

  console.log('reductionLDA');
  console.log(reductionLDA);

  return {
    lda: reductionLDA.transform().to2DArray,
    labels: classes,
  };
}

// Takes two elements of the boardgames' rating and merges them into one metric.
function preprocessedRating(rating) {
  // Maximal number for normalization
  let max_rating = 10;
  let max_number = 10 ** 5;

  let coef_rating = 1;
  let coef_number = 1;

  // Normalization and merging into one thing.
  let result =
    (coef_rating * rating.rating * (coef_number * rating.num_of_reviews)) /
    (max_rating * max_number);

  return parseFloat(result);
}

// Border values of categorical and quantitive attributes (x-a)/b
// For data preprocessing and (maybe?) visualization
const border_values = {
  year: [2002, 2021],
  max_player: [2, 7],
  min_player: [1, 3],
  minplaytime: [20, 240],
  maxplaytime: [20, 480],
  minage: [10, 14],
  rating: [7.94204, 8.67527],
  num_of_reviews: [7193, 85192],
};
