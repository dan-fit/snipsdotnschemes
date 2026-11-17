export ZSH="${HOME}/.oh-my-zsh"
ZSH_THEME="robbyrussell"
DISABLE_LS_COLORS="true"
plugins=(git)

source "${ZSH}/oh-my-zsh.sh"

alias ep="cursor ~/.zshrc"
alias rp="source ~/.zshrc"
alias hosts="sudo cursor /etc/hosts"

co() { git checkout "$@"; }
cn() { git checkout -b "$@"; }
alias stat="git status"
alias add="git add ."
alias commit="git commit -m"
alias push="git push"
alias pull="git pull"

export NVM_DIR="${HOME}/.nvm"
[[ -s "${NVM_DIR}/nvm.sh" ]] && source "${NVM_DIR}/nvm.sh"
[[ -s "${NVM_DIR}/bash_completion" ]] && source "${NVM_DIR}/bash_completion"

[[ -d /opt/homebrew/opt/openssl@3/bin ]] && export PATH="/opt/homebrew/opt/openssl@3/bin:${PATH}"
[[ -d /opt/homebrew/opt/libpq/bin ]] && export PATH="/opt/homebrew/opt/libpq/bin:${PATH}"

if [[ -d "${HOME}/Library/Application Support/Herd/bin" ]]; then
  export PATH="${HOME}/Library/Application Support/Herd/bin:${PATH}"
fi
if [[ -d "${HOME}/Library/Application Support/Herd/config/php/82" ]]; then
  export HERD_PHP_82_INI_SCAN_DIR="${HOME}/Library/Application Support/Herd/config/php/82/"
fi

[[ -s "${HOME}/.bun/_bun" ]] && source "${HOME}/.bun/_bun"
export BUN_INSTALL="${HOME}/.bun"
[[ -d "${BUN_INSTALL}/bin" ]] && export PATH="${BUN_INSTALL}/bin:${PATH}"

if [[ -x /usr/libexec/java_home ]]; then
  JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
  if [[ -n "${JAVA_HOME}" ]]; then
    export JAVA_HOME
    export PATH="${JAVA_HOME}/bin:${PATH}"
  fi
fi

[[ -d "${HOME}/.cargo/bin" ]] && export PATH="${HOME}/.cargo/bin:${PATH}"
[[ -d "${HOME}/.local/bin" ]] && export PATH="${HOME}/.local/bin:${PATH}"

killport() {
  local pid
  pid="$(lsof -n -i4TCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -n 1)"
  if [[ -z "${pid}" ]]; then
    echo "No listener on port ${1}"
    return 1
  fi
  kill -9 "${pid}"
}

killnode() {
  local RED='\033[0;31m'
  local GREEN='\033[0;32m'
  local YELLOW='\033[1;33m'
  local NC='\033[0m'
  local node_count
  node_count="$(pgrep -c node 2>/dev/null || echo "0")"

  if [[ "${node_count}" -eq 0 ]]; then
    echo "${YELLOW}No Node.js processes found running.${NC}"
    return 0
  fi

  echo "${YELLOW}Found ${node_count} Node.js process(es) running:${NC}"
  echo ""
  ps aux | grep -E '[n]ode' | awk '{printf "  PID: %-6s User: %-10s CPU: %5s%% Mem: %5s%% Command: %s\n", $2, $1, $3, $4, substr($0, index($0,$11))}'
  echo ""

  if [[ "$1" == "-f" || "$1" == "--force" ]]; then
    echo "${RED}Force killing all Node.js processes...${NC}"
    pkill -9 node
    echo "${GREEN}All Node.js processes terminated.${NC}"
    return 0
  fi

  echo -n "Kill all Node.js processes? [y/N] "
  read -r response
  if [[ "${response}" =~ ^[Yy]$ ]]; then
    echo "${RED}Killing all Node.js processes...${NC}"
    pkill -9 node
    sleep 0.5
    local remaining
    remaining="$(pgrep -c node 2>/dev/null || echo "0")"
    if [[ "${remaining}" -eq 0 ]]; then
      echo "${GREEN}All Node.js processes successfully terminated.${NC}"
    else
      echo "${YELLOW}Some processes may still be running. Run with -f to force kill.${NC}"
    fi
  else
    echo "${YELLOW}Cancelled. No processes were killed.${NC}"
  fi
}

alias killnodef="killnode -f"
alias localdoms="sudo caddy run --config local-dev/Caddyfile"

__zshrc_dir="${${(%):-%N}:A:h}"
if [[ -f "${__zshrc_dir}/.zshrc.local" ]]; then
  source "${__zshrc_dir}/.zshrc.local"
fi
if [[ -f "${HOME}/.zshrc.local" && "${HOME}/.zshrc.local" != "${__zshrc_dir}/.zshrc.local" ]]; then
  source "${HOME}/.zshrc.local"
fi
unset __zshrc_dir
