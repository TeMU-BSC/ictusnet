#!/usr/bin/env bash

if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "No arguments supplied"
    echo "Enter one path for TXT directory as an input, one path for brat files as an output. Another path for the model is optiona (default: script path + 'model'"
    echo "For example: bash run-docker.sh $HOME/data/TXT $HOME/data/output $HOME/model "
else
  export UPLOADS_DIR=$1 #TXT Directory
  export ANNOTATIONS_DIR=$2 #OUTPUT Directory (HOME Diretory is highly recommended)
  if [ -z "$3" ]
    then
      export MODEL="$(dirname "$(realpath $0)")/model"
  else
    export MODEL=$3 # model path
  fi
  docker run --rm -v $UPLOADS_DIR:/ictusnet-dl/data -v $ANNOTATIONS_DIR:/ictusnet-dl/output -v $MODEL:/ictusnet-dl/model bsctemu/ictusnet:latest run.sh data output model
fi