# Docker setup in Debian
# Reference - https://www.puzzlr.org/install-docker-on-a-google-cloud-virtual-machine/
sudo apt update
sudo apt install --yes apt-transport-https ca-certificates curl gnupg2 software-properties-common
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
sudo apt update
sudo apt install --yes docker-ce

# To allow docker commands from non-root users
sudo usermod -aG docker $USER
logout

# Install Node.js for developer dashboard
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# FaunaDB setup with Docker images
# Reference - https://gist.github.com/CaryBourgeois/ebe08f8819fc1904523e360746a94bae

# Fetch image
docker pull fauna/faunadb

# Test image
docker run fauna/faunadb --help

# Create a Docker network
docker network create fauna-network

# Initialize the cluster
docker run --network=fauna-network -d --rm --name faunadb_node1 -v /var/fauna/fauna-1:/var/lib/faunadb -v /var/fauna-log/fauna-log-1:/var/log/faunadb -p 8443:8443 fauna/faunadb

# Login to the node to find the internal IP used
docker exec -it faunadb_node1 /bin/bash

# Check status and get the internal IP
# Can be found under the Address column
/faunadb/bin/faunadb-admin -k secret status

# Start second node and join it to the cluster
# --run command is used to start the node, but not initialize it
docker run --network=fauna-network -d --rm --name faunadb_node2 -v /var/fauna/fauna-2:/var/lib/faunadb -v /var/fauna-log/fauna-log-2:/var/log/faunadb -p 8444:8443 fauna/faunadb --run
docker exec -it faunadb_node2 /bin/bash
/faunadb/bin/faunadb-admin join -r NoDC 172.19.0.2

# Repeat for third node
docker run --network=fauna-network -d --rm --name faunadb_node3 -v /var/fauna/fauna-3:/var/lib/faunadb -v /var/fauna-log/fauna-log-3:/var/log/faunadb -p 8445:8443 fauna/faunadb --run
docker exec -it faunadb_node3 /bin/bash
/faunadb/bin/faunadb-admin join -r NoDC 172.19.0.2

# Repeat for fourth node
docker run --network=fauna-network -d --rm --name faunadb_node4 -v /var/fauna/fauna-4:/var/lib/faunadb -v /var/fauna-log/fauna-log-4:/var/log/faunadb -p 8446:8443 fauna/faunadb --run
docker exec -it faunadb_node4 /bin/bash
/faunadb/bin/faunadb-admin join -r NoDC 172.19.0.2

# Run the developer dashboard
# Login to the cluster using port http://<public-ip-address>:8443 and 'secret' as they key
git clone https://github.com/fauna/dashboard
cd dashboard/
npm install
nohup node start > dashboard-output.log &

# Database Key
# Your key's secret is:
# fnADYyzhs4ACAP5YEnUaT1H-Dn_BnvxfIW_t5ZHz