import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { User } from '../user/decorators/user.decorator';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';

import { PropertyType, UserType } from '@prisma/client';
import { AuthGuard } from '../guards/auth.guards';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: CreateHomeDto, @User() user) {
    return this.homeService.create(body, user.id);
  }

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    console.log({ city, minPrice, maxPrice, propertyType });

    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };
    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHome(@Param('id') id: string) {
    return this.homeService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateHomeDto,
    @User() user,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return this.homeService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @User() user) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return this.homeService.remove(id);
  }
}
