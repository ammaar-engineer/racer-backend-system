# Racer Backend System
## Syarat penggunaan
1. Pastikan docker dan docker compose telah terinstall pada VPS.
2. Jalankan skrip **run.sh** untuk memulai backend nya
3. Ubah minio_host pada .env dengan alamat nginx yang valid

## Penggunaan
Ini adalah backend untuk sistem Racer CLI System. Hosting backend ini ke VPS kamu dan set host pada sistem cli nya dengan url yang mengarah ke backend ini yang ada di VPS mu.
Misal VPS mu url nya adalah https://103.99.34.23.com
Maka pada konfigurasi CLI kamu set dengan url VPS tersebut menjadi seperti.
```bash
racer config --set-host "https://103.99.34.23.com"
```
Dan sistem CLI pun terhubung ke backend nya.

## Peran backend
Backend akan dipakai oleh sistem CLI. Backend memiliki peran untuk menyimpan file-file kamu pada MinIO. Dan juga menyimpan snippets yang telah dibuat pada SQlite.
