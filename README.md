# @shadow-library/common

The **@shadow-library/common** package provides a comprehensive collection of essential utilities, services, and error-handling mechanisms designed to streamline development across the Shadow Library ecosystem. This package is built with TypeScript and offers robust, reusable components for task management, API requests, caching, logging, configuration management, and more.

## Features

### 🏗️ **Task Management & Orchestration**

- **Task Class**: Robust task execution with retry logic, exponential backoff, and rollback capabilities
- **TaskManager**: Orchestrate multiple tasks with automatic rollback on failure
- **Configurable retry strategies** with custom retry callbacks

### 🌐 **HTTP Client & API Management**

- **APIRequest**: Fluent API client with method chaining for HTTP requests
- **Built-in error handling** with customizable error suppression
- **Request/response logging** with configurable detail levels
- **Support for all HTTP methods** (GET, POST, PUT, PATCH, DELETE)
- **Child class creation** for reusable API configurations

### 🗄️ **Caching Solutions**

- **InMemoryStore**: Simple key-value store with array manipulation methods
- **LRUCache**: High-performance Least Recently Used cache with TypedArray optimization
- **Global store instance** for application-wide state management

### ⚙️ **Configuration Management**

- **Type-safe configuration** with environment variable validation
- **Built-in validation** for numbers, booleans, and allowed values
- **Custom transformers** and validators
- **Environment detection** (development, production, test)
- **Production-required configurations** with automatic validation

### 📝 **Advanced Logging System**

- **Multi-transport logging** (Console, File, CloudWatch)
- **Configurable log levels** and formats
- **Metadata injection** and structured logging
- **Sensitive data redaction** with fast-redact integration
- **Environment-specific transport configuration**

### 🚨 **Comprehensive Error Handling**

- **Structured error hierarchy** with error codes and types
- **ValidationError** with field-level error tracking
- **AppError** with interpolated error messages
- **Built-in error types** for common scenarios

### 🛠️ **Utility Functions**

- **String interpolation** with object path resolution
- **Object manipulation** (pick, omit, deep freeze, path access, plain object detection)
- **Temporal utilities** with time unit support
- **Reflection utilities** with metadata management
- **Functional programming helpers** (tryCatch, withThis, throwError)

### 🔍 **Metadata & Reflection**

- **Enhanced reflection capabilities** with metadata manipulation
- **Metadata cloning** and updating
- **Integration with reflect-metadata**

### 📱 **TypeScript Support**

- **Fully typed interfaces** and implementations
- **Generic type support** throughout the library
- **Enhanced IntelliSense** and type safety

---

## Installation

Install the package using your preferred package manager:

```bash
# npm
npm install @shadow-library/common

# Yarn
yarn add @shadow-library/common

# pnpm
pnpm add @shadow-library/common

# bun
bun add @shadow-library/common
```

---

## Usage

### 🏗️ **Task Management**

#### Creating and Executing Tasks

```ts
import { Task } from '@shadow-library/common';

// Simple task execution
const task = Task.create(() => performOperation())
  .name('Data Processing')
  .retry(3)
  .delay(1000)
  .backoff(2)
  .onRetry((error, attempt) => console.log(`Retry ${attempt}:`, error))
  .rollback(result => cleanupOperation(result));

const result = await task.execute();

// Execute rollback if needed
if (task.hasRollback()) {
  await task.executeRollback();
}
```

#### Task Orchestration with TaskManager

```ts
import { TaskManager } from '@shadow-library/common';

const orchestrator = TaskManager.create({
  name: 'Data Pipeline',
  rollbackOnError: true,
});

orchestrator
  .addTask(() => fetchData())
  .addTask(() => processData())
  .addTask(() => saveData());

try {
  const results = await orchestrator.execute();
  console.log('All tasks completed:', results);
} catch (error) {
  console.error('Pipeline failed, rollback completed:', error);
}
```

### 🌐 **HTTP Client & API Requests**

#### Fluent API Client

