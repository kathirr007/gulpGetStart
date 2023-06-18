import fs from 'node:fs';

// Define the path to the folder
const folderPath = './dist';
const filePath = './dist/index.html';

// Check if the folder exists
fs.access(filePath, fs.constants.F_OK, (err) => {
  if (err) {
    throw (new Error('Index.html file does not exist. Please run "npm run build" first and then try to push again...'));
    // Execute the npm script
    /* exec(npmScript, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing npm script: ${error}`);
        return;
      }

      // Log the output of the script
      console.log(`stdout: ${stdout}`);
      // console.error(`stderr: ${stderr}`);
      console.log(`Please try to add new files and then push again...`)
      // throw (new Error(`Error executing git push`));
      return;
    }); */
  } else {
    return;
  }

});
