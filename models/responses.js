const DataTypes = require("sequelize");
const sequelize = require("../config/seq");
const Enquiry = require("../models/enquiries");

const Response = sequelize.define('Response',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    enquiry_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: Enquiry,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    price:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    origin:{
        type: DataTypes.STRING,
        allowNull: false
    },
    destination:{
        type: DataTypes.STRING,
        allowNull: false
    },
    size:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    delivery_date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    provider_company:{
        type: DataTypes.STRING,
        allowNull: false
    },
    provider_email:{
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'responses',
    timestamps: false
});

//association
Response.belongsTo(Enquiry, { foreignKey: 'enquiry_id' });
Enquiry.hasMany(Response, { foreignKey: 'enquiry_id' });

module.exports = Response;