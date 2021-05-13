#!/usr/bin/env bash

if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "No arguments supplied"
    echo "Enter one path for TXT directory as an input and one path for ANN directory as an output"
    echo "For example: bash run-docker.sh $HOME/data/TXT $HOME/data/ANN"
else
  export UPLOADS_DIR=$1 #TXT Directory
  export ANNOTATIONS_DIR=$2 #OUTPUT Directory (HOME Diretory is highly recommended)
  docker run --rm -v $UPLOADS_DIR:/ICTUSnet/data/TXT -v $ANNOTATIONS_DIR:$ANNOTATIONS_DIR/ANN_FINAL/ bsctemu/ictusnet:ctakes process.sh $ANNOTATIONS_DIR #without -it
fi
