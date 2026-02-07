---
name: general-best-practices
description: General Best Practices: Code Quality & Clean Code.
---

# General Best Practices: Code Quality & Clean Code

This skill provides guidance on identifying and refactoring common code smells. Use this skill when reviewing code, performing refactoring, or advising users on code quality improvements.

---

## 1. Overusing Comments

**Principle:** Code should reveal its intent through clear naming and structure, not through comments.

### The Problem
- Comments often become outdated as code changes
- Comments can mask poorly written code
- Good code is self-documenting

### Detection Signs
- Comments explaining what code does (instead of why)
- Comments repeating what the code clearly states
- Large comment blocks describing simple operations
- TODO/HACK comments left indefinitely

### Refactoring Strategies

**❌ Bad - Comment explains what code does:**
```typescript
// Check if user is active and has verified email
if (user.status === 'active' && user.emailVerified === true) {
  // Process the user
  processUser(user);
}
```

**✅ Good - Code reveals intent:**
```typescript
if (isEligibleForProcessing(user)) {
  processUser(user);
}

function isEligibleForProcessing(user: User): boolean {
  return user.status === 'active' && user.emailVerified;
}
```

**When Comments Are Acceptable:**
- **Why, not what:** Explain business logic, regulatory requirements, or non-obvious decisions
  ```typescript
  // VAT rate calculation follows EU regulations (Directive 2006/112/EC)
  const vatRate = getVatRateForCountry(country);
  ```
- **Warnings about consequences:**
  ```typescript
  // Warning: Changing this timeout affects rate limiting across all services
  const RATE_LIMIT_WINDOW = 60000;
  ```
- **API documentation (JSDoc):** For public APIs that need documentation
  ```typescript
  /**
   * Calculates the expiration time for a verification token
   * @returns Unix timestamp in milliseconds
   */
  getTokenExpiration(): number
  ```

### Action Items for Agent
- Suggest extracting complex conditions into well-named functions
- Recommend renaming variables/functions instead of adding explanatory comments
- Propose extracting magic numbers into well-named constants
- Only preserve comments that explain "why" rather than "what"

---

## 2. Mysterious Name

**Principle:** Names should clearly communicate purpose and meaning without requiring investigation.

### The Problem
- Forces readers to dig into implementation details
- Increases cognitive load
- Makes code maintenance harder

### Detection Signs
- Single-letter variables (except in very short loops or lambdas)
- Abbreviations or acronyms without clear meaning
- Generic names: `data`, `info`, `temp`, `obj`, `result`, `value`
- Names that don't match what they represent
- Hungarian notation or unnecessary prefixes

### Refactoring Strategies

**❌ Bad - Mysterious names:**
```typescript
function calc(u: User, d: number): number {
  const temp = u.bal * d;
  return temp - fee(temp);
}

const dt = new Date();
const usrs = await repo.find();
```

**✅ Good - Revealing names:**
```typescript
function calculateDiscountedBalance(user: User, discountRate: number): number {
  const discountedAmount = user.balance * discountRate;
  return discountedAmount - calculateProcessingFee(discountedAmount);
}

const currentDateTime = new Date();
const activeUsers = await userRepository.findActiveUsers();
```

### Naming Conventions
- **Functions/Methods:** Verb phrases describing actions
  - `calculateTotal()`, `validateEmail()`, `sendNotification()`
- **Boolean variables/functions:** Predicates suggesting yes/no
  - `isActive`, `hasPermission()`, `canDelete()`
- **Classes:** Nouns describing entities
  - `UserService`, `EmailValidator`, `PaymentProcessor`
- **Constants:** Uppercase with underscores for global constants
  - `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT`

### Action Items for Agent
- Suggest specific, descriptive names that reveal intent
- Expand abbreviations to full words
- Replace generic names with domain-specific terminology
- Ensure boolean names read like questions that can be answered yes/no

---

## 3. Duplicated Code

**Principle:** Each piece of knowledge should have a single, unambiguous representation in the system.

### The Problem
- Changes must be made in multiple places
- Increases chance of bugs when changes are inconsistent
- Makes codebase larger and harder to understand

