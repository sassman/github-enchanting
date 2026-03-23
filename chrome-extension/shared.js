'use strict';

const DEPENDABOT_COMMANDS = [
  { key: 'rebase',            label: '🔄  Rebase',                   command: '@dependabot rebase' },
  { key: 'recreate',          label: '🔁  Recreate',                 command: '@dependabot recreate' },
  { key: 'merge',             label: '🔀  Merge',                    command: '@dependabot merge' },
  { key: 'squash-and-merge',  label: '⬆️  Squash and merge',          command: '@dependabot squash and merge' },
  { key: 'cancel-merge',      label: '❌  Cancel merge',             command: '@dependabot cancel merge' },
  { key: 'reopen',            label: '🔓  Reopen',                   command: '@dependabot reopen' },
  { key: 'close',             label: '🚪  Close',                    command: '@dependabot close' },
  { key: 'ignore-dependency', label: '🙈  Ignore this dependency',   command: '@dependabot ignore this dependency' },
  { key: 'ignore-major',      label: '🔴  Ignore this major version',command: '@dependabot ignore this major version' },
  { key: 'ignore-minor',      label: '🟡  Ignore this minor version',command: '@dependabot ignore this minor version' },
  { key: 'ignore-patch',      label: '🩹  Ignore this patch version',command: '@dependabot ignore this patch version' },
];

function getCommandByKey(key) {
  const entry = DEPENDABOT_COMMANDS.find(c => c.key === key);
  return entry ? entry.command : null;
}
