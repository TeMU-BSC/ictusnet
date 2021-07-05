const { db } = require('../db/mongodb');
const { Agenda } = require('agenda');
const { Variable } = require('../models/variableModel')
const { createReports } = require('../db/init')
const { execGenerateAnnFiles, getPathFilesCount, removeFilesInDirectory } = require('./io');
const { UPLOADS_DIR, DEEPLEARNING_DIR, JOINT_DIR } = require('../constants')

const agenda = new Agenda({ mongo: db });
let jobRunning = false

agenda
    .on('ready', () => console.log('Agenda started!'))
    .on('error', () => console.log('Agenda connection error!'))

agenda.define("generate ann files", async (job, done) => {

    console.log("enter job")
    console.log(jobRunning)

    if (!jobRunning && getPathFilesCount(UPLOADS_DIR) > 0) {
        jobRunning = true
        console.log("generating")
        const generated = execGenerateAnnFiles() 

        // Transform the .ann and .txt files into a .json format to store them in database.
        const variables = await Variable.find()
        await createReports(JOINT_DIR, variables)
    
        removeFilesInDirectory(UPLOADS_DIR)
        removeFilesInDirectory(DEEPLEARNING_DIR)
        removeFilesInDirectory(JOINT_DIR)
  
        jobRunning = false

    }else{
        console.log("Not run")
    } 
    console.log("Done")
    done()
    
  });
  
function setJobRunnig (running){
    jobRunning = running
}
function getJobRunnig (){
    return jobRunning
}


(async function() {
    agenda.every('1 minutes', 'generate ann files')
    await agenda.start()
})();


module.exports = { agenda, setJobRunnig, getJobRunnig }