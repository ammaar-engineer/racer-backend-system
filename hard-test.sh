# Ini adalah skrip pengetesan yang menghapus volume dari docker dan juga
# menghapus database sqlite. Skrip ini dibuat untuk melakukan tes upload supaya tidak terjadi
# masalah konflik saat pengetesan

sudo systemctl start docker
sudo docker volume rm backend_minio_data
if [ -f ./app.db ];
    then
        rm ./app.db
fi
sudo docker compose up -d
npm run dev