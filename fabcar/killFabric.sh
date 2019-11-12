cd ../first-network/
./byfn.sh down

docker rm -f $(docker ps -aq)

docker rmi -f $(docker images | grep fabcar | awk '{print $3}')
