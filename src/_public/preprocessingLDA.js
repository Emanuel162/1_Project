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

  return result;
}

// Border values of categorical and quantitive attributes (x-a)/b
// For data preprocessing and (maybe?) visualization
border_values = {
  "year" : [1876, 2021],
  "max_player": [2, 8],
  "min_player": [1, 3],
  "minplaytime": [5, 240],
  "maxplaytime": [20, 1000],
  "minage" : [8, 17],
  "rating" : [7.69721, 8.67527],
  "num_of_reviews": [5157, 96520]
}