import { kMeans } from './kmeans.js';

export function kMeansPipeline(gameItems, k = 3, n = 100) {
    const rawData = gameItems.map(game => [
        game.minPlayers,
        game.maxPlayers,
        game.minPlayersRec,
        game.maxPlayersRec,
        game.minPlayersBest,
        game.maxPlayersBest,
        game.minAge,
        game.minTime,
        game.maxTime,
        game.numVotes,
        game.avgRating,
        game.stddevRating,
        game.bayesrating,
        game.complexity,
    ]);

    // should subtract one, otherwise we will get n+1 elements
    const selectedRawData = rawData.slice(0, n-1);

    const normalizedData = normalizeData(rawData);
    const contributionPerVariable = Array(normalizedData[0].length).fill(1 / normalizedData[0].length);

    const result = kMeans(normalizedData, k, contributionPerVariable);

    return {
        centroids: result.centroids,
        clusterAssignments: gameItems.map((game, i) => ({
            title: game.title,
            cluster: result[i].dataPoint[result[i].centroidIndex]
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
