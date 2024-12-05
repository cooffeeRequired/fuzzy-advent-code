
const {
  readInput, 
  splitSections,
  parseRules, 
  parseUpdates, 
} = require('./utils'); 

// Main function that orchestrates the execution
(async function main() {
  try {
    // Step 1: Read the input file and load its contents as a string
    const contents = await readInput('./resources/real'); // Path to the input file
    console.log('File Contents:\n', contents); // Debugging: Display the input contents

    // Step 2: Split the input into two sections: rules and updates
    const [rulesSection, updatesSection] = splitSections(contents);
    console.log('Rules Section:\n', rulesSection); // Debugging: Display rules section
    console.log('Updates Section:\n', updatesSection); // Debugging: Display updates section

    // Step 3: Parse the rules into a map of dependencies
    const orderingRules = parseRules(rulesSection);

    // Step 4: Parse the updates section into an array of update arrays
    const updates = parseUpdates(updatesSection);

    // Step 5: Calculate the middle sums for correct and fixed updates
    const { totalMiddleSum, totalMiddleSumFixed } = calculateSums(
      orderingRules, // Dependency rules map
      updates // Array of updates
    );

    // Step 6: Display the results
    console.log('Total middle sum of correct updates:', totalMiddleSum);
    console.log('Total middle sum of fixed updates:', totalMiddleSumFixed);
  } catch (error) {
    // Catch and display any errors that occur during execution
    console.error('An error occurred:', error.message);
  }
})();
