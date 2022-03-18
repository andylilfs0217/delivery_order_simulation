#!/bin/bash

green() {
  echo -e '\e[32m'$1'\e[m';
}

readonly DATABASE_NAME="backend_system"
readonly DATABASE_USER="andy"
readonly DATABASE_PASSWORD="Andyli!!!0217"

readonly MYSQL=`which mysql`

# Construct the MySQL query
readonly Q1="CREATE DATABASE IF NOT EXISTS $DATABASE_NAME;"
readonly Q2="GRANT ALL ON *.* TO '$DATABASE_USER'@'localhost' IDENTIFIED BY '$DATABASE_PASSWORD';"
readonly Q3="FLUSH PRIVILEGES;"
readonly SQL="${Q1}${Q2}${Q3}"

# Run the actual command
$MYSQL -uroot -p -e "$SQL"

# Let the user know the database was created
green "Database $DATABASE_NAME and user $DATABASE_USER created with a password you chose"