```ts
import { APIRequest } from '@shadow-library/common';

// Simple GET request
const response = await APIRequest.get('/users').header('Authorization', 'Bearer token').query('page', '1').query('limit', '10');

// POST request with complex body
const user = await APIRequest.post('/users')
  .header('Content-Type', 'application/json')
  .field('profile.name', 'John Doe')
  .field('profile.email', 'john@example.com')
  .field('settings.theme', 'dark')
  .body({ active: true });

// Create reusable API client
const UserAPI = APIRequest.get('/api/users').child();
UserAPI.setOptions({
  headers: { Authorization: 'Bearer token' },
  throwErrorOnFailure: false,
});

const userClient = new UserAPI();
```

#### Error Handling

```ts
// Suppress errors for custom handling
const response = await APIRequest.get('/might-fail').suppressErrors().execute();

if (response.statusCode >= 400) {
  console.log('Request failed:', response.data);
}

// Handle APIError
try {
  await APIRequest.post('/data').body({ invalid: 'data' });
} catch (error) {
  if (error instanceof APIError) {
    console.log('Status:', error.statusCode);
    console.log('Response:', error.data);
  }
}
```

### 🗄️ **Caching**

#### In-Memory Store

```ts
import { InMemoryStore, GlobalStore } from '@shadow-library/common';

const cache = new InMemoryStore();

// Basic operations
cache.set('user:1', { name: 'John', age: 30 });
const user = cache.get<User>('user:1');

// Array operations
cache.insert('tags', 'typescript');
cache.insert('tags', 'nodejs');
cache.remove('tags', 'typescript');

// Numeric operations
cache.inc('counter', 1); // Increment counter
cache.inc('score', -5); // Decrement score

// Using global store
GlobalStore.set('app:config', { theme: 'dark' });
```

#### LRU Cache

```ts
import { LRUCache } from '@shadow-library/common';

const cache = new LRUCache(100); // Capacity of 100 items

cache.set('key1', 'value1');
cache.set('key2', 'value2');

// Check existence without affecting order
const exists = cache.has('key1');
const value = cache.peek('key1'); // Doesn't update access time

// Get with LRU update
const recentValue = cache.get('key1'); // Moves to top

// Remove specific item
const removed = cache.remove('key2');

// Clear all items
cache.clear();
```

### ⚙️ **Configuration Management**

#### Type-Safe Configuration

```ts
import { Config, ConfigService } from '@shadow-library/common';

// Using global config
const appName = Config.get('app.name');
const logLevel = Config.get('log.level');
const isDev = Config.isDev();
const isProd = Config.isProd();

// Create custom configuration
interface CustomConfig extends ConfigRecords {
  'api.baseUrl': string;
  'api.timeout': number;
  'feature.enabled': boolean;
}

class MyConfigService extends ConfigService<CustomConfig> {
  constructor() {
    super();
    this.set('api.baseUrl', {
      defaultValue: 'http://localhost:3000',
      isProdRequired: true,
    });
    this.set('api.timeout', {
      defaultValue: '5000',
      validateType: 'number',
    });
    this.set('feature.enabled', {
      defaultValue: 'false',
      validateType: 'boolean',
    });
  }
}

const myConfig = new MyConfigService();
const apiUrl = myConfig.get('api.baseUrl');
const timeout = myConfig.getOrThrow('api.timeout'); // Throws if undefined
```

### 📝 **Logging**

#### Advanced Logging System

```ts
import { Logger } from '@shadow-library/common';

// Get logger instance
const logger = Logger.getLogger('MyApp', 'UserService');

// Log at different levels
logger.info('User created successfully', { userId: 123 });
logger.warn('User email not verified', { userId: 123 });
logger.error('Failed to create user', { error: 'Validation failed' });
logger.debug('Processing user data', { step: 'validation' });

// Configure logger
Logger.setDefaultMetadata({ service: 'user-api', version: '1.0.0' });
Logger.setLogMetadataProvider(() => ({
  requestId: getCurrentRequestId(),
  timestamp: Date.now(),
}));

// Add sensitive data redaction
const redactor = Logger.getRedactor(['password', 'ssn', 'creditCard']);
const safeData = redactor({ user: 'john', password: 'secret123' });

// Add custom transport
Logger.addTransport(customTransport);
```

