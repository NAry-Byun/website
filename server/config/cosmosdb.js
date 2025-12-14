const { CosmosClient } = require('@azure/cosmos');

// CosmosDB configuration
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_ID || 'ShoppingMallDB';

// Initialize Cosmos Client
const client = new CosmosClient({ endpoint, key });

// Database and container references
let database;
let productsContainer;
let usersContainer;
let ordersContainer;

async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const { database: db } = await client.databases.createIfNotExists({ id: databaseId });
    database = db;
    console.log(`Database '${databaseId}' initialized`);

    // Create containers if they don't exist
    const { container: products } = await database.containers.createIfNotExists({
      id: 'Products',
      partitionKey: { paths: ['/category'] }
    });
    productsContainer = products;
    console.log('Products container initialized');

    const { container: users } = await database.containers.createIfNotExists({
      id: 'Users',
      partitionKey: { paths: ['/email'] }
    });
    usersContainer = users;
    console.log('Users container initialized');

    const { container: orders } = await database.containers.createIfNotExists({
      id: 'Orders',
      partitionKey: { paths: ['/userId'] }
    });
    ordersContainer = orders;
    console.log('Orders container initialized');

    console.log('CosmosDB initialization complete');
  } catch (error) {
    console.error('Error initializing CosmosDB:', error.message);
    throw error;
  }
}

// Initialize database on module load
initializeDatabase();

module.exports = {
  client,
  database: () => database,
  containers: {
    products: () => productsContainer,
    users: () => usersContainer,
    orders: () => ordersContainer
  }
};
