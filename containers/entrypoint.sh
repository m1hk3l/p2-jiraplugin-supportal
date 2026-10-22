#!/bin/bash
set -euo pipefail
mkdir -p /home/developer/.m2 /workspace/supportal/target /workspace/supportal/src/main/frontend/node_modules
chown developer:developer /home/developer /home/developer/.m2 /workspace/supportal/target /workspace/supportal/src/main/frontend/node_modules
# Make SDK/Java available to SSH shells as well as Compose processes.
printf 'export JAVA_HOME=%q\nexport PATH=%q:"$PATH"\n' "$JAVA_HOME" "/opt/atlassian-plugin-sdk/bin:$JAVA_HOME/bin:/usr/local/bin" > /etc/profile.d/supportal.sh
case "${1:-}" in
  jira)
    exec runuser -u developer -- bash containers/run-jira.sh
    ;;
  ssh)
    install -d -m 700 -o developer -g developer /home/developer/.ssh
    printf '%s\n' "${DEV_SSH_PUBLIC_KEY:-}" > /home/developer/.ssh/authorized_keys
    chown developer:developer /home/developer/.ssh/authorized_keys
    chmod 600 /home/developer/.ssh/authorized_keys
    mkdir -p /etc/ssh/host-keys /run/sshd
    if [ ! -f /etc/ssh/host-keys/ssh_host_ed25519_key ]; then
      ssh-keygen -q -t ed25519 -N '' -f /etc/ssh/host-keys/ssh_host_ed25519_key
    fi
    exec /usr/sbin/sshd -D -e
    ;;
  *) exec runuser -u developer -- "$@" ;;
esac
