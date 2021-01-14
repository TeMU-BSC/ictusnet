#!/usr/bin/env bash

if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "No arguments supplied"
    echo "Enter one path for TXT directory as an input and one path for ANN directory as an output"
    echo "For example: bash run-singularty.sh $HOME/data/TXT $HOME/data/ANN"

else
  export INPUT_DIR=$1 #TXT Directory
  export OUTPUT_DIR=$2 #OUTPUT Directory (HOME Diretory is highly recommended)

  singularity run -B $INPUT_DIR:/ICTUSnet/data/TXT  *.sif process.sh $OUTPUT_DIR
  rm -rf $OUTPUT_DIR/ANN_VARIABLE
  rm -rf $OUTPUT_DIR/ANN_SECTION
  rm -rf $OUTPUT_DIR/XML_SECTION
fi
