#!/bin/bash

git checkout npm-dev dist/
echo -e "\033[0;32m1/4 checking out dist folder of branch 'npm-dev'"
wait

cp -r ./dist/* ./
echo "2/4 copy contents of dist folder"
wait

git rm -rf ./dist/ &> /dev/null
echo "3/4 remove dist folder from git"
wait

rm -rf ./dist
echo "4/4 remove dist folder"
wait

echo -e "\033[0;37m"
git status
wait