### 🚨 **Error Handling**

#### Structured Error Management

```ts
import { AppError, ValidationError, ErrorCode, ErrorType } from '@shadow-library/common';

// Custom error codes
class UserErrorCode extends ErrorCode {
  static readonly USER_NOT_FOUND = new ErrorCode('USER_NOT_FOUND', ErrorType.NOT_FOUND, 'User with ID {userId} not found');
}

// Create structured errors
const error = new AppError(UserErrorCode.USER_NOT_FOUND, { userId: 123 });
console.log(error.getCode()); // 'USER_NOT_FOUND'
console.log(error.getType()); // 'NOT_FOUND'
console.log(error.getMessage()); // 'User with ID 123 not found'

// Validation errors
const validation = new ValidationError().addFieldError('email', 'Invalid email format').addFieldError('password', 'Password too short');

// Combine multiple validation errors
const combined = ValidationError.combineErrors(validation1, validation2);
console.log(combined.getSummary()); // 'Validation failed for email and password'
```

### 🛠️ **Utility Functions**

#### String Utilities

```ts
import { utils } from '@shadow-library/common';

// String interpolation with object paths
const template = 'Hello {user.name}, your score is {stats.score}';
const data = {
  user: { name: 'John' },
  stats: { score: 100 },
};
const result = utils.string.interpolate(template, data);
// Result: 'Hello John, your score is 100'

// Escape interpolation
const escaped = utils.string.interpolate('Price: \\{notInterpolated}', {});
// Result: 'Price: {notInterpolated}'
```

#### Object Utilities

```ts
import { utils } from '@shadow-library/common';

const user = {
  profile: { name: 'John', email: 'john@example.com' },
  settings: { theme: 'dark', notifications: true },
};

// Get nested values
const name = utils.object.getByPath(user, 'profile.name'); // 'John'
const theme = utils.object.getByPath(user, 'settings.theme'); // 'dark'

// Pick specific keys
const profile = utils.object.pickKeys(user, ['profile']);
// Result: { profile: { name: 'John', email: 'john@example.com' } }

// Omit keys
const withoutSettings = utils.object.omitKeys(user, ['settings']);
// Result: { profile: { name: 'John', email: 'john@example.com' } }

// Check if object is a plain object
const isPlain1 = utils.object.isPlainObject({}); // true
const isPlain2 = utils.object.isPlainObject({ name: 'John' }); // true
const isPlain3 = utils.object.isPlainObject(new Date()); // false
const isPlain4 = utils.object.isPlainObject([]); // false
const isPlain5 = utils.object.isPlainObject(null); // false

// Deep freeze objects
const frozen = utils.object.deepFreeze(user);

// Get all property names and descriptors
const properties = utils.object.getAllPropertyNames(user);
const descriptors = utils.object.getAllPropertyDescriptors(user);
```

#### Temporal Utilities

```ts
import { utils } from '@shadow-library/common';

// Sleep with different time units
await utils.temporal.sleep(500); // 500 milliseconds
await utils.temporal.sleep(2, 's'); // 2 seconds
await utils.temporal.sleep(5, 'm'); // 5 minutes
await utils.temporal.sleep(1, 'h'); // 1 hour
```

#### Functional Programming Helpers

```ts
import { tryCatch, withThis, throwError } from '@shadow-library/common';

// Safe function execution
const result = tryCatch(() => riskyOperation());
if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
}

// Async version
const asyncResult = await tryCatch(async () => await asyncOperation());

// Context binding helper
class Calculator {
  multiplier = 10;

  multiply = withThis((context: Calculator, value: number) => value * context.multiplier);
}

const calc = new Calculator();
const result = calc.multiply(5); // 50

// Explicit error throwing
const value = someCondition ? 'valid' : throwError(new Error('Invalid'));
```

### 🔍 **Metadata & Reflection**

#### Enhanced Reflection

