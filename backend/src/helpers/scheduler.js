const { Variable } = require('../models/variableModel')
const { createReports } = require('../db/init')
const { execGenerateAnnFiles, getPathFilesCount, removeFilesInDirectory } = require('./io');
const { UPLOADS_DIR, DEEPLEARNING_DIR, JOINT_DIR } = require('../constants')

let jobRunning = false

var cron = require('node-cron');

cron.schedule('* * * * *', async () => {
    console.log("Looking for new txt files...")
    
    if (!jobRunning && getPathFilesCount(UPLOADS_DIR) > 0) {
        jobRunning = true
        console.log("Starting generation of Ann files...")
        await execGenerateAnnFiles() 

        // Transform the .ann and .txt files into a .json format to store them in database.
        const variables = await Variable.find()
        await createReports(JOINT_DIR, variables)
    
        removeFilesInDirectory(UPLOADS_DIR)
        removeFilesInDirectory(DEEPLEARNING_DIR)
        removeFilesInDirectory(JOINT_DIR)

        jobRunning = false

    }else{
        console.log("Job is already running or not new txt files exist...")
    } 
  })

function setJobRunnig (running) {
    jobRunning = running
}
function getJobRunnig () {
    return jobRunning
}

module.exports = { setJobRunnig, getJobRunnig }