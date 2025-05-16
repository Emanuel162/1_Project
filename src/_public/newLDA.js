import * as druid from '@saehrimnir/druidjs';

export function preprocessedRating(rating, number_of_ratings) {
    const max_rating = 10;
    const max_number = 10 ** 5;
    return (rating * number_of_ratings) / (max_rating * max_number);
}

export function LDAPipeline(data, number_of_dims, classes_option = "ratings") {
    let classes = [];

    if (classes_option === "ratings") {
        //Compute normalized ratings for each game
        const normalizedRatings = data.map(game =>
            preprocessedRating(game.rating.rating, game.rating.num_of_reviews)
        );

        //Compute mean
        const mean = normalizedRatings.reduce((a, b) => a + b, 0) / normalizedRatings.length;

        // Assign binary class based on mean
        classes = normalizedRatings.map(rating =>
            rating >= mean ? "Above Mean" : "Below Mean"
        );
    }

    // Step 4: Preprocess data into numerical feature matrix
    const processed = preprocessDataLDA(data);
    const X = druid.Matrix.from(processed);

    const reductionLDA = new druid.LDA(X, { labels: classes, d: number_of_dims });

    return {
        lda: reductionLDA.transform().to2DArray(),
        labels: classes
    };
}

