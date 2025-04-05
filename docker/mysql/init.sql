#
# prismaのmigrateコマンドを実行する場合は以下の権限が必要
#
GRANT create, alter, drop, references ON *.* TO 'developer'@'%';
FLUSH PRIVILEGES;
