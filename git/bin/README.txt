Place git/bin on your PATH.

  githash              short hash of HEAD
  githash <n>          short hash, n commits back
  githash full [n]     full hash, with the short prefix highlighted
  githash search <rev> branches that contain the revision

  gitprune             list local branches missing from origin
  gitprune -d          delete those branches when Git considers them merged

gitprune never deletes the current branch, main, or master.
It does not fetch. Run git fetch --prune first when you want a fresh remote list.
