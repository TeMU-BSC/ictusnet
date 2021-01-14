#!/bin/bash
export HOME_ICTUS=$1
export CTAKES_HOME=/ICTUSnet/ctakes-SpaCTeS
export TXT=/ICTUSnet/data/TXT
export ANN_VARIABLE=$HOME_ICTUS/ANN_VARIABLE
export ANN_SECTION=$HOME_ICTUS/ANN_SECTION
export ANN_FINAL=$HOME_ICTUS/ANN_FINAL
export HEADERDETECTOR=/ICTUSnet/HeaderDetector
export BRATMERGER=/ICTUSnet/BratMerger
echo "Detecting Variables ..."
java -Djava.library.path=/usr/local/share/freeling/APIs/java -cp $CTAKES_HOME/lib/*:$CTAKES_HOME/ctakes-SpaCTeS-4.0.1-SNAPSHOT.jar -Dlog4j.configuration=file:$CTAKES_HOME/config/log4j.xml -Xmx8g  org.apache.ctakes.spactes.pipeline.SpaCTeSBuilderRunner $TXT $ANN_VARIABLE

echo "Detecting Sections ..."
python3 $HEADERDETECTOR/scripts/header_detector.py --input $TXT --output $ANN_SECTION

echo "Merging Variables and Sections ..."
python3 $BRATMERGER/src/main.py --data $ANN_SECTION

