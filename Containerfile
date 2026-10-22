FROM node:22-bookworm-slim AS node
FROM eclipse-temurin:21-jdk-jammy
ARG SDK_VERSION=9.1.1
ARG SDK_URL=https://packages.atlassian.com/maven/repository/public/com/atlassian/amps/atlassian-plugin-sdk/${SDK_VERSION}/atlassian-plugin-sdk-${SDK_VERSION}.tar.gz
ARG SDK_SHA256=b0401ed5e89ff6a5ef20ebbc45f6783169e010ee720a353be20e02addf392776
RUN apt-get update && apt-get install -y --no-install-recommends openssh-server git curl ca-certificates unzip zip tar gzip procps python3 postgresql-client fontconfig libxext6 libxrender1 libxtst6 libxi6 libfreetype6 && rm -rf /var/lib/apt/lists/*
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
RUN curl --fail --location --retry 3 "$SDK_URL" -o /tmp/sdk.tar.gz && echo "$SDK_SHA256  /tmp/sdk.tar.gz" | sha256sum -c - && mkdir /opt/atlassian-plugin-sdk && tar -xzf /tmp/sdk.tar.gz --strip-components=1 -C /opt/atlassian-plugin-sdk && rm /tmp/sdk.tar.gz && test -x /opt/atlassian-plugin-sdk/bin/atlas-mvn
ENV PATH="/opt/atlassian-plugin-sdk/bin:${PATH}"
RUN useradd --create-home --shell /bin/bash developer && passwd -d developer && mkdir -p /workspace/supportal /run/sshd
COPY containers/sshd_config /etc/ssh/sshd_config
COPY containers/entrypoint.sh /usr/local/bin/dev-entrypoint
RUN chmod 755 /usr/local/bin/dev-entrypoint
WORKDIR /workspace/supportal
ENTRYPOINT ["/usr/local/bin/dev-entrypoint"]
