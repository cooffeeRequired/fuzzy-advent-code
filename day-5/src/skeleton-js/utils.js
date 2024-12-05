const fs = require('fs').promises;
const path = require('path') // Importing file system module for file operations

/**
 * Reads the input file and returns its contents as a string.
 * @param {string} filePath - The path to the input file.
 * @returns {Promise<string>} - The file contents as a string.
 */
async function readInput(filePath) {
  try {
    // Read the file content asynchronously
    const data = await fs.readFile(path.resolve("..", "..", filePath), 'utf8');
    return data; // Return the file content
  } catch (error) {
    // Handle errors during file reading
    throw new Error(`Failed to read input file: ${error.message}`);
  }
}

/**
 * Splits the input data into two sections: rules and updates.
 * Ensures the input is formatted correctly and throws an error if not.
 * @param {string} contents - The full file contents.
 * @returns {string[]} - An array containing the rules section and updates section.
 */
function splitSections(contents) {
  const sections = contents.trim().split('\n\n'); // Split content by double newline
  if (sections.length < 2) {
    // Validate the input format
    throw new Error('Input file must contain two sections separated by an empty line.');
  }
  return sections; // Return both sections as separate strings
}

/**
 * Parses the rules section into a dependency map.
 * Each rule defines that one page must appear before another if both are present.
 * @param {string} rulesSection - The raw rules section as a string.
 * @returns {Map<number, number[]>} - A map where each key has a list of dependencies.
 */
function parseRules(rulesSection) {
  const rules = new Map(); // Create a map to store dependencies
  const lines = rulesSection.trim().split('\n'); // Split rules into individual lines

  for (const line of lines) {
    const [x, y] = line.split('|').map(Number); // Parse each rule into numbers
    if (isNaN(x) || isNaN(y)) {
      // Validate the rule format
      throw new Error(`Invalid rule format: ${line}`);
    }
    if (!rules.has(x)) {
      // Initialize an empty array for dependencies if not already present
      rules.set(x, []);
    }
    rules.get(x).push(y); // Add the dependency
  }

  return rules; // Return the dependency map
}

/**
 * Parses the updates section into an array of updates.
 * Each update is represented as an array of page numbers.
 * @param {string} updatesSection - The raw updates section as a string.
 * @returns {number[][]} - An array of updates, where each update is an array of numbers.
 */
function parseUpdates(updatesSection) {
  return updatesSection.trim().split('\n').map(line =>
    line.split(',').map(num => {
      const parsed = parseInt(num, 10); // Parse each page number
      if (isNaN(parsed)) {
        // Validate the format
        throw new Error(`Failed to parse page number: ${num}`);
      }
      return parsed; // Return the parsed number
    })
  );
}

/**
 * Calculates the middle sums for both correct and fixed updates.
 * Correct updates are those that follow the rules, while fixed updates are reordered to follow the rules.
 * @param {Map<number, number[]>} orderingRules - The dependency rules map.
 * @param {number[][]} updates - The parsed updates array.
 * @returns {{ totalMiddleSum: number, totalMiddleSumFixed: number }}
 */
function calculateSums(orderingRules, updates) {
  let totalMiddleSum = 0; // Accumulator for correct updates
  let totalMiddleSumFixed = 0; // Accumulator for fixed updates

  for (const update of updates) {
    if (isUpdateCorrect(orderingRules, update)) {
      // If the update is correct
      const middle = middlePage(update); // Find the middle page
      console.log(`Correct update: ${update} | Middle page: ${middle}`);
      totalMiddleSum += middle; // Add to correct sum
    } else {
      // If the update is incorrect
      const fixedUpdate = fixUpdate(orderingRules, update); // Fix the update
      const middle = middlePage(fixedUpdate); // Find the middle page of the fixed update
      console.log(`Incorrect update: ${update} | Fixed to: ${fixedUpdate} | Middle page: ${middle}`);
      totalMiddleSumFixed += middle; // Add to fixed sum
    }
  }

  return { totalMiddleSum, totalMiddleSumFixed }; // Return both sums
}

/**
 * Checks whether an update is correctly ordered based on the rules.
 * @param {Map<number, number[]>} orderingRules - The dependency rules map.
 * @param {number[]} update - A single update as an array of numbers.
 * @returns {boolean} - True if the update is correct, false otherwise.
 */
function isUpdateCorrect(orderingRules, update) {
  const updateSet = new Set(update); // Convert the update array to a set for fast lookup

  for (const [x, dependents] of orderingRules) {
    if (!updateSet.has(x)) continue; // Skip rules that do not apply to this update

    for (const y of dependents) {
      if (!updateSet.has(y)) continue; // Skip dependencies not in the update

      const posX = update.indexOf(x); // Find position of x in the update
      const posY = update.indexOf(y); // Find position of y in the update

      if (posX > posY) {
        // Check if x appears before y
        console.log(`Violation: ${x} must come before ${y} in update: ${update}`);
        return false; // If not, the update is incorrect
      }
    }
  }

  return true; // If all rules are satisfied, the update is correct
}

/**
 * Fixes an update by reordering it to satisfy the rules.
 * Uses topological sorting to determine the correct order.
 * @param {Map<number, number[]>} orderingRules - The dependency rules map.
 * @param {number[]} update - A single update as an array of numbers.
 * @returns {number[]} - The fixed update as an array of numbers.
 */
function fixUpdate(orderingRules, update) {
  const graph = new Map(); // Graph for topological sorting
  const inDegree = new Map(); // Track the number of dependencies for each node

  // Initialize the graph and in-degree map
  for (const page of update) {
    graph.set(page, []);
    inDegree.set(page, 0);
  }

  // Populate the graph with dependencies from the rules
  for (const [x, dependents] of orderingRules) {
    if (!update.includes(x)) continue; // Skip rules that do not apply to this update

    for (const y of dependents) {
      if (!update.includes(y)) continue; // Skip dependencies not in the update

      graph.get(x).push(y); // Add y as a dependent of x
      inDegree.set(y, (inDegree.get(y) || 0) + 1); // Increment in-degree of y
    }
  }

  // Perform topological sorting using Kahn's algorithm
  const queue = Array.from(inDegree.keys()).filter(page => inDegree.get(page) === 0);
  const sorted = [];

  while (queue.length > 0) {
    const page = queue.shift(); // Get a node with no dependencies
    sorted.push(page); // Add it to the sorted order

    for (const neighbor of graph.get(page)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1); // Decrease in-degree
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor); // If no dependencies remain, add to queue
      }
    }
  }

  return sorted; // Return the sorted (fixed) update
}

/**
 * Finds the middle page of an update.
 * @param {number[]} update - A single update as an array of numbers.
 * @returns {number} - The middle page number.
 */
function middlePage(update) {
  const middleIndex = Math.floor(update.length / 2); // Calculate the middle index
  return update[middleIndex]; // Return the middle element
}

module.exports = {
  readInput,
  splitSections,
  parseRules,
  parseUpdates,
  calculateSums,
};