### Detection Signs
- Identical or very similar code blocks in multiple locations
- Copy-paste programming patterns
- Similar logic with minor variations
- Same validation rules repeated across different files

### Refactoring Strategies

**❌ Bad - Duplicated validation logic:**
```typescript
// In signup.service.ts
async signup(dto: SignupDto) {
  if (!dto.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new BadRequestException('Invalid email');
  }
  if (dto.password.length < 8) {
    throw new BadRequestException('Password too short');
  }
  // ...
}

// In update-user.service.ts
async updateEmail(email: string) {
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new BadRequestException('Invalid email');
  }
  // ...
}
```

**✅ Good - Extract to reusable validator:**
```typescript
// validators/email.validator.ts
export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  static validate(email: string): void {
    if (!email.match(this.EMAIL_REGEX)) {
      throw new BadRequestException('Invalid email format');
    }
  }
}

// validators/password.validator.ts
export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  
  static validate(password: string): void {
    if (password.length < this.MIN_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${this.MIN_LENGTH} characters`
      );
    }
  }
}

// In services
async signup(dto: SignupDto) {
  EmailValidator.validate(dto.email);
  PasswordValidator.validate(dto.password);
  // ...
}
```

### Types of Duplication
1. **Exact duplication:** Identical code → Extract to function/method
2. **Structural duplication:** Same structure, different data → Parameterize
3. **Semantic duplication:** Different code, same intent → Unify the abstraction

### Action Items for Agent
- Identify repeated code blocks and suggest extraction
- Create utility functions, shared services, or base classes
- Use decorators for cross-cutting concerns (validation, logging)
- Suggest using inheritance or composition to share behavior
- Recommend creating custom validators or middleware

---

## 4. Long Function

**Principle:** Functions should do one thing and do it well. They should fit on a screen.

### The Problem
- Hard to understand and test
- Difficult to reuse parts of the logic
- Often violates Single Responsibility Principle
- Contains multiple levels of abstraction

### Detection Signs
- Functions longer than ~20-30 lines
- Multiple levels of indentation (nested conditions/loops)
- Comments separating sections (sign of multiple responsibilities)
- Difficulty naming the function (it does too much)
- Many local variables

### Refactoring Strategies

**❌ Bad - Long function doing many things:**
```typescript
async processOrder(orderId: string) {
  // Fetch order
  const order = await this.orderRepo.findById(orderId);
  if (!order) throw new NotFoundException();
  
  // Validate stock
  for (const item of order.items) {
    const product = await this.productRepo.findById(item.productId);
    if (product.stock < item.quantity) {
      throw new BadRequestException('Insufficient stock');
    }
  }
  
  // Calculate total
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  if (order.discountCode) {
    const discount = await this.discountRepo.findByCode(order.discountCode);
    total = total * (1 - discount.percentage / 100);
  }
  
  // Process payment
  const payment = await this.paymentGateway.charge(order.userId, total);
  if (!payment.success) throw new BadRequestException('Payment failed');
  
  // Update inventory
  for (const item of order.items) {
    await this.productRepo.decrementStock(item.productId, item.quantity);
  }
  
  // Send notifications
  const user = await this.userRepo.findById(order.userId);
  await this.emailService.send(user.email, 'Order Confirmed', ...);
  
  return { orderId, total, status: 'completed' };
}
```

**✅ Good - Extract cohesive functions:**
```typescript
async processOrder(orderId: string): Promise<OrderResult> {
  const order = await this.fetchAndValidateOrder(orderId);
  await this.validateInventory(order);
  
  const total = await this.calculateOrderTotal(order);
  await this.processPayment(order.userId, total);
  
  await this.updateInventory(order);
  await this.sendOrderConfirmation(order, total);
  
  return this.buildOrderResult(orderId, total);
}

private async fetchAndValidateOrder(orderId: string): Promise<Order> {
  const order = await this.orderRepo.findById(orderId);
  if (!order) {
    throw new NotFoundException('Order not found');
  }
  return order;
}

