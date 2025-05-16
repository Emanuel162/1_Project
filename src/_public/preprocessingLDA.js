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

function preprocessDataLDA(boardgames, option = "ratings") {

    /*
    return boardgames.map((boardgame) => [
    boardgame.year,
    boardgame.minplayers,
    boardgame.maxplayers,
    boardgame.minplaytime,
    boardgame.maxplaytime,
    boardgame.minage,
    preprocessedRating(boardgame.rating),
    // A lot of fields for mechanics (try later)
    ]);
    */
    if (option === "ratings") {
      
      return boardgames.map((boardgame) => [
        // Add 0/1 for every field 
      ])
    }

}

// Function for the whole LDA process 
export function LDAPipeline(data, number_of_dims, classes_option = "ratings") {
  let classes = generateClasses(data, classes_option)

  data = preprocessDataLDA(data)
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
