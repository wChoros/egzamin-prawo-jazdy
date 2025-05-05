import { exec } from 'child_process'
import process from 'process'

const getToken = async (email) => {
    return new Promise(resolve => {
        const pythonCommand = `${process.env.APP_PATH}/.venv/bin/python ${process.env.APP_PATH}/scripts/py/getToken.py -e ${email}`;
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
    })
}

export default getToken;