private async validateInventory(order: Order): Promise<void> {
  for (const item of order.items) {
    await this.validateItemStock(item);
  }
}

private async validateItemStock(item: OrderItem): Promise<void> {
  const product = await this.productRepo.findById(item.productId);
  if (product.stock < item.quantity) {
    throw new BadRequestException(
      `Insufficient stock for product ${item.productId}`
    );
  }
}

private async calculateOrderTotal(order: Order): Promise<number> {
  const subtotal = this.calculateSubtotal(order.items);
  return await this.applyDiscount(subtotal, order.discountCode);
}

// ... other extracted methods
```

### Benefits of Short Functions
- Each function has a clear, single purpose
- Easier to test independently
- Easier to name meaningfully
- More reusable
- Reveals the workflow through reading function names

### Action Items for Agent
- Extract logical sections into separate functions
- Extract complex conditions into predicate functions
- Extract loops into query/transformation functions
- Keep functions at one level of abstraction
- Suggest descriptive names for extracted functions

---

## 5. Long Parameter List

**Principle:** Functions should have few parameters, ideally 0-3. Many parameters indicate coupling.

### The Problem
- Hard to remember parameter order
- Hard to understand what function needs
- Changes require updating all call sites
- Often indicates the function is doing too much

### Detection Signs
- More than 3-4 parameters
- Many parameters of the same type
- Parameters that are always passed together
- Optional parameters or flags that change behavior

### Refactoring Strategies

**❌ Bad - Too many parameters:**
```typescript
function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  age: number,
  country: string,
  isVerified: boolean,
  newsletter: boolean,
  role: string
) {
  // ...
}

createUser(
  'user@example.com',
  'password123',
  'John',
  'Doe',
  30,
  'US',
  false,
  true,
  'user'
);
```

**✅ Good - Use parameter object:**
```typescript
interface CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly age: number;
  readonly country: string;
  readonly isVerified: boolean;
  readonly newsletter: boolean;
  readonly role: string;
}

function createUser(dto: CreateUserDto) {
  // ...
}

createUser({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  country: 'US',
  isVerified: false,
  newsletter: true,
  role: 'user',
});
```

**✅ Better - Use builder pattern or factory:**
```typescript
class UserBuilder {
  private dto: Partial<CreateUserDto> = {};
  
  withCredentials(email: string, password: string): this {
    this.dto.email = email;
    this.dto.password = password;
    return this;
  }
  
  withPersonalInfo(firstName: string, lastName: string, age: number): this {
    this.dto.firstName = firstName;
    this.dto.lastName = lastName;
    this.dto.age = age;
    return this;
  }
  
  withPreferences(newsletter: boolean): this {
    this.dto.newsletter = newsletter;
    return this;
  }
  
  build(): CreateUserDto {
    return this.dto as CreateUserDto;
  }
}

const user = new UserBuilder()
  .withCredentials('user@example.com', 'password123')
  .withPersonalInfo('John', 'Doe', 30)
  .withPreferences(true)
  .build();
```

### Other Strategies
- **Extract to class:** If parameters represent an object's state
- **Preserve whole object:** Pass object instead of individual properties
- **Split function:** If parameters indicate different responsibilities

**❌ Bad - Passing individual properties:**
```typescript
function sendEmail(
  userEmail: string,
  userName: string,
  userPreferredLanguage: string
) {
  // ...
}

sendEmail(user.email, user.name, user.preferredLanguage);
```

**✅ Good - Pass whole object:**
```typescript
function sendEmail(user: User) {
  // ...
}

sendEmail(user);
```

### Action Items for Agent
- Suggest creating DTOs or parameter objects for >3 parameters
- Identify parameters that naturally group together
- Recommend builder pattern for complex object creation
- Suggest splitting functions if parameters indicate multiple responsibilities

---

## 6. Global Data

**Principle:** Minimize global state. Prefer explicit dependencies and local scope.

### The Problem
- Hidden coupling between distant parts of code
- Hard to reason about who modifies what
- Difficult to test (global state persists between tests)
- Race conditions in concurrent environments
- Breaks encapsulation

### Detection Signs
- Global variables accessed from multiple modules
- Singleton pattern overuse
- Module-level mutable state
- Shared caches or registries without clear ownership

### Refactoring Strategies

**❌ Bad - Global configuration state:**
```typescript
// config.ts
export let config = {
  apiUrl: 'http://localhost:3000',
  timeout: 5000,
};

