const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, // İçecek adı boş olamaz
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false, // Fiyat boş olamaz
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true, // Açıklama isteğe bağlı
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true, // Görsel isteğe bağlı
    },
}, {
    timestamps: true
})

module.exports = {
    Product
}