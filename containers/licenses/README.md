# Public three-hour timebomb licences

These are public Atlassian test keys, not company or production licences.
Source: https://developer.atlassian.com/platform/marketplace/timebomb-licenses-for-testing-server-apps/

- `jira-software.txt`: Jira Software Data Center, 10 users, three hours.
- `jira-service-management.txt`: Jira Service Desk/Data Center, 10 users, three hours.
- `data-center-app.txt`: generic Data Center app test key, 10 users, three hours.

The container Maven profile passes the Software key to AMPS as `productLicense`.
During initial Jira setup, if prompted, paste this key. Apply the JSM key under
Administration -> Applications -> Versions & licenses. Use the generic app key
in ScriptRunner's Manage apps licence field only if accepted by that version.
ScriptRunner itself is not installed by this change.

Jira 11 acceptance of the published keys must be checked against the actual
runtime. If a key is rejected, retain timebomb-only licensing and obtain an
updated test key from Atlassian; do not substitute a production licence.
An existing database retains its licensing state; restarting a container is
not a guaranteed renewal. Expiry and renewal follow the product's test-licence
handling. Clearing development volumes destroys all local Jira data.
