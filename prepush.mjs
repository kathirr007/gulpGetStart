import fs from 'node:fs';
import { exec } from 'node:child_process';

// Define the command you want to execute
const npmScript = 'npm run build';
const pushScript = 'git add . && git push';

// Define the path to the folder
const folderPath = './dist';
const filePath = './dist/index.html';

// Check if the folder exists
fs.access(filePath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error('Index.html file does not exist. Running build command...');
    // Execute the npm script
    exec(npmScript, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing npm script: ${error}`);
        return;
      }

      // Log the output of the script
      console.log(`stdout: ${stdout}`);
      // console.error(`stderr: ${stderr}`);
    });
    // return;
  } else {
    console.log('Dist Folder exists. Pushing the files to github...');
    exec(pushScript, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing npm script: ${error}`);
        return;
      }

      // Log the output of the script
      console.log(`stdout: ${stdout}`);
      // console.error(`stderr: ${stderr}`);
    });

  }

});
