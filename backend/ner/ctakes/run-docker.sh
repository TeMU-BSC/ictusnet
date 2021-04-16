#!/usr/bin/env bash

if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "No arguments supplied"
    echo "Enter one path for TXT directory as an input and one path for ANN directory as an output"
    echo "For example: bash run-docker.sh $HOME/data/TXT $HOME/data/ANN"
else
  export INPUT_DIR=$1 #TXT Directory
  export OUTPUT_DIR=$2 #OUTPUT Directory (HOME Diretory is highly recommended)
  docker run --rm -v $INPUT_DIR:/ICTUSnet/data/TXT -v $OUTPUT_DIR:$OUTPUT_DIR/ANN_FINAL/ bsctemu/ictusnet process.sh $OUTPUT_DIR #without -it
fi
