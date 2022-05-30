import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';
interface SignupParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signup({ email, password, name, phone }: SignupParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log({ hashedPassword });

    const user = await this.prismaService.user.create({
      data: {
        email,
        phone,
        name,
        password: hashedPassword,
        user_type: UserType.BUYER,
      },
    });

    //generate the token
    const token = await jwt.sign(
      {
        name,
        id: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
    );
    return {user, token};
  }
}
