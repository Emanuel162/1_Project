import * as druid from '@saehrimnir/druidjs';

export function preprocessLDA(boardgames) {
  return boardgames.map((boardgame) => [
    boardgame.id,
    boardgame.title,
    preprocessedRating(boardgame.rating),
  ]);
}

function getSelectedFields(boardgame, list) {
  let result = [];
  if (list.includes('year')) {
    result.push(
      preprocessedQuantitive(parseInt(boardgame.year), border_values['year'])
    );
  }
  if (list.includes('minplayers')) {
    result.push(
      preprocessedQuantitive(
        parseInt(boardgame.minplayers),
        border_values['minplayers']
      )
    );
  }
  if (list.includes('maxplayers')) {
    result.push(
      preprocessedQuantitive(
        parseInt(boardgame.maxplayers),
        border_values['maxplayers']
      )
    );
  }
  if (list.includes('minplaytime')) {
    result.push(
      preprocessedQuantitive(
        parseInt(boardgame.minplaytime),
        border_values['minplaytime']
      )
    );
  }
  if (list.includes('maxplaytime')) {
    result.push(
      preprocessedQuantitive(
        parseInt(boardgame.maxplaytime),
        border_values['maxplaytime']
      )
    );
  }
  if (list.includes('minage')) {
    result.push(
      preprocessedQuantitive(
        parseInt(boardgame.minage),
        border_values['minage']
      )
    );
    if (list.includes('ratings')) {
      result.push(preprocessedRating(boardgame.rating));
    }
  }
  return result;
}

function preprocessDataLDA(
  boardgames,
  option = 'ratings',
  field_selection = [
    'year',
    'minplayers',
    'maxplayers',
    'minplaytime',
    'maxplaytime',
    'minage',
  ]
) {
  return boardgames.map((boardgame) =>
    getSelectedFields(boardgame, field_selection)
  );
}

export function LDAPipeline(
  data,
  number_of_dims,
  classes_option = 'ratings',
  field_selection
) {
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
      rating >= mean ? 'Above Mean' : 'Below Mean'
    );
  } else if (classes_option === 'year') {
    const normalizedYears = data.map((game) =>
      preprocessedQuantitive(game.year, border_values['year'])
    );

    const mean =
      normalizedYears.reduce((a, b) => a + b, 0) / normalizedYears.length;

    classes = normalizedYears.map((year) =>
      year >= mean ? 'Above Mean' : 'Below Mean'
    );
  } else {
    // For future options
  }

  // Step 2: Preprocess data into numerical feature matrix
  const processed = preprocessDataLDA(data, classes_option, field_selection);
  const X = druid.Matrix.from(processed);

  // Step 3: LDA
  const reductionLDA = new druid.LDA(X, { labels: classes, d: number_of_dims }); // <-- THE NaN (in the result) OCCURS HERE

  return {
    lda: reductionLDA.transform().to2dArray,
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

function preprocessedQuantitive(obj, border_values) {
  return (obj - border_values[0]) / (border_values[1] - border_values[0]);
}

// Border values of categorical and quantitive attributes (x-a)/b
// For data preprocessing and (maybe?) visualization
const border_values = {
  year: [2002, 2021],
  maxplayers: [2, 7],
  minplayers: [1, 3],
  minplaytime: [20, 240],
  maxplaytime: [20, 480],
  minage: [10, 14],
  rating: [7.94204, 8.67527],
  num_of_reviews: [7193, 85192],
};
