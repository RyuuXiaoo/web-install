const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('ssh2');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/install', (req, res) => {
  const { ip, password, panel, node } = req.body;
  const ssh = new Client();

  ssh.on('ready', () => {
    ssh.exec('bash <(curl -s https://pterodactyl-installer.se)', (err, stream) => {
      if (err) return res.send('SSH Error');

      stream.on('data', d => {
        const o = d.toString();
        if (o.includes('Input 0-6')) stream.write('0\n');
        if (o.includes('(y/N)')) stream.write('y\n');
        if (o.includes('FQDN')) stream.write(panel + '\n');
      });

      stream.on('close', () => {
        ssh.end();
        res.send('INSTALL PANEL SELESAI');
      });
    });
  }).connect({
    host: ip,
    username: 'root',
    password
  });
});

app.listen(3000, () => console.log('WEB INSTALLER RUNNING :3000'));
