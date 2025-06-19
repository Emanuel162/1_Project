import {kMeans} from './kmeans.js';
import * as druid from '@saehrimnir/druidjs';

function mapGameItemsFromObjectToListEntries(gameItems) {
    return gameItems.map(game => [
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
}

function computeClusterCenters(data, k) {

    const clusterCenters = Array(k).fill(0).map(() => ({x: 0, y: 0, count: 0}));

    data.forEach(point => {
        const clusterIndex = point.clusterIndex;
        clusterCenters[clusterIndex].x += point.dataPoints[0]
        clusterCenters[clusterIndex].y += point.dataPoints[1]
        clusterCenters[clusterIndex].count++;
    })

    return clusterCenters.map(center => ({
        x: center.x / center.count,
        y: center.y / center.count
    }))
}

export function kMeansPipeline(gameItems, k = 3) {

    const rawData = mapGameItemsFromObjectToListEntries(gameItems);

    const normalizedData = normalizeData(rawData);
    const contributionPerVariable = Array(normalizedData[0].length).fill(1 / normalizedData[0].length);

    // Here we got for every data point a cluster number from 0 to k-1
    const result = kMeans(normalizedData, k, contributionPerVariable);

    //Reduce data points from n dimensions to 2 dimensions
    const reducedDataPoints = runPCAForVisualization(result.map(data => data.dataPoint), 2);

    //Combine the reduced data points with the suiting centroidIndex
    const reducedDataPointsWithClusterIndex = [];

    for (let i = 0; i < result.length; i++) {
        reducedDataPointsWithClusterIndex.push({
            dataPoints: reducedDataPoints[i],
            clusterIndex: result[i].centroidIndex
        })
    }

    return {
        data: reducedDataPointsWithClusterIndex,
        clusterCenters: computeClusterCenters(reducedDataPointsWithClusterIndex, k)
    }
}

function normalizeData(data) {
    const numFeatures = data[0].length;
    const mins = Array(numFeatures).fill(Infinity);
    const maxs = Array(numFeatures).fill(-Infinity);

    for (let row of data) {
        for (let i = 0; i < numFeatures; i++) {
            if (row[i] != null && row[i] < mins[i]) mins[i] = row[i];
            if (row[i] > maxs[i]) maxs[i] = row[i];
        }
    }

    return data.map(row =>
        row.map((value, i) => (value - mins[i]) / (maxs[i] - mins[i] || 1))
    );
}

function runPCAForVisualization(normalizedData, dimensions = 2) {
    const matrix = druid.Matrix.from(normalizedData);
    const pca = new druid.PCA(matrix, {d: dimensions});
    return pca.transform().to2dArray;
}