// Anywhere in the app
import { config } from './config';
config.timeout = 10000; // Mutation!

// service-a.ts
import { config } from './config';
fetch(config.apiUrl); // Which timeout value? Unclear!
```

**✅ Good - Encapsulated configuration:**
```typescript
// config.service.ts
@Injectable()
export class ConfigService {
  private readonly config: AppConfig;
  
  constructor() {
    this.config = this.loadConfig();
  }
  
  get apiUrl(): string {
    return this.config.apiUrl;
  }
  
  get timeout(): number {
    return this.config.timeout;
  }
  
  private loadConfig(): AppConfig {
    return {
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      timeout: parseInt(process.env.TIMEOUT) || 5000,
    };
  }
}

// service-a.ts
@Injectable()
export class ServiceA {
  constructor(private readonly config: ConfigService) {}
  
  async fetchData() {
    const url = this.config.apiUrl; // Clear dependency
    // ...
  }
}
```

**❌ Bad - Global cache:**
```typescript
// cache.ts
export const userCache = new Map<string, User>();

// user.service.ts
import { userCache } from './cache';
userCache.set(userId, user); // Global mutation
```

**✅ Good - Injected cache service:**
```typescript
// cache.service.ts
@Injectable()
export class CacheService {
  private readonly cache = new Map<string, any>();
  
  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }
  
  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }
}

// user.service.ts
@Injectable()
export class UserService {
  constructor(private readonly cache: CacheService) {}
  
  async getUser(userId: string): Promise<User> {
    const cached = this.cache.get<User>(`user:${userId}`);
    if (cached) return cached;
    
    const user = await this.repository.findById(userId);
    this.cache.set(`user:${userId}`, user);
    return user;
  }
}
```

### Acceptable Global Data
- **Truly immutable constants:**
  ```typescript
  export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  export const SUPPORTED_FORMATS = ['jpg', 'png', 'gif'] as const;
  ```
- **Environment variables (read-only):**
  ```typescript
  const PORT = process.env.PORT || 3000;
  ```

### Action Items for Agent
- Convert global variables to injected dependencies
- Suggest dependency injection for shared state
- Recommend making data immutable where possible
- Extract globals into service classes
- Make implicit dependencies explicit through constructors

---

## 7. Mutable Data

**Principle:** Prefer immutability. Mutation is a source of bugs and makes reasoning about code harder.

### The Problem
- Unexpected side effects
- Hard to track where data changes
- Difficult to debug (who changed this?)
- Breaks assumptions in other parts of the code
- Makes concurrent programming dangerous

### Detection Signs
- Functions that modify their parameters
- Returning references to internal mutable state
- Mutating objects passed to functions
- Using `let` when `const` would suffice
- Array methods that mutate (`push`, `splice` vs `concat`, `filter`)

### Refactoring Strategies

**❌ Bad - Mutating parameters:**
```typescript
function applyDiscount(order: Order, discountRate: number): Order {
  order.total = order.total * (1 - discountRate); // Mutation!
  order.discountApplied = true; // Mutation!
  return order;
}

const order = { total: 100, discountApplied: false };
const discounted = applyDiscount(order, 0.1);
console.log(order.total); // 90 - Original mutated! 😱
```

**✅ Good - Return new object:**
```typescript
function applyDiscount(order: Order, discountRate: number): Order {
  return {
    ...order,
    total: order.total * (1 - discountRate),
    discountApplied: true,
  };
}

const order = { total: 100, discountApplied: false };
const discounted = applyDiscount(order, 0.1);
console.log(order.total); // 100 - Original unchanged ✅
console.log(discounted.total); // 90
```

**❌ Bad - Mutating arrays:**
```typescript
function addItem(cart: CartItem[], item: CartItem): CartItem[] {
  cart.push(item); // Mutation!
  return cart;
}
```

**✅ Good - Return new array:**
```typescript
function addItem(cart: CartItem[], item: CartItem): CartItem[] {
  return [...cart, item];
}
```

**❌ Bad - Exposing mutable internal state:**
```typescript
class UserService {
  private users: User[] = [];
  
