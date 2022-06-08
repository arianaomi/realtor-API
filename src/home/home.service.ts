import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { ignoreElements } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHomeDto, HomeResponseDto } from './dto/home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';

interface GetHomesParam {
  city?: string;
  price: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParam {
  address: string;
  city: string;
  landSize: number;
  numberOfBathrooms: number;
  numberOfBedrooms: number;
  price: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  city?: string;
  landSize?: number;
  numberOfBathrooms?: number;
  numberOfBedrooms?: number;
  price?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filters: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });

    if (!homes.length) {
      throw new NotFoundException('No homes found');
    }
    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.image;
      return new HomeResponseDto(fetchHome);
    });
  }

  async create(
    {
      address,
      city,
      landSize,
      numberOfBedrooms,
      numberOfBathrooms,
      price,
      propertyType,
      images,
    }: CreateHomeParam,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        city,
        land_size: landSize,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        price,
        propertyType,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.prismaService.image.createMany({
      data: homeImages,
    });

    if (!home) {
      throw new NotFoundException('No home found');
    }

    return new HomeResponseDto(home);
  }

  async findOne(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!home) {
      throw new NotFoundException('No home found');
    }

    return new HomeResponseDto(home);
  }

  async update(id: number, data: UpdateHomeParams) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException('No home found');
    }
    const updateHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });
    return new HomeResponseDto(updateHome);
  }

  async remove(id: number) {
    await this.prismaService.image.deleteMany({
      where: {
        home_id: id,
      },
    });

    await this.prismaService.home.delete({
      where: {
        id,
      },
    });
  }

  async getRealtorByHomeId(id: number) {
    console.log(id)
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
            id: true,
          },
        },
      },
    });
    if (!home) throw new NotFoundException();

    return home.realtor;
  }
}
