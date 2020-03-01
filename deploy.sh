echo "calendar.dl.itc.u-tokyo.ac.jp" > ./docs/CNAME
git add -A ./docs/CNAME
git commit -m "deploy"
git push origin master
