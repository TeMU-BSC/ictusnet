# Pre-annotation Dockerized Pipeline for the ICTUSnet Project

This repository contains two different pipelines (tags):

1. bsctemu/ictusnet:ctakes - Initial version based on the Apache cTAKES.
2. bsctemu/ictusnet:deeplearning - Deep Learning version based on transformers.

## Previous considerations

- `/full/path/to/your/input/data` is your input directory that should be as below format:

```
data
├── file1.txt
├── file2.txt
└── ...
```

- `/full/path/to/your/output/data`should be an empty directory to put the `.ann` files that `ictusnet` docker container will generate. **Being at HOME Diretory is highly recommended**.

## Install and Run

### Method 1: Docker

Make sure [docker](https://docs.docker.com/engine/install/) is installed in your system.

Build the docker image, assuming Docker is a [non-root user](https://docs.docker.com/engine/install/linux-postinstall/):

```
bash build-docker.sh
```

Run the docker container, assuming Docker is a [non-root user](https://docs.docker.com/engine/install/linux-postinstall/):

Note: Run the below script with two arguments: one path for TXT directory as an input and one path for ANN directory as an output.

```
bash run-docker.sh /full/path/to/your/input/data /full/path/to/your/output/data
```

### Method 2: Singularity

For building the Singularity image, once the Docker one has been built (since it is converted using https://github.com/singularityhub/docker2singularity), assuming Singularity is installed and Docker is a [non-root user](https://docs.docker.com/engine/install/linux-postinstall/), run:

```
bash build-singularity.sh
```

Run singularity image:

Note: Run the below script with two arguments: one path for TXT directory as an input and one path for ANN directory as an output.

```
bash run-singularity.sh /full/path/to/your/input/data /full/path/to/your/output/data
```

## Resources

This docker image is available online at docker hub:
https://hub.docker.com/r/bsctemu/ictusnet

## Contact

Siamak Barzegar (siamak.barzegar@bsc.es)