```ts
import { Reflector } from '@shadow-library/common';

// Define metadata
Reflector.defineMetadata('roles', ['admin', 'user'], UserController);
Reflector.defineMetadata('permissions', 'read', UserController, 'getUser');

// Append/prepend to existing metadata
Reflector.appendMetadata('roles', 'guest', UserController);
Reflector.prependMetadata('roles', 'super-admin', UserController);

// Update object metadata
Reflector.updateMetadata('config', { timeout: 5000 }, UserController);

// Clone metadata between objects
Reflector.cloneMetadata(NewController, UserController);

// Check and retrieve metadata
const hasRoles = Reflector.hasMetadata('roles', UserController);
const roles = Reflector.getMetadata('roles', UserController);
```

### 🔧 **Advanced Features**

#### Validation Utilities

```ts
import { utils } from '@shadow-library/common';

// Universal validation
console.log(utils.isValid('hello')); // true
console.log(utils.isValid('')); // false
console.log(utils.isValid(null)); // false
console.log(utils.isValid(undefined)); // false
console.log(utils.isValid(0)); // true
console.log(utils.isValid(NaN)); // false
```

---

## Environment Variables

The package uses environment variables for configuration. Below are the key variables:

### Application Configuration

- `NODE_ENV`: Application environment (`development`, `production`, `test`)
- `APP_NAME`: Application name (default: `shadow-app`)

### Logging Configuration

- `LOG_LEVEL`: Logging level (`silly`, `debug`, `http`, `info`, `warn`, `error`)
- `LOG_DIR`: Log directory path (default: `logs`, set to `false` to disable file logging)
- `LOG_BUFFER_SIZE`: Log buffer size for batch processing (default: `10000`)

### AWS CloudWatch Configuration

- `AWS_REGION`: AWS region for CloudWatch logs (default: `ap-south-1`)
- `AWS_CLOUDWATCH_LOG_GROUP`: CloudWatch log group name (default: app name)
- `AWS_CLOUDWATCH_LOG_STREAM`: CloudWatch log stream name (default: app name)
- `AWS_CLOUDWATCH_UPLOAD_RATE`: CloudWatch upload rate in ms (default: `2000`)

---

## API Reference

### Core Classes

#### Task

- `Task.create(fn)` - Create a new task
- `.name(string)` - Set task name
- `.retry(number)` - Set retry count
- `.delay(number)` - Set delay between retries in ms
- `.backoff(number)` - Set exponential backoff factor
- `.onRetry(callback)` - Set retry callback
- `.rollback(fn)` - Set rollback function
- `.execute()` - Execute the task
- `.executeRollback()` - Execute rollback

#### TaskManager

- `TaskManager.create(options)` - Create task orchestrator
- `.addTask(task|fn)` - Add task to execution queue
- `.getResult(task)` - Get result of specific task
- `.execute()` - Execute all tasks

#### APIRequest

- `APIRequest.get(url)` - Create GET request
- `APIRequest.post(url)` - Create POST request
- `APIRequest.put(url)` - Create PUT request
- `APIRequest.patch(url)` - Create PATCH request
- `APIRequest.delete(url)` - Create DELETE request
- `.header(key, value)` - Add header
- `.query(key, value)` - Add query parameter
- `.field(path, value)` - Add nested field to body
- `.body(object)` - Set request body
- `.suppressErrors()` - Disable automatic error throwing
- `.child()` - Create reusable child class
- `.execute()` - Execute request

#### LRUCache

- `new LRUCache(capacity)` - Create cache with capacity
- `.set(key, value)` - Store value
- `.get(key)` - Retrieve and mark as recently used
- `.peek(key)` - Retrieve without updating access
- `.has(key)` - Check if key exists
- `.remove(key)` - Remove specific key
- `.clear()` - Clear all items

#### InMemoryStore

- `new InMemoryStore()` - Create store
- `.set(key, value)` - Store value
- `.get(key, defaultValue?)` - Retrieve value
- `.del(key)` - Delete key
- `.insert(key, value)` - Add to array
- `.remove(key, value)` - Remove from array
- `.inc(key, amount)` - Increment numeric value

### Error Classes

#### AppError