  getUsers(): User[] {
    return this.users; // Exposes mutable reference!
  }
}

const users = service.getUsers();
users.push(hacker); // Internal state mutated! 😱
```

**✅ Good - Return defensive copy:**
```typescript
class UserService {
  private readonly users: User[] = [];
  
  getUsers(): readonly User[] {
    return [...this.users]; // Defensive copy
  }
}
```

### Using TypeScript's Readonly
```typescript
interface User {
  readonly id: string;
  readonly email: string;
  readonly role: string;
}

function promoteUser(user: User): User {
  // user.role = 'admin'; // TypeScript error! ✅
  return { ...user, role: 'admin' }; // Must create new object
}

// For arrays and complex objects
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### When Mutation is Acceptable
- **Local scope only:** Mutate local variables that don't escape the function
  ```typescript
  function processItems(items: Item[]): Summary {
    let total = 0; // Local mutation is fine
    for (const item of items) {
      total += item.price;
    }
    return { total };
  }
  ```
- **Performance-critical code:** After profiling proves it's necessary
- **Builder pattern:** When constructing complex objects

### Action Items for Agent
- Suggest using `const` instead of `let` where possible
- Recommend spreading or cloning instead of mutating
- Add `readonly` modifiers to TypeScript interfaces
- Use immutable array methods (`map`, `filter`, `reduce`) instead of `push`, `splice`
- Create new objects instead of modifying existing ones
- Return defensive copies when exposing internal state

---

## 8. Feature Envy

**Principle:** A method should be primarily interested in the data of its own class, not other classes.

### The Problem
- Violates encapsulation
- Data and behavior are separated
- Code is in the wrong place
- High coupling between classes

### Detection Signs
- Methods that use more methods/properties of another class than its own
- Excessive chaining to get data from other objects
- Methods that seem to belong to another class
- Lots of parameters from or calls to the same external class

### Refactoring Strategies

**❌ Bad - Feature envy:**
```typescript
class OrderService {
  calculateDiscount(order: Order): number {
    let discount = 0;
    
    // Envying User class
    if (order.user.isPremium()) {
      discount += 0.1;
    }
    if (order.user.getYearsSinceRegistration() > 5) {
      discount += 0.05;
    }
    if (order.user.getTotalPurchases() > 1000) {
      discount += 0.15;
    }
    
    return discount;
  }
}
```

**✅ Good - Move behavior to data:**
```typescript
class User {
  isPremium(): boolean {
    return this.premiumStatus;
  }
  
  getYearsSinceRegistration(): number {
    // ...
  }
  
  getTotalPurchases(): number {
    // ...
  }
  
  // Behavior lives with data
  calculateLoyaltyDiscount(): number {
    let discount = 0;
    
    if (this.isPremium()) {
      discount += 0.1;
    }
    if (this.getYearsSinceRegistration() > 5) {
      discount += 0.05;
    }
    if (this.getTotalPurchases() > 1000) {
      discount += 0.15;
    }
    
    return discount;
  }
}

class OrderService {
  calculateDiscount(order: Order): number {
    return order.user.calculateLoyaltyDiscount();
  }
}
```

**Another Example:**

**❌ Bad - Shopping cart calculation outside cart:**
```typescript
class CheckoutService {
  calculateTotal(cart: ShoppingCart): number {
    let total = 0;
    
    for (const item of cart.getItems()) {
      total += item.getPrice() * item.getQuantity();
    }
    
    if (cart.hasPromoCode()) {
      total = total * (1 - cart.getPromoCode().getDiscount());
    }
    
    total += this.calculateShipping(cart.getItems());
    
    return total;
  }
}
```

**✅ Good - Cart calculates its own total:**
```typescript
class ShoppingCart {
  private items: CartItem[];
  private promoCode?: PromoCode;
  
  calculateSubtotal(): number {
    return this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
  
  calculateTotal(): number {
    let total = this.calculateSubtotal();
    
    if (this.promoCode) {
      total = total * (1 - this.promoCode.discount);
    }
    
    total += this.calculateShipping();
    
    return total;
  }
  
  private calculateShipping(): number {
    // Shipping logic
  }
}

class CheckoutService {
  calculateTotal(cart: ShoppingCart): number {
    return cart.calculateTotal(); // Simple delegation
  }
}
```

### When Feature Envy is Acceptable
- **Strategy Pattern:** When deliberately separating algorithm from data
- **Visitor Pattern:** When operations must be external
- **DTOs/Value Objects:** Simple data carriers without behavior

### Action Items for Agent
- Identify methods using excessive data/methods from another class
- Suggest moving the method to the class it's envious of
- Extract methods that operate on external data
- Recommend Tell, Don't Ask principle
- Suggest enriching domain models with behavior

---

## 9. Primitive Obsession

**Principle:** Use small objects for simple tasks like money, ranges, phone numbers, etc. Don't use primitives everywhere.

### The Problem
- Lost type safety and validation
- Business rules scattered across codebase
- No centralized logic for domain concepts
- Easy to pass wrong values

### Detection Signs
- Using strings/numbers for domain concepts
- Repeated validation logic
- Magic constants scattered in code
- Comments explaining what primitive represents
- Type aliases without behavior

### Refactoring Strategies

**❌ Bad - Primitives for domain concepts:**
```typescript
class User {
  email: string; // Just a string 😞
  phone: string; // Any string accepted
  age: number; // Could be negative!
}

function createUser(email: string, phone: string, age: number): User {
  // Validation scattered
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (!/^\+?[\d\s-]+$/.test(phone)) {
    throw new Error('Invalid phone');
  }
  if (age < 0 || age > 150) {
    throw new Error('Invalid age');
  }
  
  return { email, phone, age };
}
```

**✅ Good - Value objects:**
```typescript
class Email {
  private readonly value: string;
  
  private constructor(value: string) {
    this.value = value;
  }
  
  static create(value: string): Email {
    if (!this.isValid(value)) {
      throw new Error('Invalid email format');
    }
    return new Email(value);
  }
  
  private static isValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  
  toString(): string {
    return this.value;
  }
  
  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

class PhoneNumber {
  private readonly value: string;
  
  private constructor(value: string) {
    this.value = value;
  }
  
  static create(value: string): PhoneNumber {
    const normalized = value.replace(/[\s-]/g, '');
    if (!/^\+?[\d]{10,15}$/.test(normalized)) {
      throw new Error('Invalid phone number');
    }
    return new PhoneNumber(normalized);
  }
  
  toString(): string {
    return this.value;
  }
}

class Age {
  private readonly value: number;
  
  private constructor(value: number) {
    this.value = value;
  }
  
  static create(value: number): Age {
    if (value < 0 || value > 150) {
      throw new Error('Age must be between 0 and 150');
    }
    return new Age(value);
  }
  
  toNumber(): number {
    return this.value;
  }
  
  isAdult(): boolean {
    return this.value >= 18;
  }
}

class User {
  constructor(
    readonly email: Email,
    readonly phone: PhoneNumber,
    readonly age: Age
  ) {}
}

// Usage with type safety
const user = new User(
  Email.create('user@example.com'),
  PhoneNumber.create('+1-555-0100'),
  Age.create(25)
);

// user.email = 'invalid'; // Type error! ✅
// Email.create('invalid'); // Runtime error! ✅
```

**More Examples:**

**❌ Bad - Money as number:**
```typescript
let price = 19.99;
let tax = 1.50;
let total = price + tax; // Could be floating point error
```

**✅ Good - Money class:**
```typescript
class Money {
  private readonly amount: number;
  private readonly currency: string;
  
  constructor(amount: number, currency: string = 'USD') {
    this.amount = Math.round(amount * 100); // Store as cents
    this.currency = currency;
  }
  
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money((this.amount + other.amount) / 100, this.currency);
  }
  
  toNumber(): number {
    return this.amount / 100;
  }
  
  format(): string {
    return `${this.currency} ${this.toNumber().toFixed(2)}`;
  }
}

const price = new Money(19.99);
const tax = new Money(1.50);
const total = price.add(tax);
console.log(total.format()); // "USD 21.49"
```

