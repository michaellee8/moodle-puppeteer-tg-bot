FROM ubuntu:latest
RUN apt-get update && \
    apt-get install redis-tools nano -y && \
    apt-get clean autoclean && \
    apt-get autoremove --yes && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/
CMD ["/bin/bash"]