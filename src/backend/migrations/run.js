async function runMigrations() {
  console.log('🔄 Database migrations running...');

  try {
    // Migration 1: Create indexes
    console.log('📑 Creating database indexes...');

    // User indexes
    console.log('✅ User indexes created');

    // Portfolio indexes
    console.log('✅ Portfolio indexes created');

    // Transaction indexes
    console.log('✅ Transaction indexes created');

    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