- `new AppError(errorCode, data?)` - Create structured error
- `.getCode()` - Get error code
- `.getType()` - Get error type
- `.getMessage()` - Get formatted message
- `.getData()` - Get error data
- `.setCause(error)` - Set underlying cause
- `.toObject()` - Convert to plain object

#### ValidationError

- `new ValidationError(field?, message?)` - Create validation error
- `.addFieldError(field, message)` - Add field error
- `.getErrors()` - Get all field errors
- `.getErrorCount()` - Get error count
- `.getSummary()` - Get human-readable summary
- `ValidationError.combineErrors(...errors)` - Combine multiple errors

### Services

#### ConfigService

- `Config.get(key)` - Get configuration value
- `Config.getOrThrow(key)` - Get value or throw
- `Config.isDev()` - Check if development environment
- `Config.isProd()` - Check if production environment
- `Config.isTest()` - Check if test environment

#### Logger

- `Logger.getLogger(namespace, label?)` - Get logger instance
- `Logger.setDefaultMetadata(metadata)` - Set default metadata
- `Logger.getRedactor(paths, censor?)` - Create data redactor
- `Logger.addTransport(transport)` - Add log transport
- `Logger.isDebugEnabled()` - Check if debug logging enabled

#### Reflector

- `Reflector.defineMetadata(key, value, target, property?)` - Define metadata
- `Reflector.getMetadata(key, target, property?)` - Get metadata
- `Reflector.appendMetadata(key, value, target, property?)` - Append to metadata
- `Reflector.updateMetadata(key, value, target, property?)` - Update metadata
- `Reflector.cloneMetadata(target, source, property?)` - Clone metadata

### Utility Functions

#### String Utils

- `utils.string.interpolate(template, data)` - Interpolate string with object

#### Object Utils

- `utils.object.getByPath(obj, path)` - Get nested value by path
- `utils.object.pickKeys(obj, keys)` - Pick specific keys
- `utils.object.omitKeys(obj, keys)` - Omit specific keys
- `utils.object.deepFreeze(obj)` - Recursively freeze object
- `utils.object.isPlainObject(obj)` - Check if object is a plain object
- `utils.object.getAllPropertyNames(target, filter?)` - Get all property names including inherited
- `utils.object.getAllPropertyDescriptors(target, filter?)` - Get all property descriptors including inherited

#### Temporal Utils

- `utils.temporal.sleep(duration, unit?)` - Sleep for specified duration

#### General Utils

- `utils.isValid(value)` - Check if value is valid (not null/undefined/empty)

### Shorthand Functions

- `throwError(error)` - Explicitly throw error
- `tryCatch(fn)` - Safe function execution with result object
- `withThis(fn)` - Create function with explicit context binding

---

## Types & Interfaces

### Configuration Types

```ts
type NodeEnv = 'development' | 'production' | 'test';
type LogLevel = 'silly' | 'debug' | 'http' | 'info' | 'warn' | 'error';
type TimeUnit = 'ms' | 's' | 'm' | 'h';
```

### Result Types

```ts
type TryResult<TError, TResult> = { success: true; data: TResult } | { success: false; error: TError };

interface APIResponse<T = any> {
  statusCode: number;
  headers: Record<string, string>;
  data: T | null;
}
```

### Function Types

```ts
type Fn<T = any, U = any> = (...args: U[]) => Promisable<T>;
type RetryCallback = (error: unknown, attempt: number) => Promisable<unknown>;
type RollbackFn<T> = (data: T) => Promisable<unknown>;
```

---

## Examples

### Building a Robust Data Pipeline

```ts
import { TaskManager, Task, Logger, Config } from '@shadow-library/common';

const logger = Logger.getLogger('DataPipeline');

// Create tasks with retry and rollback
const extractTask = Task.create(async () => {
  const data = await fetchFromAPI();
  return data;
})
  .name('Extract Data')
  .retry(3)
  .delay(1000)
  .rollback(async data => {
    await cleanupExtractedData(data.id);
  });

const transformTask = Task.create(async () => {
  const rawData = taskManager.getResult(extractTask);
  return await transformData(rawData);
})
  .name('Transform Data')
  .retry(2);

// Orchestrate pipeline
const taskManager = TaskManager.create({
  name: 'ETL Pipeline',
  rollbackOnError: true,
});

taskManager
  .addTask(extractTask)
  .addTask(transformTask)
  .addTask(() => saveToDatabase());

try {
  await taskManager.execute();
  logger.info('Pipeline completed successfully');
} catch (error) {
  logger.error('Pipeline failed, rollback completed', error);
}
```

