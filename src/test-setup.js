async function removeAllCollections(db) {
  const collections = Object.keys(db.collections);
  for (const collectionName of collections) {
    const collection = db.collections[collectionName];
    await collection.deleteMany();
  }
}

async function dropAllCollections(db) {
  const collections = Object.keys(db.collections);
  for (const collectionName of collections) {
    const collection = db.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      console.log(error.message);
    }
  }
}

module.exports = (db) => {
  afterEach(async () => {
    await removeAllCollections(db);
  });

  afterAll(async () => {
    await dropAllCollections(db);
    await db.close();
  });
};
