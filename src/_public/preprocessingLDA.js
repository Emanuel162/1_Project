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
