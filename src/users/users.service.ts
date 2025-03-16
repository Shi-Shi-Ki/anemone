import { Injectable } from '@nestjs/common';

export type User = {
  id: number;
  name: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 1,
      name: 'takuya',
      password: 'takuya',
    },
    {
      id: 2,
      name: 'rina',
      password: 'rina',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.name === username);
  }
}
