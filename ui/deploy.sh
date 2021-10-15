###
 # @Description: contents
 # @Author: zyc
 # @Date: 2021-10-15 10:02:04
 # @LastEditTime: 2021-10-15 10:05:05
### 

cd build/;
git init;
git remote add github git@github.com:AnonBug/whu_gym_book.git;
git status -s;
git add .;
git commit -m "$1";
git checkout -b gh-pages;
git push -f github gh-pages;
