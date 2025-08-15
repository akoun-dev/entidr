'use strict';

module.exports = (sequelize, DataTypes) => {
    const DocumentLayout = sequelize.define('DocumentLayout', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        orientation: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'portrait'
        },
        paperSize: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'A4'
        },
        margins: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: { top: 10, right: 10, bottom: 10, left: 10 }
        },
        previewUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active'
        }
    }, {});

    DocumentLayout.associate = function(models) {
        // Associations can be defined here
    };

    return DocumentLayout;
};
