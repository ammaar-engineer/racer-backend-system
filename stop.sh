# echo "Stopping system..."
# sudo docker compose down
# sudo systemctl stop docker
# if [[ $? > 0 ]]; 
#     then
#         echo "Something wrong"
#     else
#         echo "System successfully stopped"
# fi

#!/bin/bash
# racer-menu.sh

echo "🔧 Racer CLI Menu"
echo "=================="

PS3="Pilih opsi: "
options=(
    "Snippet: Download"
    "Snippet: List"
    "Bucket: List"
    "File: Upload"
    "AI: Chat"
    "Keluar"
)
select opt in "${options[@]}"; do
    case $opt in
        "Snippet: Download")
            racer snippet --download
            ;;
        "Snippet: List")
            racer snippet --list
            ;;
        "Bucket: List")
            racer bucket --list
            ;;
        "File: Upload")
            read -p "File: " file
            read -p "Bucket: " bucket
            racer file --upload "$file" "$bucket"
            ;;
        "AI: Chat")
            read -p "Pesan: " msg
            racer ai --chat "$msg"
            ;;
        "Keluar")
            break
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
done