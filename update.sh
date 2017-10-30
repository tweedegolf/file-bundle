#!/bin/bash

git checkout npm-dev build/
echo -e "\033[0;32m1/4 checking out build folder of branch 'npm-dev'"
wait

cp -r ./build/* ./
echo "2/4 copy contents of build folder"
wait

git rm -rf ./build/ &> /dev/null
echo "3/4 remove build folder from git"
wait

rm -rf ./build
echo "4/4 remove build folder"
wait

echo -e "\033[0;37m"
git status
wait
