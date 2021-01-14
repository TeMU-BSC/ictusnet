#!/usr/bin/env bash

docker run -v /var/run/docker.sock:/var/run/docker.sock -v $(realpath .):/output --privileged -t --rm  quay.io/singularity/docker2singularity -n bsctemu-ictusnet -m "/ICTUSnet/data/TXT" bsctemu/ictusnet

