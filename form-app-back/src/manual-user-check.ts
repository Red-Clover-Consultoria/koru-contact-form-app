
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcryptjs';

async function manualReset() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const authService = app.get(AuthService);

  // Try to find the admin user. Based on history it might be 'ksimari@redclover.com.ar' or just 'admin'
  const emailsToCheck = ['ksimari@redclover.com.ar', 'simarikaren@gmail.com', 'admin@redclover.com.ar'];
  
  for (const email of emailsToCheck) {
      // Accessing the model directly might be hard if not exported from service, 
      // but UsersService has create/update. It doesn't have findOneByEmail public method usually, 
      // let's check UsersService again.
      // Wait, in step 17, UsersService had `findOne(id)` but not findByEmail specifically public? 
      // Ah, step 17 shows: `async create(createUserDto)` checks `this.userModel.findOne({ email })`.
      // It has `findAll()`. I can filter.
  }
  
  // Actually, I can just use the Model if I can get it. 
  // Easier: List all users and print them.
  console.log('Listing all users:');
  const users = await usersService.findAll();
  console.log(users);
  
  // Ask user which one to reset or just reset the likely admin.
  
  await app.close();
}

manualReset();
