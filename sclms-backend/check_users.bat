@echo off
mysql -u root -pLishaanth -e "USE sclms_db; SELECT id, email, role FROM users;"
