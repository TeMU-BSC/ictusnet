FROM taln/freeling:latest

LABEL maintainer="siamak.barzegar@bsc.es"

ENV HOME_ICTUS "/ICTUSnet"

RUN mkdir -p $HOME_ICTUS/ctakes-SpaCTeS

COPY spactes-resources-bin/ $HOME_ICTUS/ctakes-SpaCTeS/ 

RUN apt-get -qq update && \
    apt-get install -y python3-dev python3-pip python3-tk python3-lxml python3-six

RUN pip3 install unidecode


WORKDIR $HOME_ICTUS
RUN git clone https://github.com/TeMU-BSC/EHR-HeaderDetector-AnnotationAnalyser HeaderDetector
RUN git clone https://github.com/TeMU-BSC/BratMerger

COPY process.sh $HOME_ICTUS/
RUN chmod a+x $HOME_ICTUS/process.sh && cp $HOME_ICTUS/process.sh /bin/process.sh
