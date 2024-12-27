import { exec } from 'child_process'

const getTokenReserv = async () => {
    return new Promise(resolve => {
        const pythonCommand = `python ./scripts/py/getTokenReserv.py`;
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
    });
}

export default getTokenReserv;