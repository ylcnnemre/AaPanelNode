const { Sequelize } = require('sequelize');

// Sequelize ile veritabanı bağlantısını oluştur
const sequelize = new Sequelize('mydb1x2', 'mydb1x2', 'WBk3jE5c5LpzsNYN', {
    host: '98.159.236.170',
    dialect: 'postgres', // veya 'mysql', 'sqlite', 'mssql' gibi
});

// Bağlantıyı test et
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarılı!');
    } catch (error) {
        console.error('Veritabanı bağlantısı hatası:', error);
    }
}

async function syncModels() {
    try {
        sequelize.sync({ alter: true })
        console.log("senkronizasyon başarılı")
    }
    catch (err) {
        console.log("err", err)
    }

}

module.exports = {
    testConnection,
    sequelize,
    syncModels
}
