import { exec } from 'child_process'
import fs from 'fs'

const getToken = async (isReservation = false) => {
    return new Promise(resolve => {
        const pythonCommand = `python ./scripts/py/getToken.py`;
        if (!isReservation){
            exec(pythonCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing Python script: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Python script stderr: ${stderr}`);
                    return;
                }
            
                const outputValue = stdout.trim();
    
                resolve(outputValue);
            });
        }
        else {
            fs.readFile('./reservationToken.txt', 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file: ${err.message}`);
                    return;
                }
                resolve(data.trim());
            });
        }
    })
}

export default getToken;