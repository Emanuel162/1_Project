import { kMeans } from './kmeans.js';

export function kMeansPipeline(boardgames, k = 3) {
    const rawData = boardgames.map(game => [
        game.minplayers,
        game.maxplayers,
        game.minplaytime,
        game.maxplaytime,
        game.minage,
        game.rating.rating,
        game.rating.num_of_reviews
    ]);

    const normalizedData = normalizeData(rawData);
    const contributionPerVariable = Array(normalizedData[0].length).fill(1 / normalizedData[0].length);

    const result = kMeans(normalizedData, k, contributionPerVariable);

    return {
        centroids: result.centroids,
        clusterAssignments: boardgames.map((game, i) => ({
            title: game.title,
            cluster: result.dataPoints[i].centroidIndex
        }))
    };
}

function normalizeData(data) {
    const numFeatures = data[0].length;
    const mins = Array(numFeatures).fill(Infinity);
    const maxs = Array(numFeatures).fill(-Infinity);

    for (let row of data) {
        for (let i = 0; i < numFeatures; i++) {
            if (row[i] < mins[i]) mins[i] = row[i];
            if (row[i] > maxs[i]) maxs[i] = row[i];
        }
    }

    return data.map(row =>
        row.map((value, i) => (value - mins[i]) / (maxs[i] - mins[i] || 1))
    );
}


import * as druid from '@saehrimnir/druidjs';

export function runPCAForVisualization(normalizedData, dimensions = 2) {
    const matrix = druid.Matrix.from(normalizedData);
    const pca = new druid.PCA(matrix, { d: dimensions });
    return pca.transform().to2dArray(); 
}
