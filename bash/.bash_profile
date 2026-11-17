#!/usr/bin/env bash

export PATH="$HOME/.local/bin:/opt/homebrew/bin:${PATH}"

for snippet in .colors .aliases .functions .prompt; do
  if [[ -f "$HOME/${snippet}" ]]; then
    # shellcheck source=/dev/null
    source "$HOME/${snippet}"
  fi
done
