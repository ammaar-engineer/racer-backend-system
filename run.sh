echo "Starting the system..."
sudo systemctl start docker
sudo docker compose up -d
npm run dev
if [[ $? > 0 ]]; 
    then
        echo "Something wrong"
    else
        echo "System successfully started"
fi
echo "System has been started"