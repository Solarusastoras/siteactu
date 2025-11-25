const ftp = require('basic-ftp');

async function testFTP() {
  const client = new ftp.Client(30000); // Timeout 30s
  client.ftp.verbose = true;
  
  try {
    console.log('Tentative de connexion à ftp.cluster129.hosting.ovh.net:21...');
    await client.access({
      host: 'ftp.cluster129.hosting.ovh.net',
      port: 21,
      user: 'solarui',
      password: 'Barlovento0',
      secure: false,
      secureOptions: { rejectUnauthorized: false }
    });
    console.log('✓ Connexion établie!');
    
    console.log('\nListage du répertoire racine:');
    const list = await client.list('/');
    list.forEach(item => console.log(`  ${item.type === 1 ? 'DIR' : 'FILE'}: ${item.name}`));
    
    console.log('\nVérification du répertoire www/actu/data:');
    try {
      await client.cd('/www/actu/data');
      console.log('✓ Répertoire existe');
      const dataList = await client.list();
      console.log('Contenu:');
      dataList.forEach(item => console.log(`  ${item.name} (${item.size} bytes)`));
    } catch (err) {
      console.log('✗ Répertoire n\'existe pas ou erreur:', err.message);
    }
    
    client.close();
    console.log('\n✓ Test terminé avec succès');
  } catch (error) {
    console.error('✗ Erreur:', error.message);
    console.error('Stack:', error.stack);
    client.close();
    process.exit(1);
  }
}

testFTP();
