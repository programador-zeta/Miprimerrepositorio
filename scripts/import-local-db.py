"""Preserve official image runtime configuration while consolidating vfs layers."""
import json
import subprocess
from pathlib import Path
root = Path('.local-tools')
config = json.loads((root / 'postgres.config.json').read_text())['config']
args = ['docker', 'import']
for value in config.get('Env', []):
    args += ['--change', 'ENV ' + value]
for field in ['Entrypoint', 'Cmd']:
    if config.get(field):
        args += ['--change', field.upper() + ' ' + json.dumps(config[field])]
for field, directive in [('User', 'USER'), ('WorkingDir', 'WORKDIR'), ('StopSignal', 'STOPSIGNAL')]:
    if config.get(field):
        args += ['--change', directive + ' ' + config[field]]
for port in config.get('ExposedPorts', {}):
    args += ['--change', 'EXPOSE ' + port]
for volume in config.get('Volumes', {}):
    args += ['--change', 'VOLUME ' + json.dumps([volume])]
args += [str(root / 'postgres.rootfs.tar'), 'supabase/postgres:17.6.1.029']
subprocess.run(args, check=True)