### Creating a Resilient API Client

```ts
import { APIRequest, tryCatch, Logger } from '@shadow-library/common';

// Create base API client
const BaseAPI = APIRequest.get('https://api.example.com').child();
BaseAPI.setOptions({
  headers: {
    Authorization: `Bearer ${Config.get('api.token')}`,
    'User-Agent': `${Config.get('app.name')}/1.0.0`,
  },
  throwErrorOnFailure: false,
});

class UserService {
  private api = new BaseAPI();
  private logger = Logger.getLogger('UserService');

  async getUser(id: string) {
    const result = await tryCatch(async () => {
      const response = await this.api.get(`/users/${id}`).query('include', 'profile,settings');

      if (response.statusCode === 404) {
        throw new AppError(UserErrorCode.USER_NOT_FOUND, { userId: id });
      }

      return response.data;
    });

    if (result.success) {
      this.logger.info('User retrieved successfully', { userId: id });
      return result.data;
    } else {
      this.logger.error('Failed to retrieve user', result.error);
      throw result.error;
    }
  }
}
```

### Advanced Caching Strategy

```ts
import { LRUCache, InMemoryStore, utils } from '@shadow-library/common';

class CacheManager {
  private l1Cache = new LRUCache(1000); // Fast L1 cache
  private l2Cache = new InMemoryStore(); // Larger L2 cache
  private stats = new InMemoryStore();

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Try L1 cache first
    let value = this.l1Cache.get<T>(key);
    if (value) {
      this.stats.inc('l1_hits', 1);
      return value;
    }

    // Try L2 cache
    value = this.l2Cache.get<T>(key);
    if (value) {
      this.l1Cache.set(key, value); // Promote to L1
      this.stats.inc('l2_hits', 1);
      return value;
    }

    // Fetch and cache
    value = await fetcher();
    this.l1Cache.set(key, value);
    this.l2Cache.set(key, value);
    this.stats.inc('misses', 1);

    return value;
  }

  getStats() {
    return {
      l1Hits: this.stats.get('l1_hits', 0),
      l2Hits: this.stats.get('l2_hits', 0),
      misses: this.stats.get('misses', 0),
    };
  }
}
```

---

## Best Practices

### Error Handling

- Use `AppError` with custom error codes for business logic errors
- Use `ValidationError` for input validation with field-level details
- Implement proper error logging with context information
- Use `tryCatch` for safe execution of risky operations

### Task Management

- Set meaningful task names for better debugging
- Implement rollback functions for operations with side effects
- Use exponential backoff for transient failures
- Log retry attempts for monitoring

### Configuration

- Define type-safe configuration interfaces
- Use validation for critical configuration values
- Set appropriate defaults for development
- Mark production-required configurations

### Logging

- Use structured logging with consistent metadata
- Implement log redaction for sensitive data
- Configure appropriate log levels per environment
- Use contextual loggers with namespace and labels

### Caching

- Choose appropriate cache types based on use case
- Implement cache invalidation strategies
- Monitor cache hit rates and performance
- Use global store sparingly for application state

---

## Performance Considerations

### LRU Cache Optimization

- Uses TypedArray for memory efficiency
- Automatically selects optimal array type based on capacity
- O(1) operations for get, set, and remove
- Supports up to 4.2 billion items

### Task Execution

- Implements efficient retry mechanisms with configurable delays
- Rollback operations are atomic and fast
- Task orchestration with automatic cleanup

### API Client

- Request/response logging with performance metrics
- Connection reuse through undici integration
- Configurable error handling and timeouts

### Memory Management

- Global singletons for configuration and store
- Efficient object manipulation utilities
- Metadata caching with reflection optimization

---

## Contributing

We welcome contributions! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

---

## License

This package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
