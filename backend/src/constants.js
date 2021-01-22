const uploadsDir = './uploads'
const ctakesDir = '/tmp/ctakes'  // must have 777 permissions so ctakes can write ann files inside it
const runDockerScript = './ictusnet-ctakes/run-docker.sh'

module.exports = {
  uploadsDir,
  ctakesDir,
  runDockerScript,
}