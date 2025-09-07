// config/schemaManager.js
const { pool } = require('./db');

/**
 * Schema Manager - Handles automatic table creation and updates
 * Similar to Spring Boot's spring.jpa.hibernate.ddl-auto
 */
class SchemaManager {
  constructor() {
    this.ddlAuto = process.env.DDL_AUTO || 'validate'; 
    this.schemas = this.getSchemas();
  }

  /**
   * Define all table schemas
   */
  getSchemas() {
    return {
      AUTH: {
        tableName: 'AUTH',
        columns: [
          'id INT AUTO_INCREMENT PRIMARY KEY',
          'email VARCHAR(255) NOT NULL UNIQUE',
          'password VARCHAR(255) NOT NULL',
          'status ENUM(\'ACTIVE\', \'INACTIVE\', \'PENDING\', \'SUSPENDED\') DEFAULT \'ACTIVE\'',
          'createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
          'modifiedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ],
        indexes: [
          'INDEX idx_email (email)',
          'INDEX idx_status (status)'
        ]
      },
      FOOTER: {
        tableName: 'FOOTER',
        columns: [
          'id INT AUTO_INCREMENT PRIMARY KEY',
          'title VARCHAR(255) NOT NULL',
          'url TEXT NOT NULL',
          'status ENUM(\'ACTIVE\', \'INACTIVE\') DEFAULT \'ACTIVE\'',
          'createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
          'modifyDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ],
        indexes: [
          'INDEX idx_status (status)'
        ]
      },
      GAMES: {
        tableName: 'GAMES',
        columns: [
          'id INT AUTO_INCREMENT PRIMARY KEY',
          'title VARCHAR(255) NOT NULL',
          'description TEXT',
          'url TEXT NOT NULL',
          'thumbnail TEXT',
          'status ENUM(\'ACTIVE\', \'INACTIVE\') DEFAULT \'ACTIVE\'',
          'createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
          'modifyDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ],
        indexes: [
          'INDEX idx_status (status)',
          'INDEX idx_title (title)'
        ]
      },
      NAV: {
        tableName: 'NAV',
        columns: [
          'id INT AUTO_INCREMENT PRIMARY KEY',
          'title VARCHAR(255) NOT NULL',
          'url TEXT NOT NULL',
          'status ENUM(\'ACTIVE\', \'INACTIVE\') DEFAULT \'ACTIVE\'',
          'createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
          'modifyDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ],
        indexes: [
          'INDEX idx_status (status)'
        ]
      }
    };
  }

  /**
   * Initialize schema based on DDL_AUTO setting
   */
  async initializeSchema() {
    try {
      console.log(`**Initializing database schema with DDL_AUTO: ${this.ddlAuto}`);
      
      switch (this.ddlAuto.toLowerCase()) {
        case 'create':
          await this.createTables();
          break;
        case 'create-drop':
          await this.dropAndCreateTables();
          break;
        case 'update':
          await this.updateTables();
          break;
        case 'validate':
          await this.validateTables();
          break;
        case 'none':
          console.log('📋 DDL_AUTO is set to none. Skipping schema management.');
          break;
        default:
          console.log('**Unknown DDL_AUTO value. Using validate mode.');
          await this.validateTables();
      }
      
      console.log('(: Schema initialization completed successfully');
    } catch (error) {
      console.error('): Schema initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Create tables if they don't exist
   */
  async createTables() {
    const connection = await pool.getConnection();
    
    try {
      console.log('** Creating tables...');
      
      for (const [schemaName, schema] of Object.entries(this.schemas)) {
        const exists = await this.tableExists(schema.tableName, connection);
        
        if (!exists) {
          await this.createTable(schema, connection);
          console.log(`(: Created table: ${schema.tableName}`);
        } else {
          console.log(`**Table ${schema.tableName} already exists`);
        }
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Drop and recreate all tables
   */
  async dropAndCreateTables() {
    const connection = await pool.getConnection();
    
    try {
      console.log('**Dropping and recreating tables...');
      
      // Drop tables in reverse order to handle dependencies
      const tableNames = Object.values(this.schemas).map(s => s.tableName).reverse();
      
      for (const tableName of tableNames) {
        await connection.execute(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`**  Dropped table: ${tableName}`);
      }
      
      // Create tables
      for (const [schemaName, schema] of Object.entries(this.schemas)) {
        await this.createTable(schema, connection);
        console.log(`(: Created table: ${schema.tableName}`);
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Update existing tables (add missing columns)
   */
  async updateTables() {
    const connection = await pool.getConnection();
    
    try {
      console.log('** Updating table schemas...');
      
      for (const [schemaName, schema] of Object.entries(this.schemas)) {
        const exists = await this.tableExists(schema.tableName, connection);
        
        if (!exists) {
          await this.createTable(schema, connection);
          console.log(`(: Created table: ${schema.tableName}`);
        } else {
          await this.updateTableStructure(schema, connection);
        }
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Validate that all tables exist and have correct structure
   */
  async validateTables() {
    const connection = await pool.getConnection();
    
    try {
      console.log('🔍 Validating table schemas...');
      
      for (const [schemaName, schema] of Object.entries(this.schemas)) {
        const exists = await this.tableExists(schema.tableName, connection);
        
        if (!exists) {
          throw new Error(`Table ${schema.tableName} does not exist. Consider using DDL_AUTO=create or DDL_AUTO=update`);
        }
        
        // Validate table structure
        const isValid = await this.validateTableStructure(schema, connection);
        if (!isValid) {
          console.warn(`**Table ${schema.tableName} structure may not match expected schema`);
        } else {
          console.log(`(: Table ${schema.tableName} validation passed`);
        }
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Check if table exists
   */
  async tableExists(tableName, connection) {
    const [rows] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName]
    );
    return rows.length > 0;
  }

  /**
   * Create a table with its schema
   */
  async createTable(schema, connection) {
    const createTableSQL = `
      CREATE TABLE ${schema.tableName} (
        ${schema.columns.join(',\n        ')}${schema.indexes.length > 0 ? ',\n        ' + schema.indexes.join(',\n        ') : ''}
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTableSQL);
  }

  /**
   * Update table structure by adding missing columns
   */
  async updateTableStructure(schema, connection) {
    try {
      // Get current table structure
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [schema.tableName]
      );

      const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
      
      // Check for missing columns and add them
      for (const columnDef of schema.columns) {
        const columnName = this.extractColumnName(columnDef);
        
        if (!existingColumns.includes(columnName.toLowerCase())) {
          const alterSQL = `ALTER TABLE ${schema.tableName} ADD COLUMN ${columnDef}`;
          await connection.execute(alterSQL);
          console.log(`** Added column ${columnName} to ${schema.tableName}`);
        }
      }

      // Add missing indexes
      await this.updateTableIndexes(schema, connection);
      
      console.log(`(: Updated table: ${schema.tableName}`);
    } catch (error) {
      console.warn(`**Could not fully update table ${schema.tableName}: ${error.message}`);
    }
  }

  /**
   * Update table indexes
   */
  async updateTableIndexes(schema, connection) {
    try {
      // Get existing indexes
      const [indexes] = await connection.execute(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME != 'PRIMARY'`,
        [schema.tableName]
      );

      const existingIndexes = indexes.map(idx => idx.INDEX_NAME);

      // Add missing indexes
      for (const indexDef of schema.indexes) {
        const indexName = this.extractIndexName(indexDef);
        
        if (!existingIndexes.includes(indexName)) {
          const alterSQL = `ALTER TABLE ${schema.tableName} ADD ${indexDef}`;
          await connection.execute(alterSQL);
          console.log(`** Added index ${indexName} to ${schema.tableName}`);
        }
      }
    } catch (error) {
      console.warn(`**Could not update indexes for ${schema.tableName}: ${error.message}`);
    }
  }

  /**
   * Validate table structure matches expected schema
   */
  async validateTableStructure(schema, connection) {
    try {
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [schema.tableName]
      );

      const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
      const expectedColumns = schema.columns.map(col => this.extractColumnName(col).toLowerCase());

      // Check if all expected columns exist
      for (const expectedColumn of expectedColumns) {
        if (!existingColumns.includes(expectedColumn)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn(`**Could not validate table ${schema.tableName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract column name from column definition
   */
  extractColumnName(columnDef) {
    return columnDef.split(' ')[0];
  }

  /**
   * Extract index name from index definition
   */
  extractIndexName(indexDef) {
    const match = indexDef.match(/INDEX\s+(\w+)/i);
    return match ? match[1] : 'unknown_index';
  }

  /**
   * Get schema information
   */
  async getSchemaInfo() {
    const connection = await pool.getConnection();
    
    try {
      const info = {};
      
      for (const [schemaName, schema] of Object.entries(this.schemas)) {
        const exists = await this.tableExists(schema.tableName, connection);
        
        if (exists) {
          const [columns] = await connection.execute(
            `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
             ORDER BY ORDINAL_POSITION`,
            [schema.tableName]
          );

          const [indexes] = await connection.execute(
            `SELECT INDEX_NAME, COLUMN_NAME 
             FROM INFORMATION_SCHEMA.STATISTICS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
            [schema.tableName]
          );

          info[schema.tableName] = {
            exists: true,
            columns: columns,
            indexes: indexes
          };
        } else {
          info[schema.tableName] = {
            exists: false
          };
        }
      }
      
      return info;
    } finally {
      connection.release();
    }
  }
}

module.exports = SchemaManager;