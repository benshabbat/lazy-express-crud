import bcrypt from 'bcryptjs';

interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface UserInput {
  username: string;
  email: string;
  password: string;
}

type UserWithoutPassword = Omit<UserData, 'password'>;

class User {
  private users: UserData[] = []; // In-memory storage - replace with database

  async create(userData: UserInput): Promise<UserWithoutPassword> {
    // Security: Input validation
    if (!userData.email || typeof userData.email !== 'string' || userData.email.length > 255) {
      throw new Error('Invalid email');
    }
    if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6 || userData.password.length > 128) {
      throw new Error('Password must be between 6 and 128 characters');
    }
    if (!userData.username || typeof userData.username !== 'string' || userData.username.length > 100) {
      throw new Error('Invalid username');
    }

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user: UserData = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date()
    };

    this.users.push(user);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<UserData | undefined> {
    // Security: Input validation
    if (!email || typeof email !== 'string' || email.length > 255) {
      throw new Error('Invalid email');
    }
    return this.users.find(u => u.email === email);
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    // Security: Input validation
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new Error('Invalid id');
    }
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // Security: Input validation
    if (!plainPassword || typeof plainPassword !== 'string' || plainPassword.length > 128) {
      throw new Error('Invalid password');
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new User();
