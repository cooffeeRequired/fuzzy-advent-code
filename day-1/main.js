

import {readFileSync} from 'fs';

const data = readFileSync('puzzle_input.txt', 'utf8');
const lines = data.trim().split('\n');

let leftList = [];
let rightList = [];

lines.forEach(line => {
    const [left, right] = line.trim().split(/\s+/).map(Number);
    if (!isNaN(left) && !isNaN(right)) {
        leftList.push(left);
        rightList.push(right);
    }
});

leftList.sort((a, b) => a - b);
rightList.sort((a, b) => a - b);

let totalDistance = 0;
for (let i = 0; i < leftList.length; i++) {
    totalDistance += Math.abs(leftList[i] - rightList[i]);
}

console.log("Total distance: " + totalDistance);

// ##################################################################################################




let similarityScore = 0;
const rightListCount = {};

rightList.forEach(number => {
    if (rightListCount[number]) {
        rightListCount[number]++;
    } else {
        rightListCount[number] = 1;
    }
});

leftList.forEach(number => {
    if (rightListCount[number]) {
        similarityScore += number * rightListCount[number];
    }
});

console.log("Similarity score: " + similarityScore);
