#!/usr/bin/env bash

if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "No arguments supplied."
    echo "First argument should be the input directory (txt files)."
    echo "Second argument should be the output directory (txt files will be copied into here and new ann files will be generated)."
    echo "Third argument should be the model directory (all files needed to run the NER model)."
    echo "For example: bash run-docker.sh $HOME/ictusnet/data $HOME/ictusnet/output $HOME/ictusnet/model"
else
  export INPUT_DIR=$1
  export OUTPUT_DIR=$2
  export MODEL_DIR=$3

  # In order to work from node.js backend call, docker run command must be without "-it".
  docker run \
    -v $INPUT_DIR:/ictusnet-dl/data \
    -v $OUTPUT_DIR:/ictusnet-dl/output \
    -v $MODEL_DIR:/ictusnet-dl/model \
    bsctemu/ictusnet:latest \
    run.sh data output model

  printf "Output can be found in %s/brat\n" $OUTPUT_DIR
fi
