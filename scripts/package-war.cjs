const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const profile = process.argv[2];
if (!['pruebas', 'produccion'].includes(profile)) throw new Error('Perfil requerido: pruebas o produccion');
const output = profile === 'produccion' ? 'prod.war' : 'frontendv1.war';
const directory = path.join('dist', profile, 'browser');
if (!fs.existsSync(path.join(directory, 'index.html'))) throw new Error('Primero compila el frontend.');
const jar = process.env.JAR_BIN || (process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'jar.exe' : 'jar')
  : 'jar');
const result = spawnSync(jar, ['--create', '--file', output, '-C', directory, '.'], { stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
console.log(`WAR generado: ${path.resolve(output)}`);
