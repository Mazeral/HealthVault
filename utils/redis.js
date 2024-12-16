// Import the createClient function from the redis library
import { createClient } from 'redis';

/**
 * RedisClient class to handle interactions with a Redis server
 */
class RedisClient {
  /**
   * Constructor to initialize the RedisClient instance
   */
  constructor() {
    // Define the Redis server host and port
    const localhost = '127.0.0.1';
    const port = 6379;

    // Create a new Redis client instance
    this.client = createClient({
      host: localhost,
      port,
    });

    // Bind an error event handler to the client
    this.client.on('error', (error) => {
      console.log(`Redis Error: ${error.message}`);
    });
  }
}
const redisClient = new RedisClient();

// Export the RedisClient instance
export default redisClient;