**❌ Bad - Date range as two primitives:**
```typescript
function bookRoom(startDate: string, endDate: string) {
  // Validation scattered
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error('Invalid range');
  }
  // ...
}
```

**✅ Good - DateRange value object:**
```typescript
class DateRange {
  private constructor(
    readonly start: Date,
    readonly end: Date
  ) {}
  
  static create(start: Date, end: Date): DateRange {
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }
    return new DateRange(start, end);
  }
  
  getDays(): number {
    return Math.ceil(
      (this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  
  overlaps(other: DateRange): boolean {
    return this.start < other.end && this.end > other.start;
  }
}

function bookRoom(range: DateRange) {
  // Validation built-in, rich API available
  const days = range.getDays();
  // ...
}
```

### Benefits of Value Objects
- **Validation in one place:** All instances are guaranteed valid
- **Type safety:** Can't pass wrong type by accident
- **Rich behavior:** Methods that operate on the data
- **Immutability:** Value objects are typically immutable
- **Self-documenting:** `Email` is clearer than `string`

### Action Items for Agent
- Identify repeated validation patterns
- Suggest creating value objects for domain concepts
- Look for primitives that represent business concepts
- Recommend small classes for money, dates, measurements, identifiers
- Ensure value objects are immutable
- Add domain-specific methods to value objects

---

## 10. Message Chains

**Principle:** Avoid long chains of method calls or property access. They create tight coupling.

### The Problem
- High coupling (Law of Demeter violation)
- Fragile code (breaks if intermediate structure changes)
- Hard to test
- Difficult to mock
- Exposes internal structure

### Detection Signs
- Long chains: `a.b().c().d().e()`
- Property chains: `order.customer.address.city.zipCode`
- Multiple levels of navigation
- Reaching through objects to get data

### Refactoring Strategies

**❌ Bad - Message chains:**
```typescript
class OrderProcessor {
  process(order: Order) {
    // Chain to get customer's city
    const city = order.getCustomer().getAddress().getCity();
    
    // Chain to get shipping cost
    const cost = order
      .getShippingMethod()
      .getProvider()
      .getPriceCalculator()
      .calculate(city);
    
    // Chain to update status
    order
      .getCustomer()
      .getNotificationSettings()
      .sendEmail(`Shipping cost: ${cost}`);
  }
}
```

**✅ Good - Hide delegation:**
```typescript
class Order {
  private customer: Customer;
  private shippingMethod: ShippingMethod;
  
  // Hide the chain
  getCustomerCity(): string {
    return this.customer.getCity();
  }
  
  calculateShippingCost(): number {
    return this.shippingMethod.calculateCost(this.getCustomerCity());
  }
  
  notifyCustomer(message: string): void {
    this.customer.sendNotification(message);
  }
}

class Customer {
  private address: Address;
  private notificationSettings: NotificationSettings;
  
  getCity(): string {
    return this.address.city;
  }
  
  sendNotification(message: string): void {
    this.notificationSettings.sendEmail(message);
  }
}

class ShippingMethod {
  private provider: ShippingProvider;
  
  calculateCost(city: string): number {
    return this.provider.calculatePrice(city);
  }
}

// Now the processor is simple
class OrderProcessor {
  process(order: Order) {
    const cost = order.calculateShippingCost();
    order.notifyCustomer(`Shipping cost: ${cost}`);
  }
}
```

**Another Example:**

**❌ Bad - Navigating deep structures:**
```typescript
function getManagerEmail(employee: Employee): string {
  return employee
    .getDepartment()
    .getManager()
    .getContactInfo()
    .getEmail();
}
```

**✅ Good - Ask direct question:**
```typescript
class Employee {
  getManagerEmail(): string {
    return this.department.getManagerEmail();
  }
}

class Department {
  getManagerEmail(): string {
    return this.manager.getEmail();
  }
}

class Manager {
  getEmail(): string {
    return this.contactInfo.email;
  }
}

// Simple call
function getManagerEmail(employee: Employee): string {
  return employee.getManagerEmail();
}
```

### Law of Demeter (LoD)

**"Talk to friends, not strangers"**

A method should only call methods on:
1. **Itself** (`this.method()`)
2. **Objects passed as parameters** (`parameter.method()`)
3. **Objects it creates** (`new Object().method()`)
4. **Direct properties/fields** (`this.field.method()`)

**Should NOT call methods on objects returned by other calls:**
```typescript
// ❌ Violates LoD
object.getChild().getGrandchild().method();

// ✅ Follows LoD
object.methodThatDelegatesToChild();
```

### Exception: Fluent Interfaces
Message chains are acceptable when they're part of a fluent API design:
```typescript
// ✅ This is fine - fluent builder
const query = queryBuilder
  .select('*')
  .from('users')
  .where('age', '>', 18)
  .orderBy('name')
  .limit(10)
  .build();
```

### Action Items for Agent
- Identify chains of method calls longer than 2
- Suggest adding delegating methods to intermediate objects
- Recommend Tell, Don't Ask principle
- Extract chain into a well-named method
- Ensure objects hide their internal structure

---

## Summary: Detecting and Refactoring

When reviewing code, follow this process:

### 1. Identify Smells
Use these heuristics to spot issues:
- **Naming:** Can you understand code without reading implementation?
- **Size:** Functions > 20 lines, classes > 200 lines, parameters > 3
- **Duplication:** Copy-paste patterns, similar code blocks
- **Coupling:** Chains, feature envy, global data
- **Comments:** Explaining what instead of why

### 2. Prioritize Refactoring
Not all smells need immediate fixing. Prioritize by:
- **Change frequency:** Code that changes often should be clean
- **Bug density:** Areas with many bugs benefit from refactoring
- **Complexity:** High cyclomatic complexity areas
- **Team pain:** What slows down development?

### 3. Refactor Safely
- **Have tests first:** Ensure behavior is preserved
- **Small steps:** One refactoring at a time
- **Run tests frequently:** After each change
- **Commit often:** Make it easy to revert

### 4. Common Refactoring Patterns
- **Extract Method/Function:** Long functions → smaller functions
- **Extract Class:** Large classes → multiple smaller classes
- **Introduce Parameter Object:** Long parameter lists → objects
- **Replace Primitive with Object:** Primitives → value objects
- **Move Method:** Feature envy → move method to appropriate class
- **Hide Delegate:** Message chains → delegating methods
- **Replace Temp with Query:** Temporary variables → methods
- **Substitute Algorithm:** Complex logic → clearer implementation

---

## When to Apply These Principles

### Always Apply
- Meaningful names
- No duplication
- Short functions (aim for <20 lines)
- Immutability where practical

### Apply Based on Context
- **Value objects:** For important domain concepts
- **Long parameter lists:** When > 3-4 parameters
- **Feature envy:** When behavior clearly belongs elsewhere
- **Message chains:** When coupling becomes problematic

### Don't Overdo It
- **Premature abstraction:** Don't create abstractions until patterns emerge
- **Over-engineering:** Simple code is better than clever code
- **Gold-plating:** Don't refactor stable code that works fine

---

## Agent Guidelines

When reviewing or writing code:

1. **First pass - Critical smells:**
   - Fix naming issues immediately
   - Remove obvious duplication
   - Break up very long functions (>50 lines)

2. **Second pass - Design smells:**
   - Address feature envy
   - Reduce coupling (message chains)
   - Introduce value objects for key concepts

3. **Always:**
   - Suggest refactorings, don't demand them
   - Explain WHY a smell is problematic
   - Provide concrete before/after examples
   - Consider the context and trade-offs
   - Ensure tests exist before refactoring

4. **When suggesting refactoring:**
   - Start with the user's immediate problem
   - Propose incremental improvements
   - Explain benefits clearly
   - Acknowledge when current code is "good enough